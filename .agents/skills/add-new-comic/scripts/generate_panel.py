from __future__ import annotations

import random
import re
from pathlib import Path

from PIL import Image, ImageDraw, ImageOps

from models import ComicSpec, GenerationConfig, PanelSpec

_PIPELINE = None
_PIPELINE_KEY = None

STYLE_PROMPT = (
    "single plain wordless comic illustration, clean green line sketch on solid black background, "
    "thin unfilled strokes, simple Dev, boxy Clanker, comic art only"
)

# Normalized crop boxes for art-reference/training-reference.png.  The sheet is
# intentionally clean and black-backed; cropping lets IP-Adapter see large
# character examples instead of a tiny downscaled full character sheet.
TRAINING_REFERENCE_CROPS: dict[str, tuple[float, float, float, float]] = {
    "clanker_neutral_body": (0.013, 0.026, 0.101, 0.271),
    "clanker_happy_body": (0.106, 0.026, 0.193, 0.271),
    "clanker_side_body": (0.382, 0.026, 0.430, 0.270),
    "clanker_at_laptop": (0.720, 0.043, 0.859, 0.272),
    "clanker_neutral_face": (0.019, 0.297, 0.100, 0.492),
    "clanker_happy_face": (0.119, 0.298, 0.210, 0.492),
    "clanker_thinking_face": (0.322, 0.300, 0.403, 0.492),
    "clanker_concerned_face": (0.423, 0.299, 0.503, 0.492),
    "clanker_overheated_face": (0.632, 0.300, 0.727, 0.492),
    "clanker_heart_face": (0.749, 0.299, 0.829, 0.492),
    "dev_neutral_body": (0.024, 0.523, 0.080, 0.729),
    "dev_mug_body": (0.105, 0.523, 0.161, 0.729),
    "dev_laptop_body": (0.286, 0.536, 0.370, 0.727),
    "dev_seated_laptop": (0.387, 0.537, 0.508, 0.728),
    "dev_thumbs_body": (0.544, 0.523, 0.618, 0.726),
    "dev_excited_body": (0.796, 0.525, 0.885, 0.723),
    "dev_running_body": (0.896, 0.526, 0.989, 0.723),
    "dev_neutral_face": (0.020, 0.775, 0.084, 0.915),
    "dev_happy_face": (0.106, 0.775, 0.170, 0.915),
    "dev_confused_face": (0.193, 0.776, 0.257, 0.915),
    "dev_frown_face": (0.279, 0.776, 0.343, 0.914),
    "dev_panic_face": (0.443, 0.768, 0.537, 0.914),
    "dev_love_face": (0.752, 0.762, 0.906, 0.917),
}

# Normalized crop boxes for art-reference/ip-character-reference.png.  The
# source file is a good high-quality style anchor, but the full image contains
# two large black character cards and baseline shadows that SDXL tends to copy
# as stray background panels.  Auto-cropping feeds just the characters to
# IP-Adapter while keeping the high-resolution proportions/style signal.
IP_CHARACTER_REFERENCE_CROPS: dict[str, tuple[float, float, float, float]] = {
    "ip_dev_full": (0.080, 0.085, 0.270, 0.555),
    "ip_clanker_full": (0.385, 0.088, 0.620, 0.560),
}

BASE_REFERENCE_CROPS = [
    "dev_neutral_body",
    "clanker_neutral_body",
    "dev_laptop_body",
    "clanker_happy_body",
]

# Extra pose crops used only for auto ControlNet guides. These are cut from
# the clean art-reference sheets so the guide itself has the same proportions
# as the target comic instead of a generic stick-figure sketch.
CONTROL_REFERENCE_SPRITES: dict[str, tuple[str, tuple[float, float, float, float]]] = {
    **{name: ("training-reference.png", box) for name, box in TRAINING_REFERENCE_CROPS.items()},
    "dev_pose_overwhelmed": ("dev-poses-sheet.png", (0.845, 0.285, 0.940, 0.470)),
    "dev_pose_collapsed": ("dev-poses-sheet.png", (0.345, 0.590, 0.485, 0.775)),
    "dev_pose_dead": ("dev-poses-sheet.png", (0.505, 0.570, 0.640, 0.775)),
    "dev_pose_slumped": ("dev-poses-sheet.png", (0.170, 0.600, 0.325, 0.755)),
    "dev_pose_zombie": ("dev-poses-sheet.png", (0.655, 0.600, 0.790, 0.790)),
}

_CONTROL_SPRITE_CACHE: dict[tuple[str, str], Image.Image] = {}


def _torch_dtype(torch, dtype_name: str):
    return {
        "float16": torch.float16,
        "bfloat16": torch.bfloat16,
        "float32": torch.float32,
    }[dtype_name]


def _pipeline_key(config: GenerationConfig) -> tuple[object, ...]:
    return (
        config.modelId,
        config.enableControlNet,
        config.controlNetModelId,
        config.ipAdapterRepo,
        config.ipAdapterSubfolder,
        config.ipAdapterWeight,
        config.ipAdapterScale,
        config.device,
        config.torchDtype,
    )


def load_pipeline(config: GenerationConfig):
    global _PIPELINE, _PIPELINE_KEY
    key = _pipeline_key(config)
    if _PIPELINE is not None and _PIPELINE_KEY == key:
        return _PIPELINE

    import torch
    from diffusers import ControlNetModel, StableDiffusionXLControlNetPipeline, StableDiffusionXLPipeline

    if config.device == "cuda" and not torch.cuda.is_available():
        raise RuntimeError("CUDA was requested but torch.cuda.is_available() is false")

    dtype = _torch_dtype(torch, config.torchDtype)
    variant = "fp16" if config.torchDtype == "float16" else None

    if config.enableControlNet:
        controlnet = ControlNetModel.from_pretrained(
            config.controlNetModelId,
            torch_dtype=dtype,
            use_safetensors=True,
        )
        pipe = StableDiffusionXLControlNetPipeline.from_pretrained(
            config.modelId,
            controlnet=controlnet,
            torch_dtype=dtype,
            use_safetensors=True,
            variant=variant,
        )
    else:
        pipe = StableDiffusionXLPipeline.from_pretrained(
            config.modelId,
            torch_dtype=dtype,
            use_safetensors=True,
            variant=variant,
        )

    pipe.load_ip_adapter(
        config.ipAdapterRepo,
        subfolder=config.ipAdapterSubfolder,
        weight_name=config.ipAdapterWeight,
    )
    pipe.set_ip_adapter_scale(config.ipAdapterScale)

    if config.device == "cuda" and config.enableSequentialCpuOffload and hasattr(pipe, "enable_sequential_cpu_offload"):
        # SDXL + IP-Adapter + ControlNet does not fit reliably in 12 GB with
        # model-level offload. Sequential offload is slower but keeps the full
        # quality path usable on the target RTX 3080 Ti.
        pipe.enable_sequential_cpu_offload()
    elif config.device == "cuda" and config.enableModelCpuOffload:
        pipe.enable_model_cpu_offload()
    else:
        pipe.to(config.device)

    if config.enableVaeSlicing and hasattr(pipe, "enable_vae_slicing"):
        pipe.enable_vae_slicing()
    if config.enableVaeTiling and hasattr(pipe, "enable_vae_tiling"):
        pipe.enable_vae_tiling()
    if config.enableAttentionSlicing and hasattr(pipe, "enable_attention_slicing"):
        pipe.enable_attention_slicing()

    _PIPELINE = pipe
    _PIPELINE_KEY = key
    return pipe


def release_pipeline(device: str = "cuda") -> None:
    global _PIPELINE, _PIPELINE_KEY
    if _PIPELINE is None:
        return

    pipe = _PIPELINE
    _PIPELINE = None
    _PIPELINE_KEY = None

    try:
        if hasattr(pipe, "maybe_free_model_hooks"):
            pipe.maybe_free_model_hooks()
    except Exception:
        pass
    try:
        pipe.to("cpu")
    except Exception:
        pass

    del pipe

    import gc

    gc.collect()
    if device == "cuda":
        try:
            import torch

            torch.cuda.empty_cache()
            torch.cuda.ipc_collect()
        except Exception:
            pass


def compact_visual_text(text: str) -> str:
    replacements = {
        "Dev, a human software developer with simple rectangular glasses": "Dev",
        "a human software developer with simple rectangular glasses": "Dev",
        "Clanker, a helpful boxy robot assistant with screen eyes and antenna": "Clanker",
        "Clanker, a boxy robot assistant with screen eyes and antenna": "Clanker",
        "a helpful boxy robot assistant with screen eyes and antenna": "Clanker",
        "a boxy robot assistant with screen eyes and antenna": "Clanker",
        "pure black terminal room": "plain black room",
        "pure black terminal workspace": "plain black workspace",
        "dark neon terminal room": "plain black room",
        "black neon terminal room": "plain black room",
        "black terminal room": "plain black room",
        "dark neon terminal workspace": "plain black workspace",
        "black neon terminal workspace": "plain black workspace",
        "black terminal workspace": "plain black workspace",
        "green screen glow": "terminal lines",
        "small green suggestion glow": "small cursor",
        "boot-up glow": "boot-up cursor",
        "terminal boot glow": "boot cursor",
        "glowing laptop": "laptop",
        "glowing": "terminal",
        "glows": "shows",
        "glow": "terminal line",
        "in the same neon terminal room with a confident robot grin on its screen eyes while": "while",
        "in a plain black room while": "while",
        "in a black terminal room while": "while",
        "sparks and tiny green debris implying the source code vanished": "sparks and debris",
        "sparse dark upper area reserved for speech bubbles": "empty dark top",
        "dark upper area reserved for a speech bubble": "empty dark top",
        "empty dark upper area": "empty top",
        "empty top area": "empty top",
        "terminal line energy": "simple motion lines",
        "terminal cursor": "small cursor",
        "terminal laptop": "laptop",
        "Dev on the left": "Dev left",
        "Clanker on the right": "Clanker right",
        "on the left at the laptop": "left at laptop",
        "on the right in a triumphant pose": "right triumphant",
        "on the left": "left",
        "on the right": "right",
        "overwhelmed Dev on the left": "Dev left panicked",
        "laptop screen centered": "laptop center",
        "leans in helpfully with one claw raised": "stands helpfully",
        "laptop foreground": "laptop",
        "foreground": "",
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    text = re.sub(r"\b(Dev|Clanker),\s*", r"\1 ", text)
    return re.sub(r"\s+", " ", text).strip()


def limit_words(text: str, max_words: int) -> str:
    words = text.split()
    return " ".join(words[:max_words])


def build_prompt(comic: ComicSpec, panel: PanelSpec, panel_number: int) -> str:
    # CLIP token limits are tight. Put the house style first, then a compact
    # scene description; the reference-derived ControlNet guide carries layout.
    parts = [
        STYLE_PROMPT,
        f"{panel.shot} shot, full bodies",
        limit_words(compact_visual_text(panel.artPrompt), 22),
    ]
    return ". ".join(part.strip().rstrip(".") for part in parts if part and part.strip()) + "."


def _panel_text(panel: PanelSpec) -> str:
    dialogue = " ".join(line.text for line in panel.dialogue)
    return " ".join(
        part
        for part in [panel.artPrompt, panel.composition or "", panel.caption or "", dialogue]
        if part
    ).lower()


def _has_any(text: str, words: tuple[str, ...]) -> bool:
    return any(word in text for word in words)


def reference_crop_names_for_panel(panel: PanelSpec) -> list[str]:
    text = _panel_text(panel)
    names = list(BASE_REFERENCE_CROPS)

    if _has_any(text, ("laptop", "typing", "terminal", "desk", "seated", "nvim")):
        names.extend(["dev_seated_laptop", "clanker_at_laptop"])
    if _has_any(text, ("excited", "wow", "hype", "hyped", "celebrat", "triumphant", "proud", "confident")):
        names.extend(["dev_excited_body", "dev_happy_face", "clanker_happy_face"])
    if _has_any(text, ("panic", "panicked", "overwhelmed", "chaos", "sweat", "holy", "sparks", "overclock")):
        names.extend(["dev_panic_face", "clanker_overheated_face"])
    if _has_any(text, ("dead", "collapsed", "floor", "burnout", "flat", "concerned")):
        names.extend(["dev_frown_face", "clanker_concerned_face"])
    if _has_any(text, ("thinking", "confused", "curious", "question")):
        names.extend(["dev_confused_face", "clanker_thinking_face"])
    if _has_any(text, ("coffee", "mug")):
        names.append("dev_mug_body")
    if _has_any(text, ("running", "run")):
        names.append("dev_running_body")
    if _has_any(text, ("love", "heart")):
        names.extend(["dev_love_face", "clanker_heart_face"])

    # Keep order stable but remove duplicates.
    return list(dict.fromkeys(names))


def square_on_black(image: Image.Image, size: int = 512) -> Image.Image:
    image = ImageOps.exif_transpose(image).convert("RGB")
    image = ImageOps.contain(image, (size, size), method=Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", (size, size), "#020806")
    canvas.paste(image, ((size - image.width) // 2, (size - image.height) // 2))
    return canvas


def crop_normalized(image: Image.Image, box: tuple[float, float, float, float]) -> Image.Image:
    width, height = image.size
    left, top, right, bottom = box
    crop_box = (
        max(0, round(left * width)),
        max(0, round(top * height)),
        min(width, round(right * width)),
        min(height, round(bottom * height)),
    )
    return image.crop(crop_box)


def _expanded_bbox(box: tuple[int, int, int, int], size: tuple[int, int], padding: int = 10) -> tuple[int, int, int, int]:
    left, top, right, bottom = box
    width, height = size
    return (
        max(0, left - padding),
        max(0, top - padding),
        min(width, right + padding),
        min(height, bottom + padding),
    )


def control_reference_sprite(project_root: Path, name: str) -> Image.Image | None:
    spec = CONTROL_REFERENCE_SPRITES.get(name)
    if spec is None:
        return None

    cache_key = (str(project_root.resolve()), name)
    cached = _CONTROL_SPRITE_CACHE.get(cache_key)
    if cached is not None:
        return cached.copy()

    source_name, box = spec
    path = project_root / "art-reference" / source_name
    if not path.exists():
        return None

    crop = crop_normalized(Image.open(path).convert("RGB"), box)
    alpha = ImageOps.grayscale(crop).point(lambda p: 0 if p < 28 else min(255, p * 2))
    bbox = alpha.getbbox()
    if bbox is None:
        return None

    bbox = _expanded_bbox(bbox, crop.size, padding=12)
    alpha = alpha.crop(bbox)
    sprite = Image.new("RGBA", alpha.size, (255, 255, 255, 0))
    sprite.putalpha(alpha)
    _CONTROL_SPRITE_CACHE[cache_key] = sprite
    return sprite.copy()


def paste_control_sprite(
    image: Image.Image,
    sprite: Image.Image,
    center_x: int,
    baseline_y: int,
    target_height: int,
) -> None:
    if target_height <= 0:
        return
    scale = target_height / sprite.height
    target_width = max(1, round(sprite.width * scale))
    sprite = sprite.resize((target_width, target_height), Image.Resampling.LANCZOS)
    x = round(center_x - target_width / 2)
    y = round(baseline_y - target_height)
    image.paste(sprite, (x, y), sprite)


def training_reference_crops(image: Image.Image, panel: PanelSpec) -> list[Image.Image]:
    crops: list[Image.Image] = []
    for name in reference_crop_names_for_panel(panel):
        box = TRAINING_REFERENCE_CROPS.get(name)
        if box is not None:
            crops.append(square_on_black(crop_normalized(image, box)))
    return crops


def ip_character_reference_crops(image: Image.Image) -> list[Image.Image]:
    return [square_on_black(crop_normalized(image, box)) for box in IP_CHARACTER_REFERENCE_CROPS.values()]


def load_reference_images(config: GenerationConfig, panel: PanelSpec, project_root: Path) -> list[Image.Image]:
    images: list[Image.Image] = []
    for raw_path in config.referenceImages:
        path = (project_root / raw_path).resolve()
        if not path.exists():
            raise FileNotFoundError(f"Reference image not found: {path}")
        image = Image.open(path).convert("RGB")
        if config.referenceCropMode == "auto" and path.name == "training-reference.png":
            images.extend(training_reference_crops(image, panel))
        elif config.referenceCropMode == "auto" and path.name == "ip-character-reference.png":
            images.extend(ip_character_reference_crops(image))
        else:
            images.append(square_on_black(image))

    if not images:
        raise ValueError("At least one reference image is required for IP-Adapter conditioning")
    return images


def make_reference_contact_sheet(images: list[Image.Image], size: int = 384) -> Image.Image:
    tiles = [square_on_black(image, size=size) for image in images]
    cols = 1 if len(tiles) == 1 else 2
    rows = (len(tiles) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * size, rows * size), "#020806")
    for index, image in enumerate(tiles):
        x = (index % cols) * size
        y = (index // cols) * size
        sheet.paste(image, (x, y))
    return sheet


def make_ip_adapter_image_embeds(pipe, reference_images: list[Image.Image], torch, device, do_classifier_free_guidance: bool):
    projection = getattr(getattr(pipe.unet, "encoder_hid_proj", None), "image_projection_layers", None)
    if not projection or len(projection) != 1:
        return None

    from diffusers.models.embeddings import ImageProjection

    output_hidden_state = not isinstance(projection[0], ImageProjection)
    positive_embeds = []
    negative_embeds = []
    with torch.no_grad():
        for image in reference_images:
            positive, negative = pipe.encode_image(image, device, 1, output_hidden_state)
            positive_embeds.append(positive.detach().cpu())
            negative_embeds.append(negative.detach().cpu())
            if torch.cuda.is_available():
                torch.cuda.empty_cache()

    positive = torch.stack(positive_embeds, dim=0).mean(dim=0)
    negative = torch.stack(negative_embeds, dim=0).mean(dim=0)

    # Keep the CLIP image encoder from occupying VRAM during ControlNet/UNet
    # denoising. Diffusers' model CPU offload does not always evict it after a
    # manual encode_image call.
    if getattr(pipe, "image_encoder", None) is not None:
        try:
            pipe.image_encoder.to("cpu")
        except Exception:
            pass
    if torch.cuda.is_available():
        torch.cuda.empty_cache()

    # The original IP-Adapter projection expects [batch, image_count, embed_dim].
    # Hidden-state variants already include the token dimension.
    if not output_hidden_state:
        positive = positive.unsqueeze(1)
        negative = negative.unsqueeze(1)

    if do_classifier_free_guidance:
        return [torch.cat([negative, positive], dim=0)]
    return [positive]


def _clause_position(text: str, name: str, default: float) -> float:
    clauses = re.split(r"[.;,]", text)
    for clause in clauses:
        if name not in clause:
            continue
        if "left" in clause:
            return 0.30
        if "right" in clause:
            return 0.70
        if "center" in clause or "middle" in clause:
            return 0.50
        if "foreground" in clause:
            return 0.36 if name == "dev" else 0.64
    return default


def draw_laptop(draw: ImageDraw.ImageDraw, width: int, height: int, x: float, y: float, scale: float, stroke: int):
    screen_w = int(170 * scale)
    screen_h = int(100 * scale)
    keyboard_h = int(34 * scale)
    x0 = int(x - screen_w / 2)
    y0 = int(y - screen_h)
    x1 = int(x + screen_w / 2)
    y1 = int(y)
    draw.rectangle((x0, y0, x1, y1), outline="white", width=stroke)
    draw.line((x0 + stroke, y1, x1 - stroke, y1), fill="white", width=stroke)
    draw.polygon(
        [
            (x0 - int(24 * scale), y1 + keyboard_h),
            (x1 + int(24 * scale), y1 + keyboard_h),
            (x1, y1),
            (x0, y1),
        ],
        outline="white",
    )
    draw.line((x0 + int(46 * scale), y0 + int(45 * scale), x1 - int(46 * scale), y0 + int(45 * scale)), fill="white", width=stroke)
    draw.line((x0 + int(70 * scale), y0 + int(28 * scale), x0 + int(45 * scale), y0 + int(50 * scale)), fill="white", width=stroke)
    draw.line((x1 - int(70 * scale), y0 + int(28 * scale), x1 - int(45 * scale), y0 + int(50 * scale)), fill="white", width=stroke)


def draw_token_meter(draw: ImageDraw.ImageDraw, width: int, height: int, stroke: int):
    x0 = int(width * 0.24)
    y0 = int(height * 0.82)
    x1 = int(width * 0.76)
    y1 = int(height * 0.90)
    draw.rounded_rectangle((x0, y0, x1, y1), radius=10, outline="white", width=stroke)
    segments = 12
    gap = 4
    seg_w = (x1 - x0 - 40 - gap * (segments - 1)) // segments
    sx = x0 + 20
    for _ in range(segments):
        draw.rectangle((sx, y0 + 20, sx + seg_w, y1 - 20), outline="white", width=max(1, stroke // 2))
        sx += seg_w + gap


def draw_dev(draw: ImageDraw.ImageDraw, x: int, base_y: int, scale: float, state: str, stroke: int):
    if state == "collapsed":
        head_r = int(38 * scale)
        head_x = x - int(52 * scale)
        head_y = base_y - int(35 * scale)
        draw.ellipse((head_x - head_r, head_y - head_r, head_x + head_r, head_y + head_r), outline="white", width=stroke)
        draw.rectangle((head_x - int(30 * scale), head_y - int(10 * scale), head_x - int(4 * scale), head_y + int(8 * scale)), outline="white", width=max(1, stroke // 2))
        draw.rectangle((head_x + int(4 * scale), head_y - int(10 * scale), head_x + int(30 * scale), head_y + int(8 * scale)), outline="white", width=max(1, stroke // 2))
        draw.line((head_x + head_r, head_y, x + int(95 * scale), base_y), fill="white", width=stroke)
        draw.line((x + int(20 * scale), base_y, x + int(110 * scale), base_y + int(35 * scale)), fill="white", width=stroke)
        draw.line((x + int(20 * scale), base_y, x + int(110 * scale), base_y - int(35 * scale)), fill="white", width=stroke)
        return

    seated = state == "seated"
    head_r = int(38 * scale)
    head_y = base_y - int(170 * scale if seated else 210 * scale)
    draw.ellipse((x - head_r, head_y - head_r, x + head_r, head_y + head_r), outline="white", width=stroke)
    draw.rectangle((x - int(34 * scale), head_y - int(10 * scale), x - int(5 * scale), head_y + int(9 * scale)), outline="white", width=max(1, stroke // 2))
    draw.rectangle((x + int(5 * scale), head_y - int(10 * scale), x + int(34 * scale), head_y + int(9 * scale)), outline="white", width=max(1, stroke // 2))
    draw.line((x - int(5 * scale), head_y, x + int(5 * scale), head_y), fill="white", width=max(1, stroke // 2))

    neck_y = head_y + head_r
    hip_y = base_y - int(62 * scale if seated else 70 * scale)
    draw.line((x, neck_y, x, hip_y), fill="white", width=stroke)

    if state == "excited":
        draw.line((x, neck_y + int(18 * scale), x - int(58 * scale), neck_y - int(50 * scale)), fill="white", width=stroke)
        draw.line((x, neck_y + int(18 * scale), x + int(58 * scale), neck_y - int(50 * scale)), fill="white", width=stroke)
    elif seated:
        draw.line((x, neck_y + int(25 * scale), x + int(80 * scale), neck_y + int(60 * scale)), fill="white", width=stroke)
        draw.line((x, neck_y + int(25 * scale), x + int(58 * scale), neck_y + int(82 * scale)), fill="white", width=stroke)
    else:
        draw.line((x, neck_y + int(25 * scale), x - int(45 * scale), neck_y + int(88 * scale)), fill="white", width=stroke)
        draw.line((x, neck_y + int(25 * scale), x + int(45 * scale), neck_y + int(88 * scale)), fill="white", width=stroke)

    if seated:
        draw.line((x, hip_y, x + int(70 * scale), base_y - int(34 * scale)), fill="white", width=stroke)
        draw.line((x + int(70 * scale), base_y - int(34 * scale), x + int(105 * scale), base_y - int(34 * scale)), fill="white", width=stroke)
        draw.line((x, hip_y, x - int(15 * scale), base_y), fill="white", width=stroke)
        draw.line((x - int(50 * scale), base_y, x + int(35 * scale), base_y), fill="white", width=stroke)
    else:
        draw.line((x, hip_y, x - int(42 * scale), base_y), fill="white", width=stroke)
        draw.line((x, hip_y, x + int(42 * scale), base_y), fill="white", width=stroke)
        draw.line((x - int(42 * scale), base_y, x - int(65 * scale), base_y), fill="white", width=stroke)
        draw.line((x + int(42 * scale), base_y, x + int(65 * scale), base_y), fill="white", width=stroke)


def draw_clanker(draw: ImageDraw.ImageDraw, x: int, base_y: int, scale: float, state: str, stroke: int):
    head_w = int(110 * scale)
    head_h = int(82 * scale)
    head_y0 = base_y - int(255 * scale)
    head_y1 = head_y0 + head_h
    draw.rounded_rectangle((x - head_w // 2, head_y0, x + head_w // 2, head_y1), radius=int(10 * scale), outline="white", width=stroke)
    draw.rectangle((x - int(28 * scale), head_y0 + int(30 * scale), x - int(14 * scale), head_y0 + int(55 * scale)), outline="white", width=stroke)
    draw.rectangle((x + int(14 * scale), head_y0 + int(30 * scale), x + int(28 * scale), head_y0 + int(55 * scale)), outline="white", width=stroke)
    if state == "worried":
        draw.arc((x - int(20 * scale), head_y0 + int(54 * scale), x + int(20 * scale), head_y0 + int(82 * scale)), 190, 350, fill="white", width=stroke)
    else:
        draw.line((x - int(20 * scale), head_y0 + int(68 * scale), x + int(20 * scale), head_y0 + int(68 * scale)), fill="white", width=stroke)
    draw.line((x, head_y0, x, head_y0 - int(42 * scale)), fill="white", width=stroke)
    draw.ellipse((x - int(8 * scale), head_y0 - int(58 * scale), x + int(8 * scale), head_y0 - int(42 * scale)), outline="white", width=stroke)

    body_y0 = head_y1 + int(18 * scale)
    body_y1 = body_y0 + int(90 * scale)
    draw.rounded_rectangle((x - int(42 * scale), body_y0, x + int(42 * scale), body_y1), radius=int(8 * scale), outline="white", width=stroke)
    draw.line((x - int(20 * scale), body_y0 + int(30 * scale), x + int(20 * scale), body_y0 + int(30 * scale)), fill="white", width=max(1, stroke // 2))
    draw.line((x - int(20 * scale), body_y0 + int(48 * scale), x + int(12 * scale), body_y0 + int(48 * scale)), fill="white", width=max(1, stroke // 2))

    shoulder_y = body_y0 + int(22 * scale)
    hand_y = body_y1 - int(10 * scale)
    if state == "excited":
        draw.line((x - int(42 * scale), shoulder_y, x - int(88 * scale), shoulder_y - int(70 * scale)), fill="white", width=stroke)
        draw.line((x + int(42 * scale), shoulder_y, x + int(88 * scale), shoulder_y - int(70 * scale)), fill="white", width=stroke)
    else:
        draw.line((x - int(42 * scale), shoulder_y, x - int(82 * scale), hand_y), fill="white", width=stroke)
        draw.line((x + int(42 * scale), shoulder_y, x + int(82 * scale), hand_y), fill="white", width=stroke)
    draw.arc((x - int(98 * scale), hand_y - int(18 * scale), x - int(66 * scale), hand_y + int(18 * scale)), 80, 290, fill="white", width=stroke)
    draw.arc((x + int(66 * scale), hand_y - int(18 * scale), x + int(98 * scale), hand_y + int(18 * scale)), -110, 100, fill="white", width=stroke)

    draw.line((x - int(22 * scale), body_y1, x - int(35 * scale), base_y), fill="white", width=stroke)
    draw.line((x + int(22 * scale), body_y1, x + int(35 * scale), base_y), fill="white", width=stroke)
    draw.rectangle((x - int(55 * scale), base_y - int(16 * scale), x - int(22 * scale), base_y), outline="white", width=stroke)
    draw.rectangle((x + int(22 * scale), base_y - int(16 * scale), x + int(55 * scale), base_y), outline="white", width=stroke)


def draw_sparks(draw: ImageDraw.ImageDraw, width: int, height: int, stroke: int):
    for x, y in [(0.45, 0.42), (0.56, 0.36), (0.63, 0.48), (0.37, 0.52)]:
        cx, cy = int(width * x), int(height * y)
        draw.line((cx - 18, cy + 22, cx, cy - 22, cx + 18, cy + 10), fill="white", width=stroke)


def dev_control_sprite_name(text: str) -> str:
    if _has_any(text, ("dead", "x-eye", "x eye")):
        return "dev_pose_dead"
    if _has_any(text, ("collapsed", "floor", "lies flat", "flat on", "burnout")):
        return "dev_pose_collapsed"
    if _has_any(text, ("slumped", "exhausted", "tired")):
        return "dev_pose_slumped"
    if _has_any(text, ("panic", "panicked", "overwhelmed", "holy", "chaos")):
        return "dev_pose_overwhelmed"
    if _has_any(text, ("resurrected", "zombie")):
        return "dev_pose_zombie"
    if _has_any(text, ("seated", "typing", "laptop", "terminal", "nvim", "code")):
        return "dev_seated_laptop"
    if _has_any(text, ("excited", "wow", "arms up", "throws both arms", "celebrat")):
        return "dev_excited_body"
    if _has_any(text, ("coffee", "mug")):
        return "dev_mug_body"
    if _has_any(text, ("running", "run")):
        return "dev_running_body"
    return "dev_neutral_body"


def clanker_control_sprite_name(text: str) -> str:
    if _has_any(text, ("laptop", "typing", "interfacing")) and "clanker" in text and "dev" not in text:
        return "clanker_at_laptop"
    if _has_any(text, ("happy", "celebrat", "triumphant", "hyped", "success", "proud", "confident")):
        return "clanker_happy_body"
    return "clanker_neutral_body"


def draw_reference_characters(
    image: Image.Image,
    project_root: Path,
    text: str,
    dev_x: float,
    clanker_x: float,
    base_y: int,
    scale: float,
) -> bool:
    dev_name = dev_control_sprite_name(text)
    clanker_name = clanker_control_sprite_name(text)
    dev_sprite = control_reference_sprite(project_root, dev_name)
    clanker_sprite = control_reference_sprite(project_root, clanker_name)
    if dev_sprite is None or clanker_sprite is None:
        return False

    shot_scale = 1.0
    if "close" in text:
        shot_scale = 1.18
    elif "wide" in text:
        shot_scale = 0.88

    dev_height = int((300 if dev_name.startswith("dev_pose_") else 330) * scale * shot_scale)
    clanker_height = int(335 * scale * shot_scale)
    dev_center = dev_x
    if dev_name in {"dev_seated_laptop", "dev_laptop_body"}:
        # These sprites include the desk/laptop, so their visual center needs to
        # sit closer to the middle of the panel than the Dev's head alone.
        dev_center = min(0.48, dev_x + 0.08)
        dev_height = int(300 * scale * shot_scale)
    if dev_name in {"dev_pose_collapsed", "dev_pose_dead"}:
        dev_center = max(0.28, dev_x + 0.05)
        dev_height = int(210 * scale * shot_scale)

    paste_control_sprite(image, dev_sprite, int(image.width * dev_center), base_y, dev_height)
    paste_control_sprite(image, clanker_sprite, int(image.width * clanker_x), base_y, clanker_height)
    return True


def make_layout_control_image(panel: PanelSpec, width: int, height: int, project_root: Path | None = None) -> Image.Image:
    text = f"{panel.shot} {_panel_text(panel)}"
    composition = (panel.composition or "").lower()
    scale = min(width / 1024, height / 768)
    stroke = max(2, int(4 * scale))
    image = Image.new("RGBA", (width, height), (0, 0, 0, 255))
    draw = ImageDraw.Draw(image)

    dev_x = _clause_position(composition, "dev", 0.31)
    clanker_x = _clause_position(composition, "clanker", 0.69)
    if abs(dev_x - clanker_x) < 0.18:
        dev_x, clanker_x = 0.31, 0.69

    foreground = "foreground" in text
    base_y = int(height * (0.86 if foreground else 0.80))

    dev_sprite_name = dev_control_sprite_name(text)
    sprite_has_laptop = dev_sprite_name in {"dev_seated_laptop", "dev_laptop_body", "dev_pose_slumped", "dev_pose_overwhelmed"}
    if _has_any(text, ("laptop", "terminal", "monitor", "nvim", "code")) and not sprite_has_laptop:
        draw_laptop(draw, width, height, width * 0.50, height * (0.68 if foreground else 0.70), scale, stroke)
    if "token meter" in text or "tokens" in text:
        draw_token_meter(draw, width, height, stroke)

    used_reference_sprites = False
    if project_root is not None:
        used_reference_sprites = draw_reference_characters(image, project_root, text, dev_x, clanker_x, base_y, scale)

    if not used_reference_sprites:
        dev_state = "standing"
        if _has_any(text, ("seated", "typing", "laptop")):
            dev_state = "seated"
        if _has_any(text, ("excited", "wow", "arms up", "throws both arms", "celebrat")):
            dev_state = "excited"
        if _has_any(text, ("collapsed", "floor", "dead", "lies flat", "flat on")):
            dev_state = "collapsed"

        clanker_state = "standing"
        if _has_any(text, ("arms raised", "celebrat", "triumphant", "hyped")):
            clanker_state = "excited"
        if _has_any(text, ("concerned", "worried")):
            clanker_state = "worried"

        draw_dev(draw, int(width * dev_x), base_y, scale, dev_state, stroke)
        draw_clanker(draw, int(width * clanker_x), base_y, scale, clanker_state, stroke)

    if _has_any(text, ("spark", "chaos", "overclock", "erupts", "debris")):
        draw_sparks(draw, width, height, stroke)

    return image.convert("RGB")


def fit_control_image(image: Image.Image, width: int, height: int) -> Image.Image:
    image = ImageOps.exif_transpose(image).convert("RGB")
    image = ImageOps.contain(image, (width, height), method=Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", (width, height), "black")
    canvas.paste(image, ((width - image.width) // 2, (height - image.height) // 2))
    return canvas


def canny_control_image(image: Image.Image) -> Image.Image:
    import cv2
    import numpy as np

    gray = np.array(ImageOps.grayscale(image))
    edges = cv2.Canny(gray, 80, 180)
    return Image.fromarray(edges).convert("RGB")


def make_control_image(
    config: GenerationConfig,
    panel: PanelSpec,
    project_root: Path,
    output_path: Path,
    panel_number: int,
) -> Image.Image | None:
    if not config.enableControlNet:
        return None

    if panel.controlImage:
        control_path = (project_root / panel.controlImage).resolve()
        if not control_path.exists():
            raise FileNotFoundError(f"Control image not found: {control_path}")
        image = fit_control_image(Image.open(control_path), config.width, config.height)
        if config.controlGuideMode == "canny":
            image = canny_control_image(image)
    else:
        image = make_layout_control_image(panel, config.width, config.height, project_root)

    debug_path = output_path.parent / f"control-panel-{panel_number:02d}.png"
    debug_path.parent.mkdir(parents=True, exist_ok=True)
    image.save(debug_path)
    return image


def generate_panel_art(
    comic: ComicSpec,
    panel: PanelSpec,
    panel_number: int,
    project_root: Path,
    output_path: Path,
) -> tuple[Path, int]:
    config = comic.generation
    pipe = load_pipeline(config)

    import torch

    if hasattr(pipe, "maybe_free_model_hooks"):
        pipe.maybe_free_model_hooks()
    if config.device == "cuda":
        torch.cuda.empty_cache()

    reference_images = load_reference_images(config, panel, project_root)
    execution_device = getattr(pipe, "_execution_device", config.device)
    do_classifier_free_guidance = config.guidanceScale > 1.0
    ip_adapter_image_embeds = make_ip_adapter_image_embeds(
        pipe,
        reference_images,
        torch,
        execution_device,
        do_classifier_free_guidance,
    )

    seed = panel.seed if panel.seed is not None else config.seed
    if seed is None:
        seed = random.SystemRandom().randint(0, 2**32 - 1)
    generator = torch.Generator(device=config.device).manual_seed(seed)

    negative_prompt = config.negativePrompt
    if panel.negativePrompt:
        negative_prompt = f"{negative_prompt}, {panel.negativePrompt}"

    call_args = {
        "prompt": build_prompt(comic, panel, panel_number),
        "negative_prompt": negative_prompt,
        "width": config.width,
        "height": config.height,
        "num_inference_steps": config.steps,
        "guidance_scale": config.guidanceScale,
        "generator": generator,
    }
    if ip_adapter_image_embeds is not None:
        call_args["ip_adapter_image_embeds"] = ip_adapter_image_embeds
    else:
        call_args["ip_adapter_image"] = make_reference_contact_sheet(reference_images)

    if config.device == "cuda":
        torch.cuda.empty_cache()

    control_image = make_control_image(config, panel, project_root, output_path, panel_number)
    if control_image is not None:
        call_args.update(
            {
                "image": control_image,
                "controlnet_conditioning_scale": panel.controlNetScale
                if panel.controlNetScale is not None
                else config.controlNetScale,
                "control_guidance_start": config.controlNetStart,
                "control_guidance_end": config.controlNetEnd,
            }
        )

    image = pipe(**call_args).images[0]

    if hasattr(pipe, "maybe_free_model_hooks"):
        pipe.maybe_free_model_hooks()
    if config.device == "cuda":
        torch.cuda.empty_cache()

    output_path.parent.mkdir(parents=True, exist_ok=True)
    ImageOps.exif_transpose(image).save(output_path)
    return output_path, seed

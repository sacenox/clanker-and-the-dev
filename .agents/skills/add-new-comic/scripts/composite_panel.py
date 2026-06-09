from __future__ import annotations

import re
import textwrap
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFont, ImageFilter, ImageOps

from models import DialogueLine, PanelSpec

GREEN = "#00ff66"
LIGHT_GREEN = "#7cff8a"
DARK = "#020806"
BLACK_ALPHA = (0, 0, 0, 205)


def clean_markup(text: str) -> str:
    return re.sub(r"[*_`]+", "", text).strip()


def load_font(project_root: Path, size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    font_path = project_root / "assets" / "fonts" / "VT323-Regular.ttf"
    if font_path.exists():
        return ImageFont.truetype(str(font_path), size=size)
    return ImageFont.load_default()


def terminal_line_art(raw: Image.Image, threshold: int = 95, stroke: int = 3) -> Image.Image:
    """Convert soft SDXL output into the crisp green-on-black reference style."""
    raw = ImageOps.exif_transpose(raw).convert("RGB")
    try:
        import cv2
        import numpy as np

        gray = np.array(ImageOps.autocontrast(ImageOps.grayscale(raw), cutoff=1))
        mask = (gray > threshold).astype(np.uint8) * 255
        mask = cv2.medianBlur(mask, 3)

        height, width = mask.shape
        # Panel specs reserve the upper band for compositor-owned bubbles.
        # Clearing it removes common SDXL hallucinations copied from reference
        # sheet headers/frames without touching the staged characters.
        mask[: int(height * 0.28), :] = 0
        clean_mask = np.zeros_like(mask)
        keep_filled = np.zeros_like(mask)
        label_count, labels, stats, _ = cv2.connectedComponentsWithStats(mask, connectivity=8)
        for label in range(1, label_count):
            x, y, w, h, area = stats[label]
            if area < 8:
                continue
            # SDXL sometimes invents a full panel/grid because the reference
            # sheets contain panels. Drop huge border components; our compositor
            # draws the real frame afterward.
            if w > width * 0.82 and h > height * 0.58:
                continue
            # Reject thin generated header/footer bars copied from reference
            # sheets, screenshots, or UI mockups. Real comic lettering is drawn
            # later by the compositor.
            if w > width * 0.45 and h < height * 0.06 and (y < height * 0.18 or y + h > height * 0.82):
                continue
            if h > height * 0.46 and w < width * 0.18:
                continue
            if y < height * 0.50 and y + h < height * 0.66 and w > width * 0.16 and h > height * 0.15:
                continue
            component = labels == label
            clean_mask[component] = 255
            # Preserve small filled UI/robot-eye shapes instead of skeletonizing
            # them into X marks.
            if area <= 1200 and w <= 52 and h <= 52:
                keep_filled[component] = 255
        mask = clean_mask

        skeleton = np.zeros(mask.shape, np.uint8)
        element = cv2.getStructuringElement(cv2.MORPH_CROSS, (3, 3))
        working = mask.copy()
        while cv2.countNonZero(working):
            eroded = cv2.erode(working, element)
            opened = cv2.dilate(eroded, element)
            skeleton = cv2.bitwise_or(skeleton, cv2.subtract(working, opened))
            working = eroded

        line_mask = cv2.bitwise_or(skeleton, keep_filled)
        if stroke > 1:
            kernel = np.ones((stroke, stroke), np.uint8)
            line_mask = cv2.dilate(line_mask, kernel, iterations=1)

        canvas = np.zeros((*line_mask.shape, 3), dtype=np.uint8)
        canvas[:] = (2, 8, 6)
        canvas[line_mask > 0] = (0, 255, 102)
        return Image.fromarray(canvas, "RGB")
    except Exception:
        gray = ImageOps.autocontrast(ImageOps.grayscale(raw), cutoff=1)
        mask = gray.point(lambda p: 255 if p > threshold else 0)
        if stroke > 1:
            mask = mask.filter(ImageFilter.MaxFilter(stroke if stroke % 2 else stroke + 1))
        return Image.composite(Image.new("RGB", raw.size, GREEN), Image.new("RGB", raw.size, DARK), mask)


def prepare_art(
    raw: Image.Image,
    mode: str = "terminal-lineart",
    threshold: int = 95,
    stroke: int = 3,
) -> Image.Image:
    if mode == "none":
        return ImageOps.exif_transpose(raw).convert("RGB")
    if mode == "monochrome":
        return ImageOps.colorize(ImageOps.grayscale(raw), black=DARK, white=GREEN)
    return terminal_line_art(raw, threshold=threshold, stroke=stroke)


def control_guide_line_art(control_path: Path, size: tuple[int, int]) -> Image.Image | None:
    if not control_path.exists():
        return None
    guide = Image.open(control_path).convert("L")
    if guide.size != size:
        guide = guide.resize(size, Image.Resampling.LANCZOS)
    mask = guide.point(lambda p: 255 if p > 24 else 0)
    if not mask.getbbox():
        return None
    return Image.composite(Image.new("RGB", size, GREEN), Image.new("RGB", size, DARK), mask)


def control_guide_mask(control_path: Path, size: tuple[int, int]) -> Image.Image | None:
    if not control_path.exists():
        return None
    guide = Image.open(control_path).convert("L")
    if guide.size != size:
        guide = guide.resize(size, Image.Resampling.LANCZOS)
    mask = guide.point(lambda p: 255 if p > 24 else 0)
    if not mask.getbbox():
        return None
    return mask


def line_mask_from_terminal_art(art: Image.Image) -> Image.Image:
    gray = ImageOps.grayscale(art.convert("RGB"))
    return gray.point(lambda p: 255 if p > 28 else 0)


def mask_to_terminal_art(mask: Image.Image, size: tuple[int, int]) -> Image.Image:
    if mask.size != size:
        mask = mask.resize(size, Image.Resampling.NEAREST)
    return Image.composite(Image.new("RGB", size, GREEN), Image.new("RGB", size, DARK), mask)


def filter_line_art_to_control_guide(art: Image.Image, guide_mask: Image.Image, padding: int = 0) -> Image.Image:
    """Keep generated strokes only when they support the reference-derived guide.

    SDXL often creates faint CRT bands, window/card rectangles, and floating blobs
    because the references are terminal-style screenshots.  The guide already has
    the desired character/prop sketch, so generated strokes are treated as local
    embellishment and are clipped back to the guide before the guide is merged.
    """
    try:
        import cv2
        import numpy as np

        raw_mask = np.array(line_mask_from_terminal_art(art), dtype=np.uint8)
        guide = np.array(guide_mask, dtype=np.uint8)
        kernel_size = max(1, padding * 2 + 1)
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (kernel_size, kernel_size))
        keep_zone = cv2.dilate(guide, kernel, iterations=1)
        clipped = cv2.bitwise_and(raw_mask, keep_zone)

        cleaned = np.zeros_like(clipped)
        label_count, labels, stats, _ = cv2.connectedComponentsWithStats(clipped, connectivity=8)
        for label in range(1, label_count):
            x, y, w, h, area = stats[label]
            if area < 8:
                continue
            component = labels == label
            density = area / max(1, w * h)

            # Filled SDXL blobs make the final panels look less like the clean
            # reference sketches. The exact guide is merged later, so dense raw
            # fills can be rejected even when they overlap a desired guide mark.
            if density > 0.34 and area > 24:
                continue
            if w > raw_mask.shape[1] * 0.38 and h < raw_mask.shape[0] * 0.04:
                continue
            cleaned[component] = 255

        return mask_to_terminal_art(Image.fromarray(cleaned, "L"), art.size)
    except Exception:
        clipped = ImageChops.multiply(line_mask_from_terminal_art(art), guide_mask.filter(ImageFilter.MaxFilter(padding | 1)))
        return mask_to_terminal_art(clipped, art.size)


def merge_control_guide(art: Image.Image, raw_art_path: Path, panel_number: int) -> Image.Image:
    control_path = raw_art_path.with_name(f"control-panel-{panel_number:02d}.png")
    guide = control_guide_line_art(control_path, art.size)
    guide_mask = control_guide_mask(control_path, art.size)
    if guide is None or guide_mask is None:
        return art
    # The ControlNet guide is derived from art-reference sprites. Keeping it in
    # the final line art repairs SDXL drift. Generated strokes are now kept only
    # to that guide, which removes scanlines/floating artifacts while retaining
    # the cleaned SDXL panel generation as the raw/debug artifact.
    filtered = filter_line_art_to_control_guide(art.convert("RGB"), guide_mask)
    return ImageChops.lighter(filtered, guide)


def wrap_for_width(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.ImageFont, max_width: int) -> list[str]:
    text = clean_markup(text)
    words = text.split()
    lines: list[str] = []
    current: list[str] = []
    for word in words:
        candidate = " ".join([*current, word])
        if draw.textlength(candidate, font=font) <= max_width or not current:
            current.append(word)
        else:
            lines.append(" ".join(current))
            current = [word]
    if current:
        lines.append(" ".join(current))
    return lines or [""]


def draw_tail(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], speaker: str, outline: str):
    x0, y0, x1, y1 = box
    if speaker == "dev":
        points = [(x0 + 80, y1 - 2), (x0 + 105, y1 + 34), (x0 + 145, y1 - 2)]
    elif speaker == "clanker":
        points = [(x1 - 145, y1 - 2), (x1 - 105, y1 + 34), (x1 - 80, y1 - 2)]
    else:
        return
    draw.polygon(points, fill=BLACK_ALPHA, outline=outline)


def draw_bubble(
    overlay: Image.Image,
    text: str,
    speaker: str,
    box: tuple[int, int, int, int],
    font: ImageFont.ImageFont,
):
    draw = ImageDraw.Draw(overlay)
    x0, y0, x1, y1 = box
    draw.rounded_rectangle(box, radius=18, fill=BLACK_ALPHA, outline=GREEN, width=4)
    draw_tail(draw, box, speaker, GREEN)

    label = "" if speaker == "narrator" else f"{speaker.upper()}: "
    lines = wrap_for_width(draw, f"{label}{text}", font, (x1 - x0) - 36)
    line_height = int(font.size * 0.9) if hasattr(font, "size") else 24
    total_height = len(lines) * line_height
    y = y0 + max(12, ((y1 - y0) - total_height) // 2)
    for line in lines:
        draw.text((x0 + 18, y), line, font=font, fill=LIGHT_GREEN)
        y += line_height


def bubble_box(index: int, total: int, speaker: str, image_width: int) -> tuple[int, int, int, int]:
    top = 28 + index * 116
    height = 92
    margin = 34
    if speaker == "dev":
        return (margin, top, int(image_width * 0.62), top + height)
    if speaker == "clanker":
        return (int(image_width * 0.38), top, image_width - margin, top + height)
    return (margin, top, image_width - margin, top + height)


def draw_terminal(
    overlay: Image.Image,
    lines: list[str],
    project_root: Path,
):
    if not lines:
        return
    draw = ImageDraw.Draw(overlay)
    width, height = overlay.size
    font = load_font(project_root, 34)
    clean_lines = [clean_markup(line) for line in lines[:4]]
    line_height = 35
    x = 56
    y = height - (len(clean_lines) * line_height) - 48
    # Render only the joke's code/output text. Avoid terminal-window chrome,
    # title bars, boxed footers, or UI panels inside the comic image.
    for line in clean_lines:
        shortened = textwrap.shorten(line, width=42, placeholder="…")
        draw.text(
            (x, y),
            shortened,
            font=font,
            fill=LIGHT_GREEN,
            stroke_width=2,
            stroke_fill=(0, 0, 0, 230),
        )
        y += line_height


def composite_panel(
    raw_art_path: Path,
    output_path: Path,
    panel: PanelSpec,
    project_root: Path,
    panel_number: int,
    art_postprocess_mode: str = "terminal-lineart",
    line_art_threshold: int = 95,
    line_art_stroke: int = 3,
) -> Path:
    raw = Image.open(raw_art_path).convert("RGB")
    base_art = prepare_art(
        raw,
        mode=art_postprocess_mode,
        threshold=line_art_threshold,
        stroke=line_art_stroke,
    )
    if art_postprocess_mode == "terminal-lineart":
        base_art = merge_control_guide(base_art, raw_art_path, panel_number)
    base = base_art.convert("RGBA")
    overlay = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    width, height = base.size

    # Simple comic panel frame. No baked-in panel number, title card, header,
    # footer, or site chrome; the page provides that in HTML.
    draw.rectangle((8, 8, width - 8, height - 8), outline=GREEN, width=3)

    bubble_font = load_font(project_root, 42)
    items: list[DialogueLine | tuple[str, str]] = []
    if panel.caption:
        items.append(("narrator", panel.caption))
    items.extend(panel.dialogue)

    for index, item in enumerate(items[:3]):
        if isinstance(item, tuple):
            speaker, text = item
        else:
            speaker, text = item.speaker, item.text
        draw_bubble(overlay, text, speaker, bubble_box(index, len(items), speaker, width), bubble_font)

    draw_terminal(overlay, panel.terminalLines, project_root)

    composed = Image.alpha_composite(base, overlay).convert("RGB")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    composed.save(output_path, quality=95)
    return output_path

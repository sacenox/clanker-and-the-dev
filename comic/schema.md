# Comic Image-Generation Spec Schema

The `add-new-comic` agent skill writes one JSON file matching this schema. The SDXL pipeline in `.agents/skills/add-new-comic/scripts/` reads the spec, generates individual PNG panels, composites readable comic lettering, glues panels into a final panels-only strip image, and writes the Jekyll post. Titles, credits, headers, footers, metadata, and other page chrome belong in HTML/CSS, not inside the PNG.

Specs live in:

```txt
comic/specs/<slug>.json
```

Generated assets live in:

```txt
assets/comics/<slug>/
```

ControlNet guide images are also written for review:

```txt
assets/comics/<slug>/control-panel-XX.png
```

## Required shape

```json
{
  "title": "The Refactor",
  "slug": "the-refactor",
  "timestamp": "2026-06-08",
  "credit": "dev and clanker",
  "summary": "The dev asks for a refactor and Clanker optimizes by deleting the code.",
  "generation": {
    "modelId": "stabilityai/stable-diffusion-xl-base-1.0",
    "ipAdapterRepo": "h94/IP-Adapter",
    "ipAdapterSubfolder": "sdxl_models",
    "ipAdapterWeight": "ip-adapter_sdxl.bin",
    "ipAdapterScale": 0.82,
    "referenceImages": [
      "art-reference/training-reference.png",
      "art-reference/ip-character-reference.png"
    ],
    "referenceCropMode": "auto",
    "width": 1024,
    "height": 768,
    "steps": 34,
    "guidanceScale": 5.0,
    "enableControlNet": true,
    "controlNetModelId": "diffusers/controlnet-canny-sdxl-1.0",
    "controlGuideMode": "layout",
    "controlNetScale": 0.88,
    "controlNetStart": 0.0,
    "controlNetEnd": 0.90,
    "artPostprocessMode": "terminal-lineart",
    "lineArtThreshold": 112,
    "lineArtStroke": 3
  },
  "panels": [
    {
      "artPrompt": "Dev leans over a terminal laptop while Clanker, a boxy robot assistant, confidently offers help in a pure black terminal room.",
      "composition": "Dev on the left, Clanker on the right, laptop foreground, empty dark upper area for speech bubbles.",
      "shot": "medium",
      "dialogue": [
        { "speaker": "dev", "text": "Can you refactor this?" },
        { "speaker": "clanker", "text": "Absolutely." }
      ],
      "terminalLines": ["$ git status", "legacy code: haunted"]
    }
  ]
}
```

## Top-level fields

- `title` string, required. Human-readable post title.
- `slug` string, required. Lowercase URL slug, `a-z`, `0-9`, and hyphens only.
- `timestamp` string, required. Use `YYYY-MM-DD`; becomes the Jekyll post date.
- `credit` string, optional. Attribution line.
- `summary` string, optional but recommended. One sentence premise for prompt context.
- `generation` object, optional. Defaults are provided by the Python model if omitted.
- `panels` array, required. 1 to 6 panel objects; usually 3 to 5.

## Generation fields

All generation fields are optional; defaults are documented here.

- `modelId`: default `stabilityai/stable-diffusion-xl-base-1.0`.
- `ipAdapterRepo`: default `h94/IP-Adapter`.
- `ipAdapterSubfolder`: default `sdxl_models`.
- `ipAdapterWeight`: default `ip-adapter_sdxl.bin`.
- `ipAdapterScale`: default `0.82`. Increase for stronger reference adherence; decrease if output is too constrained.
- `referenceImages`: array of repo-relative image paths. Defaults to `art-reference/training-reference.png` plus `art-reference/ip-character-reference.png`.
- `referenceCropMode`: default `auto`. When the default reference files are used, the generator extracts large character/pose crops from `training-reference.png` and character-only crops from `ip-character-reference.png`, then averages their IP-Adapter image embeddings so SDXL sees the characters without copying sheet grids/cards. Use `none` to feed each listed image as-is.
- `width`: default `1024`.
- `height`: default `768`.
- `steps`: default `34`.
- `guidanceScale`: default `5.0`.
- `enableControlNet`: default `true`. Enables SDXL ControlNet conditioning for panel structure.
- `controlNetModelId`: default `diffusers/controlnet-canny-sdxl-1.0`.
- `controlGuideMode`: default `layout`. With no per-panel `controlImage`, the generator builds a black/white guide from art-reference character sprites plus generated props/effects, then saves it as `control-panel-XX.png`. Use `canny` to Canny-preprocess a supplied `controlImage`, or `raw` to pass the supplied guide as-is.
- `controlNetScale`: default `0.88`. Lower values give IP-Adapter/style more freedom; higher values follow the guide more strongly.
- `controlNetStart`: default `0.0`.
- `controlNetEnd`: default `0.90`.
- `artPostprocessMode`: default `terminal-lineart`. Converts soft SDXL output back into crisp green-on-black line art, clips generated strokes to the reference-derived control guide to remove scanlines/blobs/header-footer bars, and merges the guide to repair character drift. Use `monochrome` for simple grayscale colorizing or `none` to keep raw art.
- `lineArtThreshold`: default `112`. Brightness cutoff used by `terminal-lineart` cleanup.
- `lineArtStroke`: default `3`. Stroke restoration width used by `terminal-lineart` cleanup.
- `negativePrompt`: optional global negative prompt override.
- `seed`: optional global seed. Omit for non-deterministic generation.
- `device`: default `cuda`.
- `torchDtype`: default `float16`.
- `enableVaeSlicing`: default `true`.
- `enableVaeTiling`: default `true`.
- `enableAttentionSlicing`: default `false`. Attention slicing is disabled because it can conflict with IP-Adapter attention processors.
- `enableSequentialCpuOffload`: default `false`. More aggressive and slower offload mode; enable only if model CPU offload still exceeds VRAM.
- `enableModelCpuOffload`: default `true`. Keeps SDXL/IP-Adapter/ControlNet usable on a 12 GB GPU by offloading inactive models through Accelerate.

## Panel fields

- `artPrompt` string, required. Visual description for SDXL. Do not include dialogue or text that should appear in the final image.
- `composition` string, optional but recommended. Character positions, framing, key props, and reserved bubble space.
- `shot` string, optional. One of `wide`, `medium`, `close`, or `over-the-shoulder`; defaults to `medium`.
- `dialogue` array, optional. Up to 3 objects like `{ "speaker": "dev", "text": "ship it?" }`; `speaker` must be `narrator`, `dev`, or `clanker`.
- `caption` string, optional. Narration/caption text. Use instead of or before dialogue.
- `terminalLines` array, optional. Up to 4 short terminal commands/output lines.
- `controlImage` string, optional. Repo-relative sketch/edge image for this panel's ControlNet guide. Omit to let the generator build a reference-derived layout guide from `composition`.
- `controlNetScale` number, optional. Panel-specific override for global `controlNetScale`.
- `negativePrompt` string, optional panel-specific additions to the global negative prompt.
- `seed` integer, optional panel seed for debugging/reruns. Omit for non-deterministic generation.

## Text and chrome rules

Stable Diffusion should not render readable lettering or page/interface chrome.

Do not put final dialogue, captions, terminal output, signs, labels, title cards, headers, footers, credits, watermarks, or UI copy in `artPrompt`. Put comic text fields in:

- `dialogue`
- `caption`
- `terminalLines`

The compositor renders comic text with the local VT323 font. The generated `strip.png` must contain only the comic panels; the Jekyll layout/post HTML supplies the page title, credit, borders, and any surrounding UI.

## Prompting rules

- Describe Clanker and Dev explicitly in each panel.
- Keep prompts visual: acting, pose, mood, props, environment, lighting, composition.
- Ask for black/neon terminal comic style, but avoid browser/app/window chrome, title bars, headers, footers, dashboards, logos, and watermarks.
- Reserve empty dark space near the top for speech bubbles.
- Keep dialogue short so it fits in bubbles.
- Usually map one joke beat to one panel.
- Output JSON only. No markdown fences, comments, trailing commas, SVG, or HTML.

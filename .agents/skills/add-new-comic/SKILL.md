---
name: add-new-comic
description: Use when the user wants to add, generate, render, regenerate, or submit a new Clanker and the Dev comic/joke. This skill is the formal entrypoint for comic generation and uses the SDXL image pipeline in this skill folder.
allowed-tools: Read, Write, Edit, Bash
---

# Add a New Clanker and the Dev Comic

This repo is a Jekyll/GitHub Pages comic-strip blog. Comic generation is driven by this agent skill and the Python SDXL pipeline in `scripts/`.

The skill is the only supported generation path. Do not use the old deterministic SVG renderer or `job.sh` workflow.

## Important project rules

- Do not install Ruby gems locally.
- Local Jekyll preview runs through Docker with `./dev.sh`.
- Use `uv` for Python environment management and Python package installation.
- Python generation code lives inside this skill folder.
- Generated image assets live under `assets/comics/<slug>/`.
- Generated Jekyll posts live in `_posts/`.
- Comic specs live in `comic/specs/` and use the current image-generation schema in `comic/schema.md`.
- Do not ask Stable Diffusion to render dialogue, captions, terminal text, lettering, title cards, headers, footers, watermarks, or UI chrome. The Python compositor adds readable comic text with Pillow, and the site adds page chrome with HTML/CSS.
- Default SDXL model: `stabilityai/stable-diffusion-xl-base-1.0`.
- Default IP-Adapter: `h94/IP-Adapter`, subfolder `sdxl_models`, weight `ip-adapter_sdxl.bin`.
- Default IP-Adapter reference images: `art-reference/training-reference.png` plus `art-reference/ip-character-reference.png`.
- The generator extracts per-panel crops from the training sheet plus character-only crops from `ip-character-reference.png`, then averages IP-Adapter image embeddings so the model sees the characters without copying sheet grids/cards.
- ControlNet is enabled by default with reference-derived layout guides (`control-panel-XX.png`) to stabilize composition and character proportions.
- The compositor converts soft SDXL output back into crisp terminal line art, clips generated strokes to the reference-derived guide to remove scanlines/blobs/header-footer bars, and merges that guide to repair character drift.
- Model CPU offload is enabled by default so SDXL/IP-Adapter/ControlNet can run on a 12 GB GPU.

## Standard workflow

### 1. Turn the user's joke into an image-generation spec

Create or update:

```txt
comic/specs/<slug>.json
```

The spec must be valid JSON only. It should follow `comic/schema.md`.

Use this shape:

```json
{
  "title": "My Great Joke",
  "slug": "my-great-joke",
  "timestamp": "YYYY-MM-DD",
  "credit": "User / handle / inspiration",
  "summary": "One sentence premise for the whole strip.",
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
      "artPrompt": "Dev leans toward a terminal laptop while Clanker, a boxy robot assistant, offers help in a pure black terminal room.",
      "composition": "Dev on the left, Clanker on the right, laptop in the foreground, empty dark upper area for speech bubbles.",
      "shot": "medium",
      "dialogue": [
        { "speaker": "dev", "text": "Can you make this simpler?" },
        { "speaker": "clanker", "text": "Absolutely." }
      ],
      "terminalLines": ["$ git status", "legacy code: haunted"]
    }
  ]
}
```

Guidelines:

- Usually make 3–5 panels.
- Preserve the user's core joke and attribution.
- Keep dialogue short; the compositor has limited bubble space.
- `artPrompt` describes only visuals, acting, mood, props, and setting.
- Never put dialogue text, title/header/footer copy, watermarks, or UI chrome inside `artPrompt`; comic text is overlaid later and page chrome is HTML/CSS.
- Prompt for the recurring characters explicitly: Dev is a human developer with simple glasses; Clanker is a boxy robot assistant with screen eyes and antenna.
- Include composition directions such as character positions and reserved empty space for bubbles.
- Use optional explicit `seed` values only for debugging/reruns. Default generation is non-deterministic.

### 2. Generate the comic with uv

From the repo root, run:

```bash
HF_HOME="$PWD/.cache/huggingface" PYTORCH_CUDA_ALLOC_CONF=expandable_segments:True uv run --project .agents/skills/add-new-comic python .agents/skills/add-new-comic/scripts/generate_comic.py comic/specs/<slug>.json
```

This creates or updates:

```txt
assets/comics/<slug>/control-panel-01.png
assets/comics/<slug>/raw-panel-01.png
assets/comics/<slug>/panel-01.png
assets/comics/<slug>/panel-02.png
assets/comics/<slug>/strip.png
assets/comics/<slug>/generation.json
_posts/YYYY-MM-DD-<slug>.md
```

Notes:

- `control-panel-XX.png` files are generated ControlNet layout guides for review/debugging.
- Raw panels are SDXL output before text/borders.
- Final `panel-XX.png` files include cleaned line art, the merged reference guide, composited comic lettering/code snippets, and a simple panel frame.
- `strip.png` is a panels-only comic image with no baked-in title/header/footer/metadata chrome; the Jekyll page adds those with HTML/CSS.
- Strip composition uses Pillow; no ImageMagick dependency is required for this step.
- The first run downloads Hugging Face model weights and may require accepted model terms / Hugging Face credentials in the environment.
- SDXL + IP-Adapter + ControlNet is VRAM-heavy; generation uses model CPU offload and one isolated worker process per panel to avoid VRAM accumulation.

### 3. Review generated files

Check status and diff:

```bash
git status
git diff
```

Review:

```txt
comic/specs/<slug>.json
assets/comics/<slug>/strip.png
_posts/YYYY-MM-DD-<slug>.md
```

If the result is not good enough:

1. Edit visual prompts, composition, dialogue length, reference strength, or generation settings in the spec.
2. Re-run the `uv run --project ... generate_comic.py ...` command.

### 4. Preview locally when useful

Use Docker only:

```bash
./dev.sh
```

Then open:

```txt
http://localhost:4000
```

Do not install or run Bundler/Ruby gems locally outside Docker.

### 5. Commit or prepare for PR

If the user asks to commit, include the generated spec, assets, and post:

```bash
git add comic/specs assets/comics _posts
git commit -m "Add <comic title> comic"
```

If the user is contributing from a fork, remind them to open a pull request with their generated spec, image assets, and post.

## Regenerating existing comics

To regenerate an existing comic, update its spec in `comic/specs/<slug>.json`, then run:

```bash
HF_HOME="$PWD/.cache/huggingface" PYTORCH_CUDA_ALLOC_CONF=expandable_segments:True uv run --project .agents/skills/add-new-comic python .agents/skills/add-new-comic/scripts/generate_comic.py comic/specs/<slug>.json
```

Existing generated SVG posts should be replaced by image posts that embed the panels-only strip through `relative_url`:

```liquid
{{ '/assets/comics/<slug>/strip.png' | relative_url }}
```

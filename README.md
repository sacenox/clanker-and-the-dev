# Clanker and the Dev

A Jekyll/GitHub Pages comic-strip blog about developers, AI tools, terminal gremlins, and jokes that compile into neon terminal chaos.

Comic generation is now image-based. The formal entrypoint is the `add-new-comic` agent skill in `.agents/skills/add-new-comic/`, which uses Python, SDXL, IP-Adapter art references, ControlNet layout guides, and Pillow compositing.

## Run locally

Local Jekyll development runs in Docker only, so you do not need to install Ruby gems on your machine.

```bash
./dev.sh
```

Then open:

```txt
http://localhost:4000
```

The Docker container mounts the repo, so edits to posts, layouts, CSS, and generated comics are reflected by Jekyll.

## Generate a comic

Use the `add-new-comic` agent skill. The skill:

1. Turns a joke/premise into `comic/specs/<slug>.json`.
2. Runs the SDXL generator through `uv`.
3. Writes generated assets under `assets/comics/<slug>/`.
4. Writes the Jekyll post in `_posts/`.

The generation command used by the skill is:

```bash
HF_HOME="$PWD/.cache/huggingface" PYTORCH_CUDA_ALLOC_CONF=expandable_segments:True uv run --project .agents/skills/add-new-comic python .agents/skills/add-new-comic/scripts/generate_comic.py comic/specs/<slug>.json
```

Generated outputs include:

```txt
assets/comics/<slug>/control-panel-01.png
assets/comics/<slug>/raw-panel-01.png
assets/comics/<slug>/panel-01.png
assets/comics/<slug>/strip.png
assets/comics/<slug>/generation.json
_posts/YYYY-MM-DD-<slug>.md
```

`strip.png` is the final panels-only comic image embedded by the post. Page titles, credits, borders, and other surrounding chrome are supplied by Jekyll HTML/CSS, not baked into the PNG.

## Python dependencies

Use `uv` for Python management and package installation. The skill folder contains:

```txt
.agents/skills/add-new-comic/pyproject.toml
.agents/skills/add-new-comic/requirements.txt
```

Core libraries:

- torch
- diffusers
- transformers
- accelerate
- safetensors
- Pillow
- pydantic
- opencv-python
- peft

Default model:

```txt
stabilityai/stable-diffusion-xl-base-1.0
```

Default IP-Adapter:

```txt
repo: h94/IP-Adapter
subfolder: sdxl_models
weight: ip-adapter_sdxl.bin
reference: art-reference/training-reference.png + art-reference/ip-character-reference.png
reference crop mode: auto
scale: 0.82
```

The generator crops the clean training reference per panel, crops the two-character IP reference down to character-only anchors, and averages IP-Adapter image embeddings to avoid copying sheet grids/cards. ControlNet is enabled by default with reference-derived `control-panel-XX.png` layout guides:

```txt
model: diffusers/controlnet-canny-sdxl-1.0
mode: layout
scale: 0.88
start/end: 0.0 / 0.90
```

CUDA is expected for generation. Model CPU offload is enabled by default for 12 GB GPUs, and each panel is generated in an isolated worker process to avoid VRAM buildup. The compositor then converts soft SDXL output into crisp terminal line art, clips generated strokes to the reference-derived guide to remove scanlines/blobs, and merges that guide to repair character drift. The first run downloads Hugging Face model weights and may require accepted model terms / Hugging Face credentials in the environment.

## Review and commit a generated comic

After generation, inspect the generated files:

```bash
git status
git diff
```

Run the site locally if you want to preview the post:

```bash
./dev.sh
```

When it looks good, commit the spec, assets, and post:

```bash
git add comic/specs assets/comics _posts
git commit -m "Add my great joke comic"
```

## Contribute your own joke

Got a joke about AI coding, burnout, terminals, yak shaving, overconfident bots, or software nonsense? Please send it in.

1. Fork this repo.
2. Create a branch.
3. Use the `add-new-comic` skill to generate a comic from your joke.
4. Commit `comic/specs/<slug>.json`, `assets/comics/<slug>/`, and `_posts/YYYY-MM-DD-<slug>.md`.
5. Open a pull request.

Small premises are welcome. Half-baked ideas are welcome. If the premise is funny, Clanker can probably ruin it.

## Manual post format

Image comic posts live in `_posts/` and use filenames like:

```txt
_posts/2026-06-08-my-strip.md
```

Basic image post frontmatter/body:

```md
---
layout: post
title: My Strip
---

<div class="comic-strip image-comic">
  <img src="{{ '/assets/comics/my-strip/strip.png' | relative_url }}" alt="My Strip comic strip">
</div>
```

## GitHub Pages

This is a standard Jekyll project. Configure GitHub Pages to build from the repository branch, and GitHub will run Jekyll automatically.

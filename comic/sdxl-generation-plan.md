# SDXL Comic Generation Refactor Plan

Goal: replace the current deterministic SVG comic renderer with a non-deterministic SDXL image pipeline driven by the `add-new-comic` agent skill.

## Decisions

- The agent skill is the entrypoint for the full flow.
- The deterministic SVG renderer is not kept as a fallback.
- Existing generated posts should be regenerated with the new image-based pipeline.
- The Python generation code belongs with the agent skill and must respect the Agent Skills spec from agentskills.io.
- CUDA is expected to be available; target hardware is an RTX 3080 Ti 12 GB.
- Default model backend is SDXL.
- Default model is `stabilityai/stable-diffusion-xl-base-1.0`.
- Use generated image panels plus deterministic text/comic compositing, not model-rendered text.

## Recommended pipeline

```txt
user joke / premise
  -> add-new-comic skill
  -> turn premise into panel script + visual directions
  -> generate rough panel composition guides
  -> generate panel art with SDXL conditioned by references
  -> composite speech bubbles, captions, terminal text, borders with Python/Pillow
  -> write PNG panels/assets
  -> write Jekyll markdown post
```

## Why not plain text-to-image only

Plain SDXL text-to-image does not use files in `art-reference/` just because they exist in the repo. If the pipeline only sends a prompt, the model never sees the reference sheets.

To make the model actually follow the Clanker/dev visual identity, the new path should use image conditioning.

## Image conditioning strategy

### First implementation: SDXL + IP-Adapter

Use IP-Adapter to condition SDXL on project reference images.

Chosen default checkpoint:

```txt
repo: h94/IP-Adapter
subfolder: sdxl_models
weight: ip-adapter_sdxl.bin
```

Reference images now default to:

- `art-reference/training-reference.png`
- `art-reference/ip-character-reference.png`

The generator extracts large per-panel crops from the clean training sheet, extracts character-only crops from the two-character IP reference, and averages IP-Adapter image embeddings. This gives the model character/style identity without asking it to copy a full grid/reference sheet or character-card layout.

Expected benefits:

- Better style matching than prompt-only SDXL.
- No model training required.
- Works with existing reference sheets.

Known limitations:

- Character consistency may still drift.
- Multi-character panels can confuse identity.
- Reference strength will need tuning.

### Composition control: ControlNet

ControlNet is now enabled by default because SDXL + IP-Adapter alone did not match the references consistently enough.

The generator creates black/white composition guides from `art-reference/` character sprites plus generated props/effects for each panel and uses ControlNet to preserve structure:

- Dev position
- Clanker position
- terminal/monitor position
- important props
- reserved speech bubble areas
- panel framing

ControlNet helps composition, but does not replace IP-Adapter for style/identity. The generated guides are written as `assets/comics/<slug>/control-panel-XX.png` for review/debugging, and the compositor clips raw line art to the guide before merging it back into the final panel to repair drift and remove scanline/blob artifacts.

### Future improvement: SDXL LoRA

If IP-Adapter is not consistent enough, train a small SDXL LoRA for the comic style and characters.

This should be treated as a later phase because it requires a dataset and training workflow.

## Text and lettering

Do not rely on Stable Diffusion for readable text.

The Python compositor should add:

- speech bubbles
- captions
- terminal text
- panel borders
- title/credit if needed

This keeps the comic readable while allowing the art to be non-deterministic.

## Proposed file layout

```txt
.agents/skills/add-new-comic/SKILL.md
.agents/skills/add-new-comic/pyproject.toml
.agents/skills/add-new-comic/requirements.txt
.agents/skills/add-new-comic/scripts/models.py
.agents/skills/add-new-comic/scripts/generate_comic.py
.agents/skills/add-new-comic/scripts/generate_panel.py
.agents/skills/add-new-comic/scripts/composite_panel.py

assets/comics/<slug>/control-panel-01.png
assets/comics/<slug>/panel-01.png
assets/comics/<slug>/panel-02.png
assets/comics/<slug>/panel-03.png
assets/comics/<slug>/panel-04.png
assets/comics/<slug>/strip.png
_posts/YYYY-MM-DD-<slug>.md
```

Notes:

- Skill-local Python project metadata lives in `.agents/skills/add-new-comic/pyproject.toml` and is executed with `uv run --project .agents/skills/add-new-comic ...`.
- Generated comic assets should live under `assets/comics/<slug>/` so Jekyll can serve them directly.

## Python dependencies

Use Python 3.10+ and `uv` for Python management.

Core dependencies:

```txt
torch
diffusers
transformers
accelerate
safetensors
Pillow
pydantic
opencv-python
peft
```

The current ControlNet path uses Diffusers' SDXL ControlNet pipeline plus Pillow/OpenCV preprocessing; no separate renderer is used.

## Generation config

Create a config model for repeatable runs and easier tuning:

- model id
- refiner enabled/disabled
- IP-Adapter model/weights
- reference image paths
- image size
- steps
- guidance scale
- negative prompt
- seed policy
- output paths
- CUDA/device settings
- memory optimization toggles

Seed policy should allow both:

- non-deterministic generation by default
- optional explicit seed for debugging or reruns

## Post format

Image-based posts should use normal Jekyll markdown and embed the final panels-only strip image. Titles, credits, surrounding borders, and page chrome are provided by Jekyll HTML/CSS instead of being baked into the PNG.

Panels are generated separately for easier review and regeneration, then glued into one final strip image with the Pillow compositor.

Example:

```md
---
layout: post
title: The Refactor
---

<div class="comic-strip image-comic">
  <img src="/assets/comics/the-refactor/strip.png" alt="The Refactor comic strip">
</div>
```

## Refactor phases

### Phase 1: Document and prepare

- Confirm Agent Skills spec requirements.
- Update `add-new-comic` skill workflow.
- Add Python dependency documentation.
- Decide exact generated asset/post structure.

### Phase 2: Build image pipeline

- Add SDXL panel generator.
- Add IP-Adapter reference conditioning.
- Add prompt/config models.
- Add image compositor for bubbles, captions, terminal text, and panel borders.
- Add Jekyll post writer.

### Phase 3: Replace old flow

- Remove `comic/render-comic.js` and `comic/chat-to-spec.js` from the generation path.
- Remove `job.sh`; the agent skill is the only formal generation path.
- Remove deterministic-renderer assumptions from docs and skill text.
- Update README.

### Phase 4: Regenerate existing posts

Regenerate existing generated comics as image posts:

- `the-cycle-of-ai-coding-burnout`
- `the-dumb-zone`
- `the-refactor`

Review generated assets and posts before committing.

### Phase 5: Tune quality

- Tune reference image selection.
- Tune IP-Adapter scale.
- Tune negative prompts.
- Tune ControlNet layout guide strength and end step.
- Evaluate whether a future LoRA is needed.

## Open implementation questions

- Which IP-Adapter checkpoint should be used for SDXL?
- ControlNet is now part of the default path; tune guide generation and strength as needed.
- Generate separate panel images, then compose a final panels-only `strip.png`.
- Replace old JSON specs with a new image-generation spec format.
- Do not keep `job.sh`; the agent skill is the formal and only generation path.

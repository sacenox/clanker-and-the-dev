# Clanker and the Dev Comic Style Guide

This guide defines the visual identity and prompt vocabulary for the SDXL image-generation pipeline.

## Overall look

- Format: generated PNG comic panels composed into one panels-only `strip.png`.
- Mood: 80s terminal, hacker green on black, sparse and readable.
- Lines: clean neon line-art inspired by `art-reference/`; readable over detailed. The generator post-processes SDXL output back into crisp terminal strokes.
- Shapes: simple comic geometry and characters, no photorealism, no UI chrome.
- Background: black or near-black; avoid CRT scanlines, panels, windows, headers, footers, and texture unless explicitly needed.
- Panel borders: simple green comic frames added by the compositor.
- Characters must stay visually consistent between strips; auto ControlNet guides are built from `art-reference/` character sprites to enforce this.
- Dialogue, captions, code snippets, and panel borders are overlaid after image generation.

## Characters

### Dev

A human software engineer drawn as a refined terminal-style stick figure / simple comic character.

Persistent traits:

- Round head.
- Simple rectangular glasses.
- Minimal torso and limbs.
- Usually near a laptop or terminal when coding.
- Expressive body posture does most of the acting.
- Drawn in neon green / black terminal style, not photorealistic.

Useful acting words:

- neutral
- curious
- thinking
- excited
- overwhelmed
- typing
- resurrected-typing
- collapsed
- dead
- caffeinated

### Clanker

An AI-powered robot assistant drawn with simple geometric shapes matching the reference sheets.

Persistent traits:

- Boxy robot head with screen eyes.
- Antenna on top.
- Rectangular torso.
- Thin segmented arms and claw hands.
- More machine than humanoid, but readable/emotive.
- Drawn in neon green / black terminal style, not photorealistic.

Useful acting words:

- neutral
- helpful
- confident
- watching
- thinking
- overclocked
- concerned
- error
- celebratory
- sleeping

## Effects and props

Use effects sparingly in `artPrompt`:

- terminal cursor line (subtle, not blurry)
- sparks
- smoke
- sweat/panic marks
- speed lines
- boot-up cursor
- laptop as a prop
- code/output text via `terminalLines`, not a rendered app window
- token counter / progress meter as a visual prop only

Do not ask the model to render readable text in props. Put readable text in `terminalLines`, `caption`, or `dialogue`.

## Composition guidance

Each panel prompt should usually include:

- where Dev is positioned
- where Clanker is positioned
- the main prop, usually a laptop or terminal
- the emotion/acting of each character
- empty dark space near the top for speech bubbles
- black/neon green terminal mood

Example:

```txt
Dev on the left slumps over a terminal laptop, Clanker on the right stands confidently with one claw raised, pure black sparse background, empty dark upper area for speech bubbles.
```

## Text rules

Stable Diffusion should not draw readable text.

The compositor adds:

- speech bubbles
- captions
- code/output text
- simple panel borders

It does not add panel numbers, title cards, headers, footers, credits, or branding inside the PNG. Those belong in Jekyll HTML/CSS.

Keep dialogue short. Up to three dialogue/caption items per panel works best.

## Generation rules for Pi / agents

When generating a comic spec:

1. Output valid JSON only into `comic/specs/<slug>.json`.
2. Use the image-generation schema in `comic/schema.md`.
3. Do not write SVG.
4. Do not create inline-SVG markdown posts.
5. Do not use the old deterministic renderer or `job.sh`.
6. If a seed or joke has numbered beats, usually map one beat to one panel.
7. Put all readable comic lettering in `dialogue`, `caption`, or `terminalLines`, not in `artPrompt`.
8. Do not request title cards, headers, footers, app/browser chrome, watermarks, or metadata in generated art.

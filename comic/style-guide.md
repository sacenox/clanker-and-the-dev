# Clanker and the Dev Comic Style Guide

This guide defines the only visual vocabulary the comic generator may use.

## Overall look

- Format: simple SVG comic strip embedded in a markdown post.
- Mood: 80s terminal, hacker green on black, sparse and readable.
- Lines: clean neon SVG primitives inspired by `art-reference/`; readable over detailed.
- Shapes: rounded terminal UI, simple geometric characters, no photorealism.
- Background: black or near-black.
- Panel borders: green terminal lines.
- Characters must stay visually consistent between strips.

## Characters

### Dev

A human software engineer drawn as a refined terminal-style stick figure.

Persistent traits:

- Round stick-figure head.
- Simple rectangular glasses.
- Minimal torso and limbs.
- Usually near a laptop or terminal when coding.
- Expressive body posture does most of the acting.

Allowed `devPose` values:

- `neutral` - standing normally.
- `curious` - leaning in, interested.
- `thinking` - one hand near chin/head.
- `excited` - arms raised, energized.
- `overwhelmed` - arms up, panic/sweat energy.
- `typing` - seated/leaning at laptop.
- `resurrected-typing` - back from defeat, typing again.
- `collapsed` - lying flat, burned out.
- `dead` - lying flat with X eyes.
- `caffeinated` - jittery, over-alert.

### Clanker

An AI-powered robot assistant drawn with simple geometric shapes matching the reference sheets.

Persistent traits:

- Boxy robot head with screen eyes.
- Antenna on top.
- Rectangular torso.
- Thin segmented arms and claw hands.
- More machine than humanoid, but readable/emotive.

Allowed `clankerPose` values:

- `neutral` - idle robot stance.
- `helpful` - one arm raised like offering an answer.
- `confident` - stable posture, upbeat screen eyes.
- `watching` - observing the Dev or terminal.
- `thinking` - processing, antenna emphasis.
- `overclocked` - sparks/glow, too much compute.
- `concerned` - worried eyes/body angle.
- `error` - broken/error screen expression.
- `celebratory` - arms up, successful build vibe.
- `sleeping` - powered down/idle.

## Effects

Allowed `fx` values per panel:

- `small-glow`
- `screen-glow`
- `sparks`
- `terminal-cursor`
- `smoke`
- `sweat`
- `speed-lines`
- `boot`

Use effects sparingly. Prefer one or two per panel; the renderer expands them into reference-style SVG accents.

## Layouts

Allowed `layout` values:

- `auto` - renderer chooses based on panel count.
- `one-panel`
- `two-panel-row`
- `three-panel-row`
- `four-panel-grid`
- `five-panel-final-wide`
- `six-panel-grid`

Panel counts should normally be 3, 4, or 5.

## Caption rules

- Each panel gets one short caption, or a short `dialogue` array when two characters exchange lines in the same panel.
- Keep the seed's core joke intact.
- Do not over-explain.
- Markdown emphasis like `**dead**` is allowed in captions/dialogue; the renderer will simplify it for SVG text.
- Optional `captionSpeaker` values: `narrator`, `dev`, or `clanker`. Use `dev`/`clanker` when a line is dialogue; use `narrator` for setup or punchline captions.
- Optional `dialogue` entries use `{ "speaker": "dev", "text": "..." }`. Keep to 1-3 lines per panel.

## Optional panel props

Use these when the seed asks for visible counters or terminal activity:

- `tokenCounter`: short token meter text, for example `79,999 TOKENS` or `80,001 TOKENS`.
- `terminalLines`: 1-3 short terminal lines, for example `$ rm -rf ./src`.
- `captionSpeaker`: choose who owns the caption balloon (`narrator`, `dev`, or `clanker`).
- `dialogue`: up to 3 caption/speech lines in one panel, useful for Spittoon-style chat beats.

## Generation rules for Pi

When generating a comic spec:

1. Output valid JSON only into the requested spec file.
2. Use only enum values from this guide.
3. Do not draw SVG directly.
4. Do not create markdown posts directly.
5. Do not edit renderer files.
6. If a seed has numbered beats, usually map one beat to one panel.

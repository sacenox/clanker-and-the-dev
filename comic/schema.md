# Comic Spec Schema

Pi writes one JSON file matching this schema. The deterministic renderer reads it and writes the markdown post.

## Required shape

```json
{
  "title": "The Cycle of AI Coding Burnout",
  "slug": "the-cycle-of-ai-coding-burnout",
  "timestamp": "2026-06-08",
  "credit": "Ian for the original joke",
  "layout": "five-panel-final-wide",
  "panels": [
    {
      "caption": "wow",
      "captionSpeaker": "dev",
      "devPose": "curious",
      "clankerPose": "helpful",
      "fx": ["small-glow"]
    }
  ]
}
```

## Fields

- `title` string, required. Human-readable post title.
- `slug` string, required. Lowercase URL slug, `a-z`, `0-9`, and hyphens only.
- `timestamp` string, optional but preferred. Use `YYYY-MM-DD`.
- `credit` string, optional. Attribution line.
- `layout` string, required. Must be one of the allowed layout values in `comic/style-guide.md`.
- `panels` array, required. 1 to 6 panel objects.

## Panel fields

- `caption` string, required unless `dialogue` is present. Short caption shown in the panel.
- `captionSpeaker` string, optional with `caption`. Use `narrator`, `dev`, or `clanker`; defaults to `narrator`. Non-narrator captions render as speech balloons with tails.
- `dialogue` array, optional alternative to `caption`. Up to 3 objects like `{ "speaker": "dev", "text": "ship it?" }`; `speaker` must be `narrator`, `dev`, or `clanker`.
- `devPose` string, required. Must be an allowed `devPose` value from `comic/style-guide.md`.
- `clankerPose` string, required. Must be an allowed `clankerPose` value from `comic/style-guide.md`.
- `fx` array of strings, optional. Each item must be an allowed `fx` value from `comic/style-guide.md`.
- `tokenCounter` string, optional. Short display text like `79,999 TOKENS`.
- `terminalLines` array of strings, optional. Short terminal commands/output to show inside the panel. Keep to 1-3 short lines.

## Important constraints

- JSON only. No markdown fences.
- No comments.
- No trailing commas.
- Do not include SVG.
- Do not include HTML.
- Do not include extra explanatory text.

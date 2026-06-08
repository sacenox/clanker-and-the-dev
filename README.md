# Clanker and the Dev

A Jekyll/GitHub Pages comic-strip blog with deterministic SVG comics generated from markdown seeds.

## Run in Docker

```bash
./dev.sh
```

Open <http://localhost:4000>.

## Posts

Jekyll posts live in `_posts/` and use filenames like:

```txt
_posts/2026-06-08-my-strip.md
```

Basic post frontmatter:

```md
---
layout: post
title: My Strip
---

Post body goes here.
```

## Comic generation job

Drop seed markdown files in `comic/inbox/`, then run:

```bash
./job.sh
```

The job asks Pi to convert the first inbox seed into `comic/specs/<slug>.json`, then `comic/render-comic.js` deterministically renders an inline SVG Jekyll post at `_posts/YYYY-MM-DD-<slug>.md`.

You can also compile a Spittoon-style chat script directly into a spec:

```bash
node comic/chat-to-spec.js my-strip.chat comic/specs/my-strip.json
node comic/render-comic.js comic/specs/my-strip.json
```

Chat lines look like `dev->clanker: ship it? (curious/helpful) [screen-glow]`. Repeating a speaker starts a new panel, so two alternating speakers can share one panel as dialogue balloons.

Seed example:

```md
---
title: The Cycle of AI Coding Burnout
credit: Ian for the original joke
timestamp: 2026-06-08
---

1. wow
2. WOW
3. HOLY SHIT!
4. **dead**
5. Let's open nvim...
```

## GitHub Pages

The site is a standard Jekyll project. Configure GitHub Pages to build from the repository branch, and GitHub will run Jekyll automatically.

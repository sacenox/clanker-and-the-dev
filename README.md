# Clanker and the Dev

A Jekyll/GitHub Pages comic-strip blog about developers, AI tools, terminal gremlins, and jokes that compile into deterministic SVG comics.

The site is mostly markdown. Comic ideas start as small seed files in `comic/inbox/`; `./job.sh` turns a seed into a JSON comic spec and renders a Jekyll post with an inline SVG.

## Run locally

Local development runs in Docker only, so you do not need to install Ruby gems on your machine.

```bash
./dev.sh
```

Then open:

```txt
http://localhost:4000
```

The Docker container mounts the repo, so edits to posts, layouts, CSS, and generated comics are reflected by Jekyll.

## Generate a comic from an inbox item

1. Add a markdown seed to `comic/inbox/`:

   ```txt
   comic/inbox/my-great-joke.md
   ```

2. Use this seed format:

   ```md
   ---
   title: My Great Joke
   credit: Your Name / handle / inspiration
   timestamp: 2026-06-08
   ---

   1. Set up the premise.
   2. Escalate the developer pain.
   3. Let Clanker misunderstand everything.
   4. Land the punchline.
   ```

3. Run the generation job:

   ```bash
   ./job.sh
   ```

The job processes the first `*.md` file in `comic/inbox/` alphabetically. It asks Pi to convert the seed into `comic/specs/<slug>.json`, then runs `comic/render-comic.js` to create `_posts/YYYY-MM-DD-<slug>.md`.

On success, the seed moves to `comic/done/`. On failure, it moves to `comic/failed/`.

## Review and commit a generated comic

After running `./job.sh`, inspect the generated files:

```bash
git status
git diff
```

Run the site locally if you want to preview the strip:

```bash
./dev.sh
```

When it looks good, commit the seed, spec, and post:

```bash
git add comic/done comic/specs _posts
git commit -m "Add my great joke comic"
```

## Contribute your own joke

Got a joke about AI coding, burnout, terminals, yak shaving, overconfident bots, or software nonsense? Please send it in.

1. Fork this repo.
2. Create a branch.
3. Add your joke as a seed in `comic/inbox/`, or run `./job.sh` and commit the generated comic too.
4. Open a pull request.

Small seeds are welcome. Half-baked ideas are welcome. If the premise is funny, Clanker can probably ruin it.

## Manual post format

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

## Optional chat-script compiler

You can compile a Spittoon-style chat script directly into a comic spec:

```bash
node comic/chat-to-spec.js my-strip.chat comic/specs/my-strip.json
node comic/render-comic.js comic/specs/my-strip.json
```

Chat lines look like:

```txt
dev->clanker: ship it? (curious/helpful) [screen-glow]
```

Repeating a speaker starts a new panel, so two alternating speakers can share one panel as dialogue balloons.

## GitHub Pages

This is a standard Jekyll project. Configure GitHub Pages to build from the repository branch, and GitHub will run Jekyll automatically.

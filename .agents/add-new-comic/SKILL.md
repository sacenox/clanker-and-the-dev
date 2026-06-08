---
name: add-new-comic
description: Use when the user wants to add, generate, render, or submit a new Clanker and the Dev comic/joke. Covers creating comic inbox seeds, running the generation job, reviewing generated specs/posts, and preparing changes for commit or PR.
allowed-tools: Read, Write, Edit, Bash
---

# Add a New Clanker and the Dev Comic

This repo is a Jekyll/GitHub Pages comic-strip blog. Comics are generated from small markdown seed files in `comic/inbox/`.

Use this skill when a user asks to add a new comic, turn a joke into a strip, create an inbox item, run comic generation, or prepare a joke contribution.

## Important project rules

- Do not install Ruby gems locally.
- Local development runs through Docker with `./dev.sh`.
- Comic generation runs through `./job.sh`.
- Jekyll posts live in `_posts/`.
- Comic seeds start in `comic/inbox/` and move to `comic/done/` or `comic/failed/` after generation.
- Generated comic specs live in `comic/specs/`.
- The renderer is deterministic: `comic/render-comic.js` turns a JSON spec into an inline SVG post.

## Standard workflow

### 1. Turn the user's joke into an inbox seed

Create a slug from the title or premise:

```txt
comic/inbox/my-great-joke.md
```

Use this seed format:

```md
---
title: My Great Joke
credit: User / handle / inspiration
timestamp: YYYY-MM-DD
---

1. Set up the premise.
2. Escalate the developer pain.
3. Let Clanker misunderstand or over-optimize something.
4. Land the punchline.
```

Guidelines:

- Keep each numbered beat short and comic-panel-friendly.
- Usually one numbered beat becomes one panel.
- Preserve the user’s core joke and credit.
- Prefer jokes about AI coding, terminals, burnout, yak shaving, refactors, CI, bots, editors, production incidents, or software absurdity.
- If the user provides only a rough idea, turn it into 3–5 clear beats.

### 2. Run the comic generation job

Run:

```bash
./job.sh
```

The job processes the first `*.md` file in `comic/inbox/` alphabetically.

On success it creates/updates:

```txt
comic/specs/<slug>.json
_posts/YYYY-MM-DD-<slug>.md
comic/done/<slug>.md
```

On failure, the seed is moved to:

```txt
comic/failed/<slug>.md
```

### 3. Review generated files

Check status and diff:

```bash
git status
git diff
```

Inspect the generated post in `_posts/` and the generated spec in `comic/specs/`.

If the generation failed:

1. Read the failed seed in `comic/failed/`.
2. Fix the issue or move it back to `comic/inbox/`.
3. Re-run `./job.sh`.

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

If the user asks to commit, include the generated seed/spec/post:

```bash
git add comic/done comic/specs _posts
git commit -m "Add <comic title> comic"
```

If the user is contributing from a fork, remind them to open a pull request with their joke.

## Optional direct chat-script path

For dialogue-heavy strips, a chat script can be compiled directly:

```bash
node comic/chat-to-spec.js my-strip.chat comic/specs/my-strip.json
node comic/render-comic.js comic/specs/my-strip.json
```

Chat line format:

```txt
dev->clanker: ship it? (curious/helpful) [screen-glow]
```

Repeating a speaker starts a new panel; alternating speakers can share a panel as dialogue balloons.

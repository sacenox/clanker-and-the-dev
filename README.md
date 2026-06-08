# Clanker and the Dev

Minimal POC for a comic-strip blog using Hono, HTMX, Tailwind CDN, and markdown posts.

## Run in Docker

```bash
docker build -t clanker-and-the-dev .
docker run --rm -p 3000:3000 clanker-and-the-dev
```

Open <http://localhost:3000>.

## Posts

Add markdown files to `posts/` with frontmatter:

```md
---
name: My Strip
slug: my-strip
timestamp: 2026-06-08
---

# My Strip

![Panel 1](/path-or-url-to-image.png)
```

Jekyll-style filenames like `2026-06-08-my-strip.md` are also supported.

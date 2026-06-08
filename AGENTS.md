# Clanker and the Dev

This project is a website that follows the same format of a blog, but in addition of blog posts,
each "post" is a comic strip.

## Tech

- HTMX and Tailwind for frontend
- Hono.dev for the server 
- Deployed to https://render.com/ using a docker image (https://render.com/docs/docker)
- Run locally in docker image (Do not install locally)

## Look and feel

- Monospace font: VT323 (free Google Font) for an 80s terminal style.
- Hacker green on black, dark grayscale ui components borders, icons, buttons etc.
- Sidebar on the left, with sitename, and history of posts. and any other pages.
- Main pane shows content, or a splash screen with an "About section".

## Content is markdown

- Posts are markdown files, with simple metadata as frontmatter. they live in posts/
- Metadata has name, slug, and timestamp. Supports Jekyll post files.

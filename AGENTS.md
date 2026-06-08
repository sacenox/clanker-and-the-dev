# Clanker and the Dev

This project is a Jekyll/GitHub Pages comic-strip blog. Each post is a markdown page that usually contains an inline SVG comic strip.

## Tech

- Jekyll static site for GitHub Pages
- Tailwind CDN plus `assets/css/main.scss` for custom styling
- Local development runs in Docker only; do not install Ruby gems locally
- Comic generation uses Pi to create JSON specs, then `comic/render-comic.js` deterministically renders SVG posts

## Look and feel

- Monospace font: VT323 (free Google Font) for an 80s terminal style
- Hacker green on black, dark grayscale UI components, borders, icons, buttons, etc.
- Sidebar on the left with site name and post history
- Main pane shows content or the home splash screen

## Content is markdown

- Jekyll posts live in `_posts/`
- Post filenames use `YYYY-MM-DD-slug.md`
- Post frontmatter uses `layout: post` and `title`
- Comic seeds live in `comic/inbox/`; run `./job.sh` to generate posts

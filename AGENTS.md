# Clanker and the Dev

This project is a Jekyll/GitHub Pages comic-strip blog. Comic posts embed generated image strips from `assets/comics/<slug>/strip.png`.

## Tech

- Jekyll static site for GitHub Pages
- Tailwind CDN plus `assets/css/main.scss` for custom styling
- Local development runs in Docker only; do not install Ruby gems locally
- Comic generation uses the `.agents/skills/add-new-comic` skill to create image-generation JSON specs, then Python/SDXL generates panel PNGs and a final shareable `strip.png`

## Look and feel

- Monospace font: VT323 (free Google Font) for an 80s terminal style
- Hacker green on black, dark grayscale UI components, borders, icons, buttons, etc.
- Sidebar on the left with site name and post history
- Main pane shows content or the home splash screen

## Content is markdown

- Jekyll posts live in `_posts/`
- Post filenames use `YYYY-MM-DD-slug.md`
- Post frontmatter uses `layout: post` and `title`
- Comic specs live in `comic/specs/`
- Generated comic images live in `assets/comics/<slug>/`
- The `add-new-comic` agent skill is the only supported generation path
- Use `uv` for Python dependency and environment management

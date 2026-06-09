from __future__ import annotations

import argparse
import html
import json
import subprocess
import sys
from pathlib import Path

from PIL import Image, ImageOps

from composite_panel import composite_panel
from models import ComicSpec, load_spec


def default_project_root() -> Path:
    current = Path(__file__).resolve()
    for parent in current.parents:
        if (parent / "_config.yml").exists() and (parent / "AGENTS.md").exists():
            return parent
    raise RuntimeError("Could not locate repository root from skill script path")


def compose_strip(_comic: ComicSpec, panel_paths: list[Path], output_path: Path, _project_root: Path) -> Path:
    """Compose a panels-only comic image.

    Page titles, credits, labels, and other site chrome belong in HTML/CSS, not
    inside the generated PNG.  The strip image should be reusable as comic art
    without baked-in headers, footers, metadata, or branding bars.
    """
    output_path.parent.mkdir(parents=True, exist_ok=True)
    gap = 16
    panels = [Image.open(path).convert("RGB") for path in panel_paths]
    if not panels:
        raise ValueError("Cannot compose a strip with no panels")

    panel_width, panel_height = panels[0].size

    if len(panels) == 1:
        rows = [[panels[0]]]
        strip_width = panel_width
    elif len(panels) == 5:
        strip_width = panel_width * 2 + gap
        wide_final = Image.new("RGB", (strip_width, panel_height), "#000000")
        final_panel = ImageOps.contain(panels[4], (strip_width, panel_height), method=Image.Resampling.LANCZOS)
        wide_final.paste(final_panel, ((strip_width - final_panel.width) // 2, (panel_height - final_panel.height) // 2))
        rows = [[panels[0], panels[1]], [panels[2], panels[3]], [wide_final]]
    elif len(panels) == 3:
        rows = [panels]
        strip_width = panel_width * 3 + gap * 2
    else:
        cols = 2 if len(panels) in (2, 4) else 3
        rows = [panels[i : i + cols] for i in range(0, len(panels), cols)]
        strip_width = panel_width * cols + gap * (cols - 1)

    strip_height = sum(row[0].height for row in rows) + gap * (len(rows) - 1)
    strip = Image.new("RGB", (strip_width, strip_height), "#000000")

    y = 0
    for row in rows:
        row_width = sum(panel.width for panel in row) + gap * (len(row) - 1)
        x = (strip_width - row_width) // 2
        for panel in row:
            strip.paste(panel, (x, y))
            x += panel.width + gap
        y += row[0].height + gap

    strip.save(output_path)
    return output_path


def write_post(comic: ComicSpec, strip_path: Path, project_root: Path) -> Path:
    post_path = project_root / "_posts" / f"{comic.timestamp}-{comic.slug}.md"
    asset_path = "/" + strip_path.relative_to(project_root).as_posix()
    alt = html.escape(f"{comic.title} comic strip", quote=True)
    credit = f"\n<p class=\"comic-credit\">Credit: {html.escape(comic.credit)}</p>\n" if comic.credit else ""
    title_yaml = comic.title.replace('"', '\\"')
    body = f"""---
layout: post
title: "{title_yaml}"
---

<div class="comic-strip image-comic">
  <img src="{{{{ '{asset_path}' | relative_url }}}}" alt="{alt}">
</div>{credit}
"""
    post_path.parent.mkdir(parents=True, exist_ok=True)
    post_path.write_text(body, encoding="utf-8")
    return post_path


def generate_panel_in_worker(
    spec_path: Path,
    panel_index: int,
    raw_path: Path,
    output_dir: Path,
    project_root: Path,
) -> int:
    seed_path = output_dir / f"seed-panel-{panel_index:02d}.json"
    worker_path = Path(__file__).with_name("generate_panel_worker.py")
    subprocess.run(
        [
            sys.executable,
            str(worker_path),
            str(spec_path),
            str(panel_index),
            str(raw_path),
            "--project-root",
            str(project_root),
            "--seed-output",
            str(seed_path),
        ],
        check=True,
    )
    data = json.loads(seed_path.read_text(encoding="utf-8"))
    seed_path.unlink(missing_ok=True)
    return int(data["seed"])


def write_generation_metadata(output_dir: Path, panel_seeds: list[int], comic: ComicSpec) -> Path:
    metadata_path = output_dir / "generation.json"
    metadata = {
        "title": comic.title,
        "slug": comic.slug,
        "timestamp": comic.timestamp,
        "modelId": comic.generation.modelId,
        "ipAdapterRepo": comic.generation.ipAdapterRepo,
        "ipAdapterWeight": comic.generation.ipAdapterWeight,
        "ipAdapterScale": comic.generation.ipAdapterScale,
        "referenceImages": comic.generation.referenceImages,
        "referenceCropMode": comic.generation.referenceCropMode,
        "enableControlNet": comic.generation.enableControlNet,
        "controlNetModelId": comic.generation.controlNetModelId if comic.generation.enableControlNet else None,
        "controlGuideMode": comic.generation.controlGuideMode if comic.generation.enableControlNet else None,
        "controlNetScale": comic.generation.controlNetScale if comic.generation.enableControlNet else None,
        "controlNetStart": comic.generation.controlNetStart if comic.generation.enableControlNet else None,
        "controlNetEnd": comic.generation.controlNetEnd if comic.generation.enableControlNet else None,
        "artPostprocessMode": comic.generation.artPostprocessMode,
        "lineArtThreshold": comic.generation.lineArtThreshold,
        "lineArtStroke": comic.generation.lineArtStroke,
        "panelSeeds": panel_seeds,
    }
    metadata_path.write_text(json.dumps(metadata, indent=2) + "\n", encoding="utf-8")
    return metadata_path


def generate_comic(spec_path: Path, project_root: Path) -> None:
    comic = load_spec(spec_path)
    output_dir = project_root / "assets" / "comics" / comic.slug
    output_dir.mkdir(parents=True, exist_ok=True)

    panel_paths: list[Path] = []
    panel_seeds: list[int] = []
    for index, panel in enumerate(comic.panels, start=1):
        raw_path = output_dir / f"raw-panel-{index:02d}.png"
        panel_path = output_dir / f"panel-{index:02d}.png"
        seed = generate_panel_in_worker(spec_path, index, raw_path, output_dir, project_root)
        composite_panel(
            raw_path,
            panel_path,
            panel,
            project_root,
            index,
            comic.generation.artPostprocessMode,
            comic.generation.lineArtThreshold,
            comic.generation.lineArtStroke,
        )
        panel_paths.append(panel_path)
        panel_seeds.append(seed)
        print(f"Generated {panel_path.relative_to(project_root)} with seed {seed}")

    strip_path = compose_strip(comic, panel_paths, output_dir / "strip.png", project_root)
    post_path = write_post(comic, strip_path, project_root)
    metadata_path = write_generation_metadata(output_dir, panel_seeds, comic)

    print(f"Wrote {strip_path.relative_to(project_root)}")
    print(f"Wrote {post_path.relative_to(project_root)}")
    print(f"Wrote {metadata_path.relative_to(project_root)}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate a Clanker and the Dev SDXL comic from a JSON spec")
    parser.add_argument("spec", type=Path, help="Path to comic image-generation spec JSON")
    parser.add_argument(
        "--project-root",
        type=Path,
        default=default_project_root(),
        help="Repository root. Defaults to the parent repo of this skill.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    generate_comic(args.spec.resolve(), args.project_root.resolve())


if __name__ == "__main__":
    main()

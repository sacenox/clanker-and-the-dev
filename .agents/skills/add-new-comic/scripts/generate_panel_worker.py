from __future__ import annotations

import argparse
import json
from pathlib import Path

from generate_panel import generate_panel_art
from models import load_spec


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate one raw SDXL panel in an isolated worker process")
    parser.add_argument("spec", type=Path, help="Path to comic image-generation spec JSON")
    parser.add_argument("panel_index", type=int, help="1-based panel index to generate")
    parser.add_argument("output", type=Path, help="Raw panel PNG output path")
    parser.add_argument("--project-root", type=Path, required=True, help="Repository root")
    parser.add_argument("--seed-output", type=Path, required=True, help="Path to write generated seed JSON")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    comic = load_spec(args.spec.resolve())
    if args.panel_index < 1 or args.panel_index > len(comic.panels):
        raise ValueError(f"panel_index must be 1..{len(comic.panels)}, got {args.panel_index}")

    _, seed = generate_panel_art(
        comic,
        comic.panels[args.panel_index - 1],
        args.panel_index,
        args.project_root.resolve(),
        args.output.resolve(),
    )
    args.seed_output.parent.mkdir(parents=True, exist_ok=True)
    args.seed_output.write_text(json.dumps({"seed": seed}) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()

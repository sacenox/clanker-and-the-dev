#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

mkdir -p comic/inbox comic/done comic/failed comic/specs _posts

seed="$(find comic/inbox -maxdepth 1 -type f -name '*.md' | sort | head -n 1 || true)"

if [[ -z "${seed}" ]]; then
  echo "No comic seeds found in comic/inbox."
  exit 0
fi

base="$(basename "$seed")"
slug="${base%.md}"
spec="comic/specs/${slug}.json"

move_seed() {
  local dest_dir="$1"
  local dest="${dest_dir}/${base}"

  if [[ -e "$dest" ]]; then
    dest="${dest_dir}/${slug}-$(date +%Y%m%d%H%M%S)-$$.md"
  fi

  mv -- "$seed" "$dest"
  echo "Moved seed to $dest"
}

prompt="$(cat <<PROMPT
You are generating a structured comic spec for Clanker and the Dev.

Read these files:
- comic/style-guide.md
- comic/schema.md
- ${seed}

Task:
- Convert the seed into one valid comic spec JSON object.
- Write that JSON object to exactly: ${spec}
- Overwrite ${spec} if it already exists.

Hard rules:
- Use only layout, devPose, clankerPose, and fx enum values documented in comic/style-guide.md.
- Usually map each numbered beat in the seed to one panel.
- Preserve the core joke and attribution from the seed.
- Do not write markdown.
- Do not write SVG.
- Do not edit files outside ${spec}.
- Do not edit renderer files.
- The spec file must contain JSON only: no markdown fences, no comments, no explanation.
PROMPT
)"

if pi --no-session --approve --tools read,write -p "$prompt" && node comic/render-comic.js "$spec"; then
  move_seed comic/done
  exit 0
fi

move_seed comic/failed
exit 1

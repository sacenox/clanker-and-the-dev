#!/bin/bash
set -euo pipefail

IMAGE=clanker-and-the-dev
UID_GID="$(id -u):$(id -g)"

docker build -t "$IMAGE" .

# Older runs created Jekyll output/cache files as root inside the bind mount.
# Fix ownership first, then run the server as the host user.
docker run --rm \
  -v "$PWD:/app" \
  "$IMAGE" \
  sh -c "mkdir -p /app/_site /app/.jekyll-cache /app/.sass-cache && chown -R $UID_GID /app/_site /app/.jekyll-cache /app/.sass-cache"

docker run --rm -it \
  --user "$UID_GID" \
  -p 4000:4000 \
  -p 35729:35729 \
  -v "$PWD:/app" \
  "$IMAGE"

#!/bin/bash
set -euo pipefail

docker build -t clanker-and-the-dev .
docker run --rm -it \
  -p 4000:4000 \
  -v "$PWD:/app" \
  clanker-and-the-dev

#!/bin/bash

docker build -t clanker-and-the-dev .
docker run --rm -p 3000:3000 clanker-and-the-dev

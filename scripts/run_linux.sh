#!/usr/bin/env sh
set -eu
if [ ! -x build/miniworld ]; then
  echo "Game executable not found. Run: ./scripts/build_linux.sh"
  exit 1
fi
exec ./build/miniworld

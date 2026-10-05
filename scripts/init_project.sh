#!/usr/bin/env bash
# Create a new motion project: copies the engine, the scripts and the example build.
# usage: bash init_project.sh <target-folder>
set -e
SK="$(cd "$(dirname "$0")/.." && pwd)"; T="${1:?usage: init_project.sh <target-folder>}"
mkdir -p "$T/VO"
cp "$SK"/engine/* "$T"/
cp "$SK"/scripts/*.py "$SK"/scripts/*.mjs "$T"/
cp "$SK"/example/build.py "$SK"/example/gallery.py "$SK"/example/script.txt "$T"/
echo "Project ready in $T"
echo "Next: cd $T && python3 estimate_timings.py script.txt timings.json && python3 build.py && node check.mjs"

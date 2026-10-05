#!/usr/bin/env python3
"""Cut the part's voiceover into per-shot clips (for previewing single shots in the browser).
usage: python split_audio.py VO/part1.mp3 timings.json [hold=2.0]   -> VO/p1-s01.mp3 ...
Uses the same cut points as build.py (middle of each pause)."""
import sys, subprocess, os, re
from timing import Timeline
mp3, tj = sys.argv[1], sys.argv[2]; hold = float(sys.argv[3]) if len(sys.argv) > 3 else 2.0
T = Timeline(tj, hold); d = os.path.dirname(mp3) or "."
m = re.search(r"part(\d+)", os.path.basename(mp3)); part = m.group(1) if m else "1"
for n in sorted(T.DUR):
    o = os.path.join(d, f"p{part}-s{n:02d}.mp3")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(T.OFF[n]), "-t", str(T.DUR[n]), "-i", mp3,
                    "-af", "apad", "-t", str(T.DUR[n]), "-c:a", "libmp3lame", "-q:a", "2", o], check=True)
    print(o, T.DUR[n])

#!/usr/bin/env python3
"""Stand-in timings before a voiceover exists (same format as vosync.py output).

    python estimate_timings.py <script.txt|.md> <out-timings.json> [--block N] [--wps 2.5] [--gap 0.9]

wps = spoken words per second (2.5 ≈ 150 wpm, a calm documentary read).
Sentence ends add a 0.35s pause, '...' adds 0.5s, paragraphs are separated by --gap.
When the real audio arrives, replace this file with vosync.py's output and rebuild:
every cue is tied to a word, so the whole film re-times itself."""
import sys, json
from _script_text import paragraphs, words

args = [a for a in sys.argv[1:] if not a.startswith("--")]
opts = dict(a[2:].split("=", 1) for a in sys.argv[1:] if a.startswith("--") and "=" in a)
if len(args) < 2:
    sys.exit(__doc__)
script, out = args[:2]
wps = float(opts.get("wps", 2.5)); gap = float(opts.get("gap", 0.9)); block = int(opts.get("block", 1))

t = 0.4; res = []
for pi, p in enumerate(paragraphs(script, block)):
    ws = []
    for w in words(p):
        d = max(0.18, len(w) * 0.055 + 0.12) / (wps / 2.5)
        ws.append([w, round(t, 2), round(t + d * 0.85, 2)])
        t += d
        if w.endswith((".", "?", "!", '."', '?"')): t += 0.35
        if w.endswith(("...", "…")) or w.endswith(','): t += 0.12
    res.append(dict(n=pi + 1, start=ws[0][1], end=ws[-1][2], words=ws, text=p))
    t += gap
json.dump(dict(duration=round(t, 2), matched=0, total=sum(len(p["words"]) for p in res),
               paras=res, estimated=True), open(out, "w"), indent=1)
print(f"estimated {t:.1f}s for {len(res)} paragraphs -> {out}")

#!/usr/bin/env python3
"""Measure a real voiceover: word-level timestamps aligned to the script.

    python vosync.py <audio.mp3> <script.txt|.md> <out-timings.json> [--block N] [--model small.en]

Needs: pip install faster-whisper ; ffmpeg on PATH.
Prints a per-paragraph table and the transcript so you can spot dropped or
mis-read lines. Writes {duration, matched, total, paras:[{n,start,end,words:[[w,s,e]...],text}]}.
Unmatched script words (numbers spoken as words, e.g.) are interpolated."""
import sys, json, difflib, subprocess
import numpy as np
from _script_text import paragraphs, norm, words

args = [a for a in sys.argv[1:] if not a.startswith("--")]
opts = dict(a[2:].split("=", 1) for a in sys.argv[1:] if a.startswith("--") and "=" in a)
if len(args) < 3:
    sys.exit(__doc__)
mp3, script, out = args[:3]
block = int(opts.get("block", 1)); model_name = opts.get("model", "small.en")

paras = paragraphs(script, block)
seq = [(pi, w, norm(w)) for pi, p in enumerate(paras) for w in words(p)]

from faster_whisper import WhisperModel
pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", mp3, "-f", "s16le", "-ac", "1", "-ar", "16000", "-"],
                     capture_output=True, check=True).stdout
audio = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768.0
model = WhisperModel(model_name, device="cpu", compute_type="int8")
segs, info = model.transcribe(audio, word_timestamps=True, beam_size=5)
heard = [(w.start, w.end, w.word.strip()) for s in segs for w in s.words]

sm = difflib.SequenceMatcher(None, [s[2] for s in seq], [norm(h[2]) for h in heard], autojunk=False)
times = [None] * len(seq)
for a, b, n in sm.get_matching_blocks():
    for k in range(n):
        times[a + k] = (heard[b + k][0], heard[b + k][1])
idx = [i for i, t in enumerate(times) if t]
for i in range(len(times)):
    if times[i] is None:
        prv = max([j for j in idx if j < i], default=None); nxt = min([j for j in idx if j > i], default=None)
        if prv is None: times[i] = times[nxt]
        elif nxt is None: times[i] = times[prv]
        else:
            t = times[prv][1] + (times[nxt][0] - times[prv][1]) * (i - prv) / (nxt - prv); times[i] = (t, t)

res = []
for pi, p in enumerate(paras):
    ws = [[seq[i][1], round(times[i][0], 2), round(times[i][1], 2)] for i in range(len(seq)) if seq[i][0] == pi]
    res.append(dict(n=pi + 1, start=ws[0][1], end=ws[-1][2], words=ws, text=p))
json.dump(dict(duration=round(info.duration, 2), matched=len(idx), total=len(seq), paras=res), open(out, "w"), indent=1)
print(f"duration {info.duration:.2f}s · matched {len(idx)}/{len(seq)} script words")
for p in res:
    print(f"{p['n']:2d}  {p['start']:7.2f} – {p['end']:7.2f}  {p['text'][:60]}")
print("\nHEARD:", " ".join(h[2] for h in heard))

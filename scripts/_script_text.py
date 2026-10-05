"""Shared: read a voiceover script into paragraphs (one paragraph = one shot).

Accepts a .txt with blank-line-separated paragraphs, or a .md containing
```text blocks (pick one with block=N, 1-based). Square-bracket delivery tags
like [Measured, neutral] are stripped from the spoken text."""
import re
from pathlib import Path

def paragraphs(path, block=1):
    raw = Path(path).read_text()
    blocks = re.findall(r"```text\n(.*?)```", raw, re.S)
    if blocks:
        raw = blocks[block - 1]
    paras = [p.strip() for p in raw.strip().split("\n\n") if p.strip()]
    return [re.sub(r"\[[^\]]*\]", "", p).strip() for p in paras]

def norm(w):
    return re.sub(r"[^a-z0-9]", "", w.lower())

def words(p):
    return [w for w in p.replace("...", " ").replace("…", " ").split() if norm(w)]

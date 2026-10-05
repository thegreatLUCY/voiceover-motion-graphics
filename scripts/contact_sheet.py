#!/usr/bin/env python3
"""Tile screenshots into one review image (6 per row, labelled).
usage: python contact_sheet.py out.png frame1.png frame2.png ...   (needs Pillow)"""
import sys, os
from PIL import Image, ImageDraw
out, files = sys.argv[1], sys.argv[2:]
W, H = 360, 640; cols = min(6, len(files)); rows = (len(files) + cols - 1) // cols
s = Image.new("RGB", (cols * W, rows * (H + 24)), (30, 30, 30)); d = ImageDraw.Draw(s)
for i, f in enumerate(files):
    im = Image.open(f).convert("RGB").resize((W, H)); x = (i % cols) * W; y = (i // cols) * (H + 24)
    s.paste(im, (x, y + 24)); d.text((x + 6, y + 6), os.path.basename(f)[:-4], fill=(230, 230, 230))
s.save(out); print("wrote", out)

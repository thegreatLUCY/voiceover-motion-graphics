#!/usr/bin/env python3
"""Page template for one beat (shot). Imported by build.py.

Token replacement, NOT str.format(): beat bodies are full of CSS/JS braces.
Each page is self-contained: open it in Chrome, press space to play, G for
safe zones, R to replay, arrows to scrub; load the shot's audio to sync.
"""

GSAP = """<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/EasePack.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/CustomEase.min.js"></script>"""

HEAD = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>@PROJECT@ · PART @PART@ · SHOT @N@ — @TITLE@</title>
<link rel="stylesheet" href="shared.css">
<link rel="stylesheet" href="palettes.css">
<script src="beats.js"></script>
@GSAP@
</head>
<body data-offset="@OFF@" data-dur="@DUR@" data-beat="@N@" data-part="@PART@" data-grain="@GRAIN@" data-palette="@PALETTE@">

<script src="defs.js"></script>
<script src="kit.js"></script>
<div id="wrap">
<div id="stage">
  <div class="layer" style="background:@BG@"></div>
@BODY@
  <div class="layer" id="cutBlack" style="background:@BG@@CUTOP@"></div>
</div>

<div class="legend">@LEGEND@</div>
</div>

<div id="ui">
  <h1>Part @PART@ · Shot @N@ — @TITLE@</h1>
  <div class="sub">@TC@ · @DUR@s</div>

  <div id="tc">00.00</div>
  <div id="bar"><div id="fill"></div></div>
  <div id="beatMarks"></div>
  <div id="nowBeat">&nbsp;</div>

  <button id="play">&#9654; PLAY</button>
  <button id="replay">&#8635; REPLAY</button>
  <button id="guide">SAFE ZONES (G)</button>

  <div style="margin-top:14px">
    <div style="margin-bottom:6px">Load <code>@FILE@.mp3</code>:</div>
    <input type="file" id="vo" accept="audio/*">
  </div>

  <div style="margin-top:14px;font-size:10px;color:#48505F">
    <a href="index.html" style="color:#4E9FDB;text-decoration:none">ALL SHOTS</a>
    &nbsp;·&nbsp; <a href="@PREV@" style="color:#5AD3A2;text-decoration:none">PREV</a>
    &nbsp;·&nbsp; <a href="@NEXT@" style="color:#5AD3A2;text-decoration:none">NEXT</a>
  </div>

  <div id="beatList"></div>

  <details><summary>SHOT NOTES</summary><div class="note">
@NOTES@
    <br><br>
    <b>Keys:</b> space play &middot; R replay &middot; G safe zones &middot; F fullscreen &middot; &larr;/&rarr; scrub
  </div></details>
</div>

<script src="shared.js"></script>
<script>if($("#guide"))$("#guide").onclick=e=>toggleGuides(e.target);</script>
@MOTION@
<script>
@SCRIPT@
</script>
</body>
</html>
"""


def build(d, part=1, total_shots=1, project="PROJECT"):
    """d: dict with n, title, off, dur, bg, tc, body, script, notes, legend,
    file, optional grain (0-0.1), palette (see palettes.css) and gsap (True to load GSAP + motion.js)."""
    n = d["n"]
    s = HEAD
    gs = bool(d.get("gsap"))
    sub = {"@PROJECT@": project, "@N@": str(n), "@TITLE@": d["title"], "@OFF@": str(d["off"]),
           "@DUR@": str(d["dur"]), "@PART@": str(part), "@BG@": d.get("bg", "#080A0F"),
           "@TC@": d.get("tc", ""), "@LEGEND@": d.get("legend", ""),
           "@BODY@": d["body"], "@SCRIPT@": d["script"], "@NOTES@": d.get("notes", ""),
           "@FILE@": d["file"], "@GRAIN@": str(d.get("grain", .05)),
           "@GSAP@": GSAP if gs else "",
           "@PALETTE@": d.get("palette", ""),
           # GSAP has no backwards fill: the closing plate must start hidden or it covers the shot
           "@CUTOP@": ";opacity:0" if gs else "",
           "@MOTION@": '<script src="motion.js"></script>' if gs else "",
           "@PREV@": ("p%d-s%02d.html" % (part, n - 1)) if n > 1 else "index.html",
           "@NEXT@": ("p%d-s%02d.html" % (part, n + 1)) if n < total_shots else "index.html"}
    for k, v in sub.items():
        s = s.replace(k, v)
    return s

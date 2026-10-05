---
name: voiceover-motion-graphics
description: Build premium, broadcast-quality motion-graphics videos as HTML "beat" files (hand-built SVG illustration + CSS/GSAP animation) where every animation lands on a spoken word of a voiceover, then validate, review and render them to a frame-exact MP4. Use this whenever someone wants an explainer video, a narrated short, a vertical TikTok/Reels/Shorts video, kinetic typography, an animated documentary segment, data animation timed to narration, "motion graphics for my script", "animate my voiceover", or wants to turn a script or ElevenLabs/TTS audio into a video — even if they don't say "motion graphics" or "HTML". Also use it to improve, retime or re-render existing beat files.
---

# Voiceover-synced motion graphics

You will produce a video as a folder of HTML pages — one page per **beat** (one paragraph of
voiceover = one shot). Each page is a 1080×1920 stage with layered SVG artwork and animations that
are **tied to the exact moment a word is spoken**. A validator catches silent bugs, a review loop
catches visual ones, and a renderer turns the pages plus the audio into an MP4.

The quality bar is "looks like a studio made it": lit illustration rather than clip-art, deliberate
easing, varied motion, readable typography, and nothing on screen that the voice isn't saying. The
engine in this skill already solves the hard technical parts; your job is mostly design and
choreography — and looking at your own frames honestly.

## What's in this skill

```
engine/      shared.css (design tokens, ~100 keyframes, card styles), shared.js (clock, playback,
             kinetic type, word sync, card/page builders), motion.js (GSAP camera rig, parallax),
             defs.js (artwork: example scenes in one art direction + a STYLE KIT of primitives for any
             look — paper, blueprint, ink, isometric, neon, lit 3D, organic shapes, textures)
scripts/     init_project.sh · estimate_timings.py · vosync.py · timing.py · beat_template.py
             check.mjs · review.mjs · grab.mjs · contact_sheet.py · render.mjs · split_audio.py
example/     build.py + script.txt — a 6-shot demo: narrator card, camera-rigged scene, quote card,
             data on the word, a six-style sampler, end card. Copy its patterns, not its pictures.
references/  drawing-anything.md · design-system.md · motion-grammar.md · illustration.md
             engine-api.md · failure-modes.md · voiceover.md · review-checklist.md
```

**Requirements:** Python 3 (+ Pillow for contact sheets), Node 18+, ffmpeg, Playwright with a
Chromium build (run `npm i playwright && npx playwright install chromium` inside the project folder,
or set `PWC`/`EXE` env vars — see `scripts/render.mjs`), and for real voiceovers `pip install faster-whisper`. Pages load Google
Fonts and (for camera shots) GSAP from jsDelivr, so rendering needs network access.

## Workflow

### 1. Script first: one paragraph per shot
Get or write the voiceover as blank-line-separated paragraphs. Each paragraph becomes one shot, so
shape paragraphs around *what the viewer should see*, not just sentences. Read
`references/voiceover.md` for the format (bracketed delivery tags for ElevenLabs, numbers spelled
out, quotes verbatim) and pacing targets (~150 words/minute, a visual change every 2–4 s).

### 2. Create the project
```bash
bash <skill>/scripts/init_project.sh ./motion      # copies engine + scripts + example build
cd motion && cp ../my-script.txt script.txt
python3 estimate_timings.py script.txt timings.json   # stand-in timings until audio exists
```

### 3. Art direction and shot design — before any code
1. **Choose the film's visual language from its story**, not from what's already in `defs.js`.
   Read `references/drawing-anything.md`: pick a style (lit vector, paper cut-out, blueprint, ink,
   isometric, neon, 3D forms, documentary data, halftone… or your own), write 3–5 rules for it, and
   decide the colour semantics (`references/design-system.md`). The bundled rooms and silhouettes
   are worked examples of one style — reuse them only when they are genuinely the right image.
2. **Plan every shot** in a short table: the words, the one idea the frame must communicate, the
   visual metaphor (generate a few, keep the most concrete), the entrance type, and which words
   trigger which events.
Ten minutes here prevents the two most common failures: every video looking the same regardless of
topic, and a sequence of pretty but meaningless frames that all animate the same way.

### 4. Build the shots
Edit `build.py` (start from the example). Each shot is a dict with an HTML `body` (layers) and a
`script` (choreography). Every timing comes from the timeline helpers:

```python
T = Timeline("timings.json", hold=2.0)
T.W(n, "word")          # when "word" starts in shot n (local seconds)
T.WE(n, "word")         # when it ends
T.WS(n, "from", "to")   # start time of every word in a range -> pass to EL.syncWords / EL.pages
```

Because every cue is a word, swapping estimated timings for real ones re-times the whole film.
Draw new artwork for the project — that's expected, not optional. Put it in `defs.js` as functions
(never big inline SVG blobs in shots), built from the style kit and the construction techniques in
`drawing-anything.md`, and screenshot each hero illustration on its own to refine it before
animating it. Read `references/engine-api.md` for the helpers (`EL.pages`, `EL.ncard`, `EL.syncWords`,
`EL.kinetic`, `M.cam`/`M.plane`/`M.parallax`, the keyframe catalogue) and
`references/illustration.md` + `references/motion-grammar.md` for how to make it look expensive.

### 5. Validate
```bash
python3 build.py && node check.mjs      # must print PASS
```
`check.mjs` catches the bugs that are invisible in code review: animations pointing at missing
keyframes, full-frame plates left covering the stage, fade-outs without `fill:"forwards"`,
animations running past the cut, gaps/overlaps between shots, broken choreography. Read
`references/failure-modes.md` once — every item cost real hours.

### 6. Review with your eyes — at least two passes
```bash
node review.mjs review 1     # screenshots every shot at 30% / 60% / 95% + contact sheets
```
Open the contact sheets and actually look. Score each shot with `references/review-checklist.md`
(legibility, ≤25 words on screen, safe zone, lighting/depth, motion variety, colour meaning,
accuracy to the voiceover). Fix, rebuild, re-review. Models tend to declare victory from code; the
frames are the truth. Don't hand over anything you haven't seen rendered.

### 7. Drop in the real voiceover
```bash
python3 vosync.py VO/part1.mp3 script.txt timings.json   # word timestamps from the real read
python3 build.py && node check.mjs && node review.mjs review 1
python3 split_audio.py VO/part1.mp3 timings.json          # optional: per-shot clips for browser preview
```
`vosync.py` prints the transcript next to each paragraph — check that no line was dropped or misread
before trusting the timings.

### 8. Render
```bash
node render.mjs 1 30 video.mp4 VO/part1.mp3     # 1080x1920, H.264 + AAC, frame-exact
```
Long videos can be split into parts: name shots `p2-s01.html…` and render part 2 the same way.
Spot-check the MP4 (`ffprobe` durations of video and audio should match; grab a few frames with
ffmpeg) before delivering. Hand over the MP4, the HTML pages, `index.html` (gallery) and the
contact sheets.

## Principles (why the rules exist)

- **The voice is the clock.** Viewers notice a caption that runs ahead of the narrator immediately;
  it reads as cheap. Word-synced reveals (`EL.syncWords`) are the single biggest quality lever.
- **One idea per frame, ≤25 words visible.** Vertical video is watched on phones, often muted.
  If a frame needs more, sequence it — pages that turn (`EL.pages`) rather than paragraphs that pile up.
- **Colour carries meaning.** Assign each accent colour exactly one meaning and never break it; then
  colour changes become storytelling (a colour's first appearance can be a reveal).
- **Light makes vector art look real.** One key light, gradients, rim highlights, contact shadows,
  depth planes and a slow camera move turn flat shapes into a "shot". Flat fills read as clip-art.
- **Vary the motion language.** Masked rises, line draws, count-ups, stamps, highlight sweeps,
  pictogram staggers, wipes. Identical fades on every element is the fastest way to look amateur.
- **Restraint where it matters.** For heavy or sensitive moments, stillness and plainness are more
  powerful than effects. Don't decorate grief, risk or numbers people must take seriously.
- **Honesty on screen.** Schematic charts must say they're schematic; quotes are verbatim with a
  citation; derived numbers (like a percentile computed from an effect size) are labelled as derived.

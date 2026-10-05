# Illustration that looks expensive (hand-built SVG)

All artwork is SVG built by functions in `defs.js`. No emoji, icon fonts, clip-art or stock
icons (images the user supplies are fine — see `drawing-anything.md` §5). For worked examples of one style (lit flat vector), see (`roomWall/roomWindow/roomFurniture`, `figure`,
`figureStanding`, `bench`, `hospitalRoom`). For other styles and for drawing new subjects, read `drawing-anything.md` first.

## The five ingredients
1. **One key light** (default top-right). Everything is lit consistently from it.
2. **Gradients on every solid** (3+ stops) that follow the light. Flat fills = clip-art.
3. **Rim light** on the lit edge of subjects: a 2–4 px stroke in a warm/cool highlight colour with
   `filter="url(#glowF)"`, partial path only (back, top of head, shoulder).
4. **Contact shadows**: a blurred ellipse under every grounded object
   (`<ellipse ... fill="#000" opacity=".45" filter="url(#soft6)"/>`).
5. **Depth planes**: background / midground / subject as separate layers that drift at different
   rates, plus atmospheric bloom (`<ellipse ... filter="url(#soft40)" opacity=".15">`).

## Recipes
```svg
<!-- bloom / light source -->
<ellipse cx="770" cy="470" rx="190" ry="230" fill="#FFF0D0" opacity=".22" filter="url(#soft40)"/>
<!-- volumetric shaft through a window (use mix-blend-mode:screen on its layer) -->
<path d="M612 316 L928 316 L780 1402 L180 1402 Z" fill="url(#shaft)" opacity=".42"/>
<!-- rim light on a silhouette's back -->
<path d="M 36 -2 C 52 -80 46 -190 10 -276" fill="none" stroke="#F4B768" stroke-width="4"
      stroke-linecap="round" filter="url(#glowF)"/>
<!-- a lit top edge on a plank / sill / bench slat -->
<rect x="96" y="1050" width="480" height="3" fill="#A07446" opacity=".55"/>
```
- **Silhouettes, not faces.** People and animals are dark shapes with rim light; posture tells the
  story (slumped, upright, reclining, standing at a window). No eyes, no mouths, no cartoon features.
- **Make figures modular**: put the upper body in `<g class="upper">` so it can recline/turn without
  the legs; give each figure a documented origin (hips on a seat, feet on the floor).
- **Oversize backgrounds** (e.g. x −400…1480) so camera pushes never reveal an edge.
- **Seeded randomness** (`EL.rng(seed)`) for anything procedural (city windows, plaster variation,
  scatter), so every render is identical.
- **Scene variants for callbacks**: the same room at day, night, in winter (snow clipped to the
  window), with a green window — changing one thing in a familiar frame is powerful storytelling.

## Line art and diagrams
- 3–4 px strokes, round caps/joins, one weight per drawing.
- Draw them on: set `stroke-dasharray`/`--dash` to `getTotalLength()` and animate `molDraw` or
  `lineDraw`. Never just fade a diagram in.
- Pictograms (people as head + shoulders paths) read as humans at 40 px; pills/bars do not.

## Data visualisation
- Axes in `--muted`, 1.5–2 px; gridlines ≤ 0.15 opacity; **labels directly on the data** (no legends).
- The hero series is 2–3× thicker than anything else and is the only thing with a glow.
- Draw true geometry when the numbers matter (e.g. a normal curve from the real density; a marker at
  the true percentile). Fake shapes are lies even when they're pretty.
- Schematic (non-data) charts must carry a visible SCHEMATIC label.
- Unit visualisations (100 people, 4,264 dots) make rates intuitive; light the subset on the word.

## Don't draw
Products, packaging, logos, brand marks, official emblems (flags, agency logos), real people's
likenesses, and anything gory or sensational. Prefer abstraction (labels, documents, curves,
silhouettes) for sensitive subjects — restraint reads as credibility.

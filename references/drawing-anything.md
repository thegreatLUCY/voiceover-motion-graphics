# Drawing anything — art direction and construction

The scenes in `defs.js` (rooms, silhouettes, benches) are **one art direction**, included as worked
examples. They are not a menu. Every project should start from its own story and choose a visual
language for it; reuse a bundled scene only when it is genuinely the right image.

## 1. Choose an art direction (before any code)

Pick one primary style for the film (you may add a second for a deliberate register switch). Match it
to the subject and tone:

| Style | Feels like | Good for | Style-kit pieces |
|---|---|---|---|
| **Lit flat vector** (bundled scenes) | cinematic, intimate | personal stories, history, mood | `room`, `figure`, rim light, `soft*` |
| **Paper cut-out** | warm, handmade, gentle | nature, childhood, explainers for broad audiences | `paperLayers`, `paperShadow`, `paperTex`, `blob` |
| **Blueprint / technical** | precise, engineered | how things work, inventions, architecture | `blueprintSheet`, `isoBox` outlines, dashed dimension lines |
| **Ink / sketch** | human, reflective, editorial | essays, memory, opinion | `ink` (rough filter), `hatch` pattern, line draw-on |
| **Isometric** | systems, clarity, playful precision | processes, cities, data centres, supply chains | `isoBox`, consistent 30° grid |
| **Neon / glow** | night, energy, tech, nostalgia | music, internet culture, the city at night | `neon`, dark base, `wave` |
| **Lit 3D forms** | scientific, premium, abstract | physics, biology, products-as-concepts | `sphere`, radial gradients, `particles` |
| **Documentary data** | sober, credible | statistics, evidence, journalism | `grid`, `regMarks`, pictograms, direct labels |
| **Halftone / print** | retro, editorial, archival | history, newspapers, propaganda, ads | `halftone` pattern, `KIT.bg.halftoneFade`, `KIT.style.riso` |
| **Clay / soft 3D** | friendly, tactile, premium-app | product explainers, onboarding, health | `KIT.style.clay`, pastel palette, `squashLand` |
| **Glassmorphism** | modern UI, futuristic | tech, finance, interfaces | `KIT.style.glass` over `KIT.bg.aurora` |
| **Bauhaus / geometric** | bold, designed, rhythmic | design history, music, manifestos | `KIT.style.bauhaus`, primary palette, hard cuts |
| **Pixel / 8-bit** | nostalgic, playful, gamer | internet culture, games, retro tech | `KIT.style.pixel`, `steps()` easing |
| **Comic / pop art** | loud, funny, punchy | hooks, reveals, myths busted | `KIT.style.bubble`, `burst`, `actionLines`, `halftoneFade` |
| **Watercolour** | gentle, human, memory | biography, nature, grief | `KIT.style.wash`, `paperTex`, slow fades |
| **Chalkboard** | teacherly, worked-out | maths, science, step-by-step | `KIT.style.chalk`, `EL.drawOn`, `EL.typewriter` |
| **Low-poly / topo** | landscape, data-terrain | geography, climate, exploration | `KIT.bg.lowPoly`, `KIT.bg.topo` |
| **Network / constellation** | connected, systemic | social graphs, brains, the internet | `KIT.style.network`, `KIT.icon`, `drawOn` |
| **Explainer characters** | relatable, story-led | any how-to or "imagine you…" script | `KIT.person` poses + `KIT.icon` + `KIT.chart` |

Every style above is demonstrated in `gallery.py`. They are starting points: recolour them with a
palette (`palettes.css`), combine them (a clay character on a topo map), or use their construction as a
template for something new.

Write the choice down with 3–5 rules (palette, line weight, light direction, texture, how type sits
on it) and keep to them for the whole film. Consistency is what makes a style look intentional.

## 2. Find the image for each shot (visual metaphor)

For every paragraph, ask: *what is the single thing the viewer must understand, and what picture
makes it obvious without words?* Generate at least three candidates, then pick the most concrete:
- **Literal**: show the thing (a cat in a sleep lab).
- **Comparative**: two things side by side with one visible difference (a long bar vs a tiny one).
- **Process**: a sequence or flow (a timeline, a pipe, a funnel, steps that light up).
- **Scale**: unit visualisation (100 people, 4,264 dots) or a familiar object for size.
- **Transformation**: one image changing into another (a label going matte, a window turning green).
- **Callback**: a frame from earlier, with one thing changed.
Prefer images that can *move meaningfully* — the animation should be the argument, not decoration.

## 3. Build complex shapes from simple ones

You can draw almost anything in SVG with these techniques:

1. **Primitives + composition.** Rects, circles, ellipses and paths, layered back to front. Most
   objects are 3–8 shapes: body, shade side, highlight, shadow, detail.
2. **Paths with curves.** `M` move, `L` line, `C` cubic curve (`C x1 y1 x2 y2 x y`), `Q` quadratic,
   `A` arc, `Z` close. Sketch the silhouette as 6–12 points, then smooth corners with `C`/`Q`.
   `ART.blob()` shows a smooth closed shape from points; reuse that idea for leaves, clouds, stones,
   cells, splashes.
3. **Procedural shapes.** Generate geometry with code: `EL.ridge/EL.plane` (terrain, waves of land),
   `ART.wave` (water, sound, signals), loops for repetition (windows, fence posts, rows of seats),
   polar loops for radial things (sun rays, gears, flowers, clocks), seeded randomness for natural
   variation. Always seed (`EL.rng(seed)`) so renders are identical.
4. **Masks and clips.** `clipPath` to cut shapes (a window showing the sky only inside its frame; a
   panel with rounded corners), `mask` with gradients to fade edges. Boolean "cut-outs" are usually a
   clip, not a path calculation.
5. **Shading.** Two or three tones of the same hue (light / mid / dark) applied by face (see
   `isoBox`), or a gradient along the light direction, or a radial gradient for round forms (`sphere`).
6. **Texture.** Patterns (`hatch`, `halftone`, `blueprintGrid`) as fills; filters (`rough` for ink
   wobble, `paperTex` for fibre, `grainF` for film grain). Use texture at low opacity; it should be
   felt, not noticed.
7. **Light and atmosphere.** Bloom (blurred ellipse, `soft40`), shafts (`shaft` gradient with
   `mix-blend-mode:screen`), glows (`glowF`, `neon`), haze from the bottom, vignette. This is what
   makes simple shapes feel like a place.
8. **Perspective.** Vanishing lines for interiors and corridors (see `corridor`), isometric for
   systems, scale and overlap for depth, desaturate and lighten distant planes.

Work method: draw the object at 1:1 in its own function, render a screenshot, look, refine. Expect
2–3 rounds per hero illustration.

## 4. Animate in the style's own language

Motion should match the drawing style:
- **Paper**: layers slide up from below and settle (`plateRise`), slight parallax, nothing glows.
- **Blueprint / ink**: lines draw on (`lineDraw` with `--dash`), dimension lines extend, hatching fades in.
- **Isometric**: blocks drop in with `--e-back`, build up in sequence, small shadows.
- **Neon**: tubes draw on, then a brief flicker (`lightOn`), steady hum (`breath`).
- **3D forms**: slow orbit/drift, highlights shifting with a moving light.
- **Data**: bars grow, counters land on the word (`EL.counter`), pictograms light in staggered rows.
- **Clay / bauhaus**: things drop and squash (`dropIn`, `squashLand`, `bounceIn`), rotate with weight.
- **Pixel**: everything moves in `steps()`; no smooth easing.
- **Comic**: smash zooms, `burst` pops with overshoot, a speech balloon pops on each line.
- **Chalk / watercolour**: strokes draw on slowly; washes bloom outward with opacity.
- **Glass / aurora**: slow drifting colour behind, frosted panels slide in, a `shimmerSweep` sheen.

## 5. When to go beyond SVG

SVG covers nearly everything a narrated short needs. If the user supplies photos, footage or
generated images, place them in a `.layer` with an `<img>` or SVG `<image>`, give them the same
grading (overlay a gradient in the palette, add grain), and animate them with the same camera rules
(slow push, parallax by cutting the image into planes if possible). Never use images of real people
or brands without the user's rights to them.

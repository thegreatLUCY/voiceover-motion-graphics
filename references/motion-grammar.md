# Motion grammar

## Easing (tokens in shared.css) — never linear for movement
| Token | Use |
|---|---|
| `--e-expo` | text, cards, panels, bars, line draws — confident deceleration |
| `--e-back` | objects with mass landing: numbers, stamps, icons, pictograms (≤ 4% overshoot) |
| `--e-soft` | colour, light, opacity, mood changes |
| `--e-circ-io` | camera moves, long draws |
| `linear` | only hard cuts, steady scrolls (EEG traces, snow), and `steps(n)` counters/clocks |

## Durations
| Element | Duration |
|---|---|
| hard cut | 0.01–0.06 s |
| card/panel entrance | 0.40–0.55 s |
| synced word reveal (`wordIn`) | 0.35–0.45 s per word |
| display headline per character (`riseMask`) | 0.6–0.8 s, stagger 0.02–0.03 s |
| bar / line draw | 0.6–1.2 s |
| count-up | 0.8–1.4 s, landing exactly on the spoken number |
| camera push across a shot | the whole shot, scale 1.02–1.06 (or 1.055→1.0) |
| exit | 0.25–0.40 s |

## Choreography rules
1. **Every event is caused by a word.** Use `T.W()`; never guess a time.
2. **Reading time.** After a block finishes appearing, hold it ≥ words ÷ 3 seconds (min 1.2 s)
   before replacing it.
3. **One primary motion at a time.** Ambient motion (grain, drift, a scrolling trace) is fine; two
   foreground events competing is not.
4. **Vary entrances** across a film: masked rise, word sync, line draw, pop/stamp, count-up, wipe,
   highlight sweep, pictogram stagger, page turn. No more than two consecutive shots opening the same way.
5. **Depth:** illustrated shots get ≥ 3 planes with independent slow drift (`M.parallax` or
   `driftA/driftB`) and a slow camera push. Keep type outside the moving rig.
6. **Cuts carry meaning:** soft dissolves (0.35–0.85 s, `qIn`) for memory/story; hard cuts for
   facts/data. A deliberate hard cut inside a soft sequence becomes an accent — use it for a reversal.
7. **No dead air:** no empty frame longer than ~0.6 s unless it's a deliberate beat (a held black
   before a reveal can be powerful — once).
8. **Atmosphere:** film grain (`data-grain` 0.02–0.09; lower = cleaner/warmer moments) and vignette
   on every shot; turn both off for a deliberately "flat" moment.
9. **Payoffs and callbacks:** reuse exact geometry for callbacks (the same card, the same board, the
   same room with one thing changed). Recognition is the reward.

## Patterns that work
- **Page-turning quote card**: long quotes split into pages on sentence boundaries; same card,
  same top; `holdGaps:true` keeps a page up through pauses so the frame is never empty.
- **The number lands on the word**: a count-up or bar that finishes exactly as the number is spoken.
- **Reel counter**: digits in a 1em overflow window, translated by `steps(n)` (see `reelTo13`).
- **Strike-through callback**: draw a highlight bar per wrapped line, measured from the real word
  boxes (see failure-modes: a fixed y misses the text).
- **Time-lapse in one element**: a window that cycles dark/light (`dayNight`) says "days passed".
- **Schematic chart**: lines that diverge to show a concept — always labelled SCHEMATIC.

## Transitions between shots
A cut is the default and usually the best. Use a transition only when it *means* something:
- **Iris / zoom-through** (`irisIn`, `zoomThrough`): going *inside* something — into a cell, a city, a memory.
- **Wipes** (`wipeDiag`, `wipeLeft`, `splitOpen`): one thing replacing another — before/after, myth/fact.
- **Rack focus** (`rackOut` on the old plane, `rackIn` on the new): shifting attention within one world.
- **Glitch** (`glitchShift`): something broken, digital, wrong. Once per film at most.
Keep transitions under 0.6 s and land them on a word boundary or inside a pause.

## Procedural motion (EL.every)
When keyframes can't express it — an orbit, a pendulum, a swarm, a live graph that tracks a counter —
compute the frame from `t` directly: `EL.every(t => el.setAttribute("cx", 540 + 200*Math.cos(t*1.3)))`.
Rules: pure function of `t` (no accumulating state, so scrubbing and rendering are exact), seeded
randomness only, and keep it cheap — it runs for every frame of the render.

## Character animation (KIT.person)
Characters sell a story when they *act on the word*: a wave on "hello", a point on "this", a cheer on
the payoff. Swap poses with a quick cross-fade or `squashLand`; add `floatY` breathing at 2–4 px so a
standing figure never looks frozen. Keep one character design per film.

## Annotation as emphasis
`EL.annotate` turns any word into the beat: circle the key term as it's spoken, underline the claim,
arrow to the number. One annotation per shot — it's punctuation, not decoration.

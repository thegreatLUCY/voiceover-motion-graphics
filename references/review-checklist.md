# Review checklist (run after every build; at least two passes before hand-off)

`node review.mjs review <part>` → open `review/sheet-*.png`. For each shot, fill a row:

| Check | Pass when |
|---|---|
| Plays | frames at 30/60/95% differ where they should; no page errors in the grab log |
| Legible | nothing < 24 px; every text block has contrast; no orphan words; no clipped glyphs |
| Word budget | ≤ 25 words visible at any moment |
| Safe zone | all text/data inside x 110–970, y 180–1600 |
| One focus | a single clear focal point; nothing competing |
| Light & depth | gradients, rim light, contact shadows, ≥ 3 planes in illustrated shots |
| Motion variety | entrance differs from the previous shot; no default fade-everything |
| Colour meaning | every accent used only for its assigned meaning |
| Sync | each reveal lands on its word (scrub with the audio loaded if you have it) |
| Accuracy | on-screen text matches the voiceover and the sources; schematics labelled |
| Transitions | no empty frames > 0.6 s (unless deliberate); no text-over-text during changes |

Fix every failure, rebuild, `node check.mjs`, re-review. Then render a preview MP4 (silent is fine)
and watch it start to finish for rhythm: no shot should feel static, no two neighbours the same.

# Design system

## Canvas and safe zones
- Stage 1080×1920 (9:16). Platforms cover the top ~180 px, the bottom ~320 px and a right-hand action
  rail. **Readable content lives in x 110–970, y 180–1600.** Background art may bleed; text and data
  may not. Press **G** on any page to see the zones.
- A 54 px measurement grid (`ART.grid`) at ≤ 0.5 opacity is a good documentary backdrop.

## Colour: semantics before palette
Decide what each colour *means* before choosing hex values, and write the meaning next to the token
in `shared.css :root`. Then never use a colour for anything else. Typical roles:

| Token | Default | Typical meaning |
|---|---|---|
| `--base` | `#080A0F` | background (never pure black) |
| `--surface` | `#141A26` | cards, panels |
| `--ink` | `#F4F7FB` | primary type (never pure white) |
| `--muted` | `#7E8A9C` | captions, citations, axes |
| `--n` | `#4E9FDB` | narrator / neutral data / structure |
| `--q` | `#E0A458` | quote-card accent: "someone else's words" |
| `--accent` | `#E8605B` | risk / danger |
| one or two project accents | — | the film's central contrast (e.g. *awake* vs *sharp*) |

Rules that make colour storytelling work:
- **≤ 3 accent colours in any frame.**
- A colour's **first appearance can be a reveal** — hold a colour back until the moment it means
  something, and the audience feels the turn without being told.
- **Two registers** work well for narrated stories: a warm *story* register (illustrated scenes,
  someone's own words, soft dissolves between shots) and a cold *documentary* register (grid, data,
  narrator facts, hard cuts). Never mix them in one frame; the switch itself tells the viewer who is
  speaking.
- Glossy vs matte is also a signal: marketing/claims can be glossy (sheen, glow), evidence matte.

## Type
| Use | Face | Size | Notes |
|---|---|---|---|
| Display headline | Inter Tight 600–800 | 72–120 px | tracking −2 to −3%, line-height 1.0–1.08 |
| Narration on screen | Inter Tight 450–600 | 44–64 px | line-height 1.22–1.3 |
| Data, dates, labels, citations | JetBrains Mono 500–600 | 22–34 px | uppercase, tracking +8–30% |
| Quotes | Instrument Serif italic **or** Inter Tight in a card | 46–60 px | always with a citation line |

- **Nothing renders smaller than 24 px** (phones). Citations included.
- **≤ 25 words visible at once.** Sequence long passages as pages.
- Every text block needs guaranteed contrast: a card, a darkening radial behind it, or a calm area.
  Never set text directly on detailed illustration or a bright window.
- Use `<br>` to control line breaks in display lines and avoid orphans (a single word alone on the
  last line). Check every wrapped line in the review frames.

## Cards
- **Quote card** (`.qcard`, built by `EL.qcard`/`EL.pages`): fixed geometry everywhere (left 110,
  width 860, 6 px accent rule on the left, radius 14, glass background with backdrop blur, attribution
  line in mono). Consistent geometry makes it read as one artifact across the film.
- **Narrator card** (`EL.ncard`): no chrome — a mono kicker with a coloured tick and a display line.
- **Document treatment**: a dark panel with a header line (archive/date) and highlight sweeps
  (`.hl` + `hlSweep`) — for when the narrator *examines* a quote rather than presents it.

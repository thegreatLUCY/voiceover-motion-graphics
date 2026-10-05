# Failure modes (each one cost real hours — check for all of them)

| Symptom | Cause | Fix |
|---|---|---|
| A shot renders a correct-looking still but nothing moves | GSAP timelines are paused and only advance via `M.seek`; a top-level `const M` in a classic script isn't on `window`, so the clock never calls it | motion.js exports `window.M` — keep it. Verify motion: two frames at different times must differ |
| A GSAP card never slides in / two pages stack | a CSS animation on the same element overrides GSAP's inline styles | `el.style.removeProperty("animation-name")` before GSAP owns it |
| Whole shot black from page load | a full-frame plate faded *out* with `f1` (or not animated) sits at opacity 1 during its delay | plates start hidden (`opacity:0`) and fade in with `f0`; `check.mjs` flags this |
| Element visible before its entrance | the last entry of `animMulti` wins every property during its delay; a fade-out's 0% is opacity 1 | give exit entries `fill:"forwards"` |
| First of two animations silently ignored | `EL.anim()` twice on one element overwrites `animation-name` | use `EL.animMulti` |
| Element permanently invisible | markup `opacity="0"` + only transform animations | include an opacity keyframe; `check.mjs` flags it |
| Words split mid-word ("I dra / nk") | per-character spans are unbreakable units | `EL.kineticWords` for anything that wraps; `EL.kinetic` only for short display lines |
| `<br>` and coloured spans vanish | text rebuilt from `textContent` | the engine walks real nodes; don't rebuild text yourself |
| Caption appears empty in a card for a moment | card pops before its first word | pop ~0.2 s before the first word (`holdGaps` mode does this) |
| Empty frame in long pauses | page `end` fires at the pause | `EL.pages(..., {holdGaps:true})` keeps a page up until the next arrives |
| Text overlaps text during a page turn | incoming card enters before the outgoing leaves | `EL.pages` serialises pages (`freeAt`); do the same for custom panels |
| A layer's `width/height` ignored, "bleeds" the safe zone | `.layer` sets inset:0 | use `class="layer place"` with explicit box |
| An SVG element jumps to the top-left when animated | a CSS animation on `transform` replaces the element's SVG `transform` attribute | animate a wrapper `<g>` with no transform attribute (KIT.person/KIT.icon already do this) |
| SVG transform scales from the frame's corner | SVG `transform-origin` defaults to the viewBox | `transform-box:fill-box; transform-origin:50% 50%` on the element |
| Strike-through misses the words | a fixed y for a line whose wrap varies | measure word boxes at runtime and draw one bar per line |
| Text glow clipped into a dark box | `text-shadow` inside an `overflow:hidden` reel | use `filter: drop-shadow()` on the parent |
| Grain never shows | `#grain` references a filter that doesn't exist | `support()` defines `grainF`; keep `injectDefs()` at the top of every shot |
| `ReferenceError` on load, whole shot dead | a `const` used before its declaration | `node --check` and watch the grab/render log for page errors |
| Wrong word gets the cue | repeated word ("I", "and", "in") | pass `occ` to `T.W`; read the shot's word list in the KeyError |
| Timeline gaps/overlaps when assembled | hand-rounded offsets | offsets are generated from `DUR`; never edit them by hand |
| Caption unreadable over the art | text placed on a bright/busy area | move it to a calm area or add a darkening radial behind it |
| Verifier says "verified" for a number not in the source | trusting a summary | open the source text; a number must appear in it verbatim |

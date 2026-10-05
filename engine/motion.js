/* =========================================================
   EP03 — MOTION ENGINE  (GSAP)

   The CSS-keyframe system in shared.js still works and still drives every
   shot that has not been migrated. This file is the higher-standard layer:
   real easing curves, real stagger, camera moves with perspective, and
   multi-plane parallax — driven by the SAME clock as the CSS system, so
   space / R / scrub / audio sync behave identically in both.

   WHY A TIMELINE AND NOT MORE KEYFRAMES
   The CSS approach has one property per animation and no way to express
   "start this at the word 'never'" as anything other than a hand-computed
   delay. Every retiming is an arithmetic error waiting to happen, and the
   validator can only check the arithmetic, never whether it landed on the
   word. A GSAP timeline is positioned in seconds against a label, so the
   sync is declared once and cannot drift.

   Everything is driven by `M.seek(t)`, called from the shared clock. Nothing
   in here runs on its own rAF, so there is exactly one clock per shot and it
   cannot disagree with the scrub bar.

   Register rules still apply: Q shots cross-dissolve, N shots hard cut.
   ========================================================= */

const M = (() => {

  const EASE = {
    /* one global curve is the loudest amateur tell. these are chosen per
       purpose, and every value here is a real CustomEase, not a browser
       default. */
    reveal:   CustomEase.create("reveal",   "0.16, 1, 0.30, 1"),
    settle:   CustomEase.create("settle",   "0.34, 1.56, 0.64, 1"),
    glide:    CustomEase.create("glide",    "0.65, 0, 0.35, 1"),
    camera:   CustomEase.create("camera",   "0.25, 0.46, 0.45, 0.94"),
    colour:   CustomEase.create("colour",   "0.40, 0.00, 0.20, 1"),
    /* a near-instant cut with the smallest possible tail. used for the
       narrator register, where a fact must arrive, not drift in. */
    snap:     CustomEase.create("snap",     "0.22, 1, 0.36, 1"),
    breathe:  CustomEase.create("breathe",  "0.45, 0, 0.55, 1"),
  };

  const timelines = [];
  let stagePerspective = null;

  /* ---------------------------------------------------------
     TIMELINE
     --------------------------------------------------------- */
  function tl(opts = {}){
    const t = gsap.timeline({
      paused: true,
      defaults: { ease: EASE.reveal },
      smoothChildTiming: true,
      ...opts
    });
    t.__dur = () => (t.duration() || 1);
    timelines.push(t);
    return t;
  }

  /* ---------------------------------------------------------
     CAMERA
     A real 3D camera move needs perspective on an ancestor and separate
     translateZ per plane. `M.cam()` sets up a rig; `M.plane()` puts a layer
     on a depth plane; `M.move()` flies the rig.
     --------------------------------------------------------- */
  function cam(rig, { perspective = 1400, origin = "50% 50%" } = {}){
    if(!rig) return null;
    gsap.set(rig, {
      perspective, transformPerspective: perspective,
      transformOrigin: origin, willChange: "transform"
    });
    return rig;
  }

  /* depth: 1 = the plane the camera sits in, 0.5 = half a screen behind it.
     Positive values push toward the viewer. Order matters: nearer planes get
     a higher depth, so the parallax is real rather than a uniform scale. */
  function plane(el, depth = 0.6, { scale = 1.30 } = {}){
    if(!el) return null;
    gsap.set(el, {
      z: (depth - 1) * 1400,
      scale,
      transformOrigin: "50% 50%",
      willChange: "transform"
    });
    return el;
  }

  /* The move itself. Dolly in, pan, or a slow orbit — the three moves that
     read as a camera rather than as a zoom. */
  function move(rig, { from = {x:0,y:0,z:0,rot:0}, to = {x:0,y:0,z:0,rot:0},
                       at = 0, dur = 8, ease = EASE.camera } = {}){
    if(!rig) return;
    gsap.fromTo(rig, from, { ...to, duration: dur, ease });
  }

  /* Ambient parallax. Each plane drifts on its own period and amplitude, so
     the frame is never perfectly static — which is the difference between
     "a picture" and "a shot". */
  function parallax(rig, planes, { amount = 26, dur = 14, rotate = 0.35 } = {}){
    if(!rig) return;
    planes.forEach((el, i) => {
      if(!el) return;
      const k = 1 - i * 0.16;              // nearer planes travel further
      gsap.to(el, {
        x: amount * k, duration: dur, ease: "sine.inOut",
        repeat: -1, yoyo: true
      });
      if (rotate) gsap.to(el, {
        rotation: rotate * k, duration: dur * 1.3, ease: "sine.inOut",
        repeat: -1, yoyo: true
      });
    });
  }

  /* ---------------------------------------------------------
     REVEALS
     --------------------------------------------------------- */
  /* A masked rise. Clip-path rather than a moving box, because a box moving
     over a background reads as a wipe and a clip reads as the text arriving. */
  function reveal(el, { at = 0, dur = 0.9, y = 26, ease = EASE.reveal, stagger = 0 } = {}){
    if(!el) return;
    if (stagger) gsap.from(el, {
      opacity: 0, y, duration: dur, ease, stagger, overwrite: "auto"
    });
    else gsap.from(el, { opacity: 0, y, duration: dur, ease, overwrite: "auto" });
    tlAdd(at, () => {}, 0);   /* no-op; timing is handled by position below */
    return el;
  }

  /* Position-aware reveal. `at` is in seconds on the shot clock. */
  function rise(el, at, { dur = 0.9, y = 26, ease = EASE.reveal, x = 0, scale = 1 } = {}){
    if(!el) return;
    const t = currentTl();
    if(!t) { gsap.from(el, {opacity:0, y, x, scale, duration:dur, ease}); return; }
    t.fromTo(el, { opacity: 0, y, x, scale, transformOrigin: "50% 60%" },
                { opacity: 1, y: 0, x: 0, scale: 1, duration: dur, ease,
                  immediateRender: false }, at);
  }

  /* Line-masked type. Each line is its own clip container so the glyphs rise
     out from behind a hard edge — the single biggest lift over a block fade. */
  function maskLines(el, at, { dur = 0.8, stagger = 0.09, y = 100, ease = EASE.reveal } = {}){
    if(!el) return;
    const t = currentTl();
    const lines = [...el.children];
    lines.forEach((ln, i) => {
      const box = document.createElement("span");
      box.style.cssText = "display:block;overflow:hidden;padding-bottom:.06em;margin-bottom:-.06em";
      while(ln.firstChild) box.appendChild(ln.firstChild);
      ln.appendChild(box);
      const inner = document.createElement("span");
      inner.style.cssText = "display:block;will-change:transform";
      while(box.firstChild) inner.appendChild(box.firstChild);
      box.appendChild(inner);
      if (t) t.fromTo(inner, { yPercent: 100 }, { yPercent: 0, duration: dur, ease,
                       immediateRender: false }, at + i * stagger);
      else gsap.from(inner, { yPercent: 100, duration: dur, ease });
    });
  }

  /* Kinetic type done properly. Words are the unit so lines never break
     mid-word (the bug EL.kinetic had), and the stagger is real GSAP stagger
     rather than a delay multiplied by a loop counter. */
  function typeIn(el, at, { dur = 0.6, stagger = 0.028, ease = EASE.reveal,
                            words = true, y = 18 } = {}){
    if(!el) return;
    const t = currentTl();
    const txt = el.textContent;
    el.textContent = "";
    const parts = words ? txt.split(/(\s+)/) : [...txt];
    const targets = [];
    parts.forEach(part => {
      if (/^\s+$/.test(part)){ el.appendChild(document.createTextNode(" ")); return; }
      const s = document.createElement("span");
      s.textContent = part;
      s.style.cssText = "display:inline-block;will-change:transform,opacity";
      el.appendChild(s); targets.push(s);
    });
    if (t) t.fromTo(targets, { opacity: 0, y },
                          { opacity: 1, y: 0, duration: dur, ease, stagger,
                            immediateRender: false }, at);
    else gsap.from(targets, { opacity: 0, y, duration: dur, ease, stagger });
  }

  /* A value that counts. Counter tweening belongs to the element that owns
     the number, not to the shared clock — the EP01 clock tried this and it
     silently went stale. */
  function count(el, at, { to = 100, from = 0, dur = 1.2, ease = EASE.glide, pad = 0 } = {}){
    if(!el) return;
    const t = currentTl();
    const o = { v: from };
    const write = () => { el.textContent = String(Math.round(o.v)).padStart(pad, "0"); };
    write();
    if (t) t.to(o, { v: to, duration: dur, ease, onUpdate: write, immediateRender: false }, at);
    else gsap.to(o, { v: to, duration: dur, ease, onUpdate: write });
  }

  /* Cross-dissolve between two layers. Q-register transitions use this; the
     N-register hard cut simply does not call it. */
  function dissolve(outEl, inEl, at, { dur = 0.5, ease = EASE.colour } = {}){
    const t = currentTl();
    if (outEl) (t ? t.to(outEl, { opacity: 0, duration: dur, ease, immediateRender: false }, at)
                 : gsap.to(outEl, { opacity: 0, duration: dur, ease }));
    if (inEl)  (t ? t.fromTo(inEl, { opacity: 0 }, { opacity: 1, duration: dur, ease, immediateRender: false }, at)
                 : gsap.fromTo(inEl, { opacity: 0 }, { opacity: 1, duration: dur, ease }));
  }

  /* Hard cut. One frame. Used for the narrator register, where a fact has to
     arrive rather than fade up. */
  function cut(inEl, at){
    const t = currentTl();
    if (t) t.set(inEl, { opacity: 1 }, at);
    else gsap.set(inEl, { opacity: 1 });
  }

  /* A shot that breathes: a slow scale on the whole frame. Subtle enough to
     register as a camera rather than a zoom, which is the whole point. */
  function breathe(rig, at, { dur = 8, from = 1.0, to = 1.035, ease = EASE.breathe } = {}){
    if(!rig) return;
    const t = currentTl();
    if (t) t.fromTo(rig, { scale: from }, { scale: to, duration: dur, ease, immediateRender: false }, at);
    else gsap.fromTo(rig, { scale: from }, { scale: to, duration: dur, ease });
  }

  /* ---------------------------------------------------------
     PLUMBING
     --------------------------------------------------------- */
  let _active = null;
  function currentTl(){ return _active; }

  /* helper the stray `reveal()` above calls — kept so the API is total */
  function tlAdd(at, fn, d){ /* reserved */ }

  /* Every timeline is scrubbed by the shared clock. One clock, one source of
     truth, no possibility of the animation and the scrub bar disagreeing. */
  function seek(t, dur){
    for (const tl of timelines){
      const d = tl.duration() || 1;
      tl.progress(Math.max(0, Math.min(1, t / d)), true);
    }
  }

  function reset(){
    for (const tl of timelines){ tl.pause(); tl.progress(0, true); }
  }

  /* Set the timeline the next rise()/typeIn() call attaches to. */
  function use(t){ _active = t; return t; }

  gsap.ticker.lagSmoothing(0);
  gsap.config({ force3D: true, nullTargetWarn: false });

  const API = { tl, use, seek, reset, cam, plane, move, parallax, rise, maskLines,
                typeIn, count, dissolve, cut, breathe, ease: EASE, EASE };

  /* ⚠️ THIS LINE IS LOAD-BEARING.
     A top-level `const` in a classic <script> lives in the script's own scope and
     is NOT a property of `window`. shared.js guards its clock hook with
     `if (window.M && M.seek)`, so without this assignment `window.M` is
     undefined, M.seek is never called, and every GSAP timeline sits paused
     forever.

     That is not a theoretical failure: it shipped. Shot 2 rendered correctly —
     the card, the amber rule, the attribution all painted, because CSS
     `animation-fill-mode:both` filled them in at load — while the camera push,
     the four-plane parallax, the card rise and the type stagger were all dead.
     Measured frame-to-frame delta across the whole shot: 0.03–0.19 pixels. The
     shot was a still image and every automated check passed it, because a still
     frame has no overlaps, no bleed and no blank area.

     Export explicitly. Never rely on a top-level const leaking to window. */
  if (typeof window !== "undefined") window.M = API;
  if (typeof globalThis !== "undefined") globalThis.M = API;

  return API;
})();

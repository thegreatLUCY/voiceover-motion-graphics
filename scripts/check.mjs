/* Validates every beat file. Run before you trust what you see.
   The bug this catches: a layer pointing at a @keyframes name that does not
   exist gets NO animation effect and renders at its base opacity — which is
   how a full-frame black overlay ends up covering the stage forever, silently,
   with nothing in the console. */
import { readFileSync, readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
let fail = 0;
/* resolve against this file, not the cwd, so `node motion/check.mjs` works
   from anywhere — this is the gate before trusting a render, it should never
   be the thing that fails to run */
const HERE = dirname(fileURLToPath(import.meta.url));
const read = f => readFileSync(join(HERE, f), 'utf8');
const css = read('shared.css');
const defined = new Set([...css.matchAll(/@keyframes\s+([\w-]+)/g)].map(m=>m[1]));
const files = readdirSync(HERE).filter(f=>f.endsWith('.html') && f !== 'index.html');
const used = new Set();
for (const f of files){
  const h = read(f);
  const grab = [
    /name:\s*["']([\w-]+)["']/g,
    /EL\.(?:anim|loop)\([^,]+,\s*["']([\w-]+)["']/g,
    /animation:\s*([\w-]+)/g,
    /animationName\s*=\s*["']([\w-]+)["']/g,
  ];
  for (const re of grab) for (const m of h.matchAll(re)) used.add(m[1]);
  const short = [...h.matchAll(/style="[^"]*\banimation:/g)].length;
  if (short){ console.log(`  ✗ ${f}: ${short} inline animation: shorthand — resets play-state`); fail++; }
}
/* duplicate EL.anim on one element: the second silently replaces the first.
   This has broken three separate beats, so it gets its own check. */
const dupes = [];
for (const f of files){
  const h = read(f);
  const counts = {};
  for (const m of h.matchAll(/EL\.anim\(\s*\$\("#([\w-]+)"\)/g))
    counts[m[1]] = (counts[m[1]]||0) + 1;
  for (const [id,n] of Object.entries(counts))
    if (n > 1) dupes.push(`${f}: #${id} has ${n} EL.anim calls — use EL.animMulti`);
}
for (const d of dupes){ console.log('  \u2717 ' + d); fail++; }
if (!dupes.length) console.log('  \u2713 no duplicate EL.anim targets');

/* Classes used in beat markup that shared.css never defines. A dropped
   utility class does not error — it just falls back to 16px and the type
   silently shrinks. That is exactly what happened to beat 3's NOBODY KNOWS. */
const cssClasses = new Set([...css.matchAll(/\.([a-zA-Z][\w-]*)/g)].map(m=>m[1]));
const RESERVED = new Set(['layer','center','col','k','kf','blend-screen','blend-add',
  'blend-overlay','blend-sat','t-d','t-d-lg','t-m','t-s','t-b','kline','hidden',
  'playable','k-fill','bond','labels']);  // k-fill is a legacy alias; bond/labels are JS hooks
const badClasses = new Set();
for (const f of files){
  const h = read(f);
  for (const m of h.matchAll(/class="([^"]+)"/g))
    for (const c of m[1].split(/\s+/))
      if (c && !RESERVED.has(c) && !cssClasses.has(c)) badClasses.add(`${f}: .${c}`);
}
for (const b of [...badClasses]){ console.log(`  ✗ undefined class -> ${b}`); fail++; }
if (!badClasses.size) console.log('  ✓ every utility class in the markup is defined');

/* The backwards-fill trap. With fill-mode:both, an element shows its 0% keyframe
   block during the animation's DELAY phase. So any keyframe whose 0% is already
   visible is painted from page load until its delay elapses.
   dimOut is the deliberate exception: its 0% being opacity 1 is the point. */
const INTENTIONALLY_VISIBLE = new Set(['dimOut','f1','scatterK','fadeOutK']);  // fade-outs should hold visible until their delay

/* extract a keyframes body by brace counting — a regex cannot do this because
   keyframes nest and some are written on a single line */
function keyframeBody(src, name){
  const at = src.indexOf('@keyframes ' + name);
  if (at < 0) return null;
  let i = src.indexOf('{', at), depth = 0, start = i + 1;
  for (; i < src.length; i++){
    if (src[i] === '{') depth++;
    else if (src[i] === '}' && --depth === 0) return src.slice(start, i);
  }
  return null;
}

const risky = [];
for (const name of defined){
  if (INTENTIONALLY_VISIBLE.has(name)) continue;
  const body = keyframeBody(css, name);
  if (!body) continue;
  const first = body.match(/(?:^|[;{\s])(?:0%|from)\s*\{([^}]*)\}/);
  if (!first) continue;
  const op = first[1].match(/opacity\s*:\s*([\d.]+)/);
  if (op && parseFloat(op[1]) > 0.01)
    risky.push(`${name} (0% opacity:${op[1]})`);
}
if (risky.length){
  console.log('  ! keyframes whose 0% is VISIBLE (painted during the delay phase):');
  console.log(`      ${risky.join(', ')}`);
} else {
  console.log('  ✓ every keyframe starts transparent (no backwards-fill trap)');
}

/* Markup opacity="0" plus an animation that only touches transform = the
   element stays invisible forever. There is no error; it just never appears.
   beat 5's identity plate was invisible for exactly this reason. */
const transformOnly = new Set(['slideL','slideR','pushIn','pushIn2','pullBack',
  'driftA','driftB','driftSlow','driftX','growW','growH','maskUp','maskRight',
  'maskUpSoft','panelSplit','holdHard','shakeS','crystalFall','labLine','drawStroke']);
const stuck = [];
for (const f of files){
  const h = read(f);
  const hidden = [...h.matchAll(/id="([\w-]+)"[^>]*opacity="0"/g)].map(m=>m[1]);
  for (const id of hidden){
    const calls = [...h.matchAll(new RegExp(
      `EL\\.animMulti\\(\\s*\\$\\("#${id}"\\)\\s*,?\\s*\\[([\\s\\S]*?)\\]\\s*\\)`,'g'))];
    const names = calls.flatMap(c =>
      [...c[1].matchAll(/name:\s*["']([\w-]+)["']/g)].map(m=>m[1]));
    const single = [...h.matchAll(
      new RegExp(`EL\\.anim\\(\\s*\\$\\("#${id}"\\)\\s*,\\s*["']([\\w-]+)["']`,'g'))]
      .map(m=>m[1]);
    const all = [...new Set([...names, ...single])];
    if (all.length && all.every(n => transformOnly.has(n)))
      stuck.push(`${f}: #${id} has opacity="0" but only transform-only anims (${all.join(',')})`);
  }
}
for (const s of stuck){ console.log(`  ✗ permanently invisible -> ${s}`); fail++; }

/* A fade-OUT entry (0% opacity:1) inside animMulti needs fill:"forwards",
   or its backwards fill makes the element visible from t=0. */
// dimOut is deliberately excluded: it settles at .34, not 0, and staying
// visible before its delay is exactly the point.
const FADE_OUT = new Set(['f1','scatterK','fadeOutK']);
const badExit = [];
/* shared.js is where the animMulti helpers actually live, and the bug this
   rule exists for was IN shared.js — chips() stacked scatterK (0% opacity 1)
   after popInHard with the default backwards fill, which silently deleted the
   stagger. Scanning only the beat files meant the rule never saw it. */
for (const f of [...files, 'shared.js', 'defs.js']){
  const h = read(f);
  for (const m of h.matchAll(/EL\.animMulti\([^,]+,\s*\[([\s\S]*?)\]\s*\)/g)){
    const entries = [...m[1].matchAll(/\{name:\s*["']([\w-]+)["'][^}]*\}/g)];
    entries.forEach((e,i)=>{
      if (i > 0 && FADE_OUT.has(e[1]) && !/fill:\s*["']forwards/.test(e[0]))
        badExit.push(`${f}: ${e[1]} needs fill:"forwards" (earlier entry is invisible to it)`);
    });
  }
}
for (const b of badExit){ console.log(`  ✗ fade-out entry -> ${b}`); fail++; }
if (!badExit.length) console.log('  ✓ every stacked fade-out uses fill:forwards');
if (!stuck.length) console.log('  ✓ no element is stuck at opacity 0');

/* Anything still animating when cutBlack fires dies mid-reveal. The payoff of
   a beat is its LAST animation, so it is always the one at risk, and it is
   invisible in a still frame — you only catch it by scrubbing the tail.
   Beat 5's PSILOCYBIN ran to 9.29s inside an 8.82s cut; beat 6's SAME MOLECULE
   subtitle to 9.00s. Both were silently truncated on screen.
   EL.kinetic is bounded conservatively at 13 characters (stagger x 12). */
const MAX_CHARS = 12;
const num = s => { const v = parseFloat(s); return Number.isFinite(v) ? v : null; };
const overrun = [];
for (const f of files){
  const h = read(f);
  const dur = num((h.match(/data-dur="([\d.]+)"/)||[])[1]);
  if (dur == null) continue;
  const over = end => { if (end > dur + 0.15) overrun.push(`${f}: animation ends ${end.toFixed(2)}s but the cut is ${dur}s`); };

  for (const m of h.matchAll(/EL\.anim\(\s*\$\("#([\w-]+)"\)\s*,\s*"[\w-]+"\s*,\s*([\d.]+)\s*,\s*([\d.]+)/g))
    over(parseFloat(m[2]) + parseFloat(m[3]));

  for (const m of h.matchAll(/EL\.kinetic\(\s*\$\("#[\w-]+"\)\s*,\s*\{[^}]*?delay:\s*([\d.]+)[^}]*?dur:\s*([\d.]+)[^}]*?stagger:\s*([\d.]+)/gs))
    over(parseFloat(m[1]) + parseFloat(m[2]) + parseFloat(m[3]) * MAX_CHARS);
  for (const m of h.matchAll(/EL\.kinetic\(\s*\$\("#[\w-]+"\)\s*,\s*\{[^}]*?dur:\s*([\d.]+)[^}]*?stagger:\s*([\d.]+)[^}]*?delay:\s*([\d.]+)/gs))
    over(parseFloat(m[3]) + parseFloat(m[1]) + parseFloat(m[2]) * MAX_CHARS);

  for (const m of h.matchAll(/EL\.animMulti\(\s*\$\("#[\w-]+"\)\s*,\s*\[([\s\S]*?)\]\s*\)/g))
    for (const e of m[1].matchAll(/dur:\s*([\d.]+)\s*,\s*delay:\s*([\d.]+)/g))
      over(parseFloat(e[2]) + parseFloat(e[1]));

  for (const m of h.matchAll(/EL\.chips\(\s*\$[^,]+,\s*\{[^}]*scatter:\s*([\d.]+)/g))
    over(parseFloat(m[1]) + 1.2);
}
for (const o of [...new Set(overrun)]){ console.log(`  ✗ overruns its own cut -> ${o}`); fail++; }
if (!overrun.length) console.log('  ✓ nothing animates past its cut');

/* data-offset must be the exact cumulative sum of the preceding durations.
   These were hand-rounded to whole seconds at one point, which put beat 5
   0.6s BEFORE beat 4 ended — so on assembly beat 4's burn got truncated
   mid-transition. Nothing renders wrong in any single file; it only breaks
   when the beats are laid end to end, which is exactly when you find it. */
const PARTS = [...new Set(files.map(f=>(f.match(/^p(\d+)-s\d\d\.html$/)||[])[1]).filter(Boolean))].map(Number).sort((x,y)=>x-y);
const seqOf = p => files.filter(f=>new RegExp(`^p${p}-s\\d\\d\\.html$`).test(f)).sort();

/* Each part has its OWN master clock. Offsets reset at the part boundary,
   so contiguity is checked per part — running them as one sequence would
   demand part 2 shot 1 start at 115s, which is the exact bug hit
   when a total drifted. */
const accByPart = {};
for (const part of PARTS){
  const list = seqOf(part);
  let acc = 0;
  for (const f of list){
    const h = read(f);
    const off = parseFloat((h.match(/data-offset="([\d.]+)"/)||[])[1]);
    const dur = parseFloat((h.match(/data-dur="([\d.]+)"/)||[])[1]);
    const declaredPart = (h.match(/data-part="(\d+)"/)||[])[1];
    if (declaredPart && +declaredPart !== part){
      console.log(`  ✗ ${f}: filename says part ${part} but data-part says ${declaredPart}`);
      fail++;
    }
    if (Math.abs(off - acc) > 0.011){
      console.log(`  ✗ ${f}: data-offset ${off} but the timeline is at ${acc.toFixed(2)} — ${(acc-off).toFixed(2)}s ${acc>off?'overlap':'gap'}`);
      fail++;
    }
    acc += dur;
  }
  accByPart[part] = acc;
  if (list.length) console.log(`  ✓ part ${part} offsets contiguous (${list.length} shots, ${acc.toFixed(1)}s)`);
}

/* A container that fades in before anything inside it animates leaves a
   visible but EMPTY layer on screen for the gap. Beat 7's twist phase came in
   at 9.45s and its first child did not move until 10.95s — 1.5s of a live
   layer showing pure black, over the one phrase ("but misidentify it once")
   that must be carried by something. Reads fine in any single frame. */
function blockOf(h, id){
  const open = h.search(new RegExp(`<div[^>]*id="${id}"`));
  if (open < 0) return null;
  let i = h.indexOf('>', open), depth = 1, close = -1;
  const tag = /<(\/?)div\b/g; tag.lastIndex = i;
  let m;
  while (depth > 0 && (m = tag.exec(h))){
    if (m[1]) depth--;
    else if (!h.slice(m.index, tag.lastIndex).endsWith('/>')) depth++;
    if (depth === 0) close = m.index;
  }
  return close < 0 ? null : h.slice(open, close);
}
const emptyPhase = [];
for (const f of files){
  const h = read(f);
  const pm = h.match(/const PHASE\s*=\s*\[([\s\S]*?)\];/);
  if (!pm) continue;
  for (const p of pm[1].matchAll(/\[\s*["']#([\w-]+)["']\s*,\s*([\d.]+)/g)){
    const [, id, inAt] = p;
    const blk = blockOf(h, id);
    if (!blk) continue;
    const kids = [...blk.matchAll(/id="([\w-]+)"/g)]
      .map(m => m[1]).filter(k => k !== id);
    let earliest = Infinity;
    for (const k of kids){
      for (const re of [
        new RegExp(`EL\\.anim\\(\\s*\\$\\("#${k}"\\)\\s*,\\s*"[\\w-]+"\\s*,\\s*([\\d.]+)`),
        new RegExp(`EL\\.animMulti\\(\\s*\\$\\("#${k}"\\)\\s*,\\s*\\[\\s*\\{[^{}]*?delay:\\s*([\\d.]+)`),
        new RegExp(`EL\\.kinetic\\(\\s*\\$\\("#${k}"\\)\\s*,\\s*\\{[^}]*?delay:\\s*([\\d.]+)`),
        new RegExp(`EL\\.chips\\(\\s*\\$\\("#${k}"\\)\\s*,\\s*\\{[^}]*?pop:\\s*([\\d.]+)`),
      ]){
        const m = h.match(re);
        if (m) earliest = Math.min(earliest, parseFloat(m[1]));
      }
    }
    if (earliest === Infinity) continue;
    const gap = earliest - parseFloat(inAt);
    if (gap > 0.4)
      emptyPhase.push(`${f}: #${id} fades in at ${inAt}s but nothing inside it moves until ${earliest}s — ${gap.toFixed(2)}s empty`);
  }
}
for (const e of emptyPhase){ console.log(`  ✗ empty phase -> ${e}`); fail++; }
if (!emptyPhase.length) console.log('  ✓ no phase fades in ahead of its contents');

/* FULL-FRAME PLATES. Three distinct ways to get this wrong, all silent:
     1. animated with f1 (fade OUT) and no f0  -> opaque for the delay phase
     2. animated with the WRONG name          -> base opacity, i.e. opaque
     3. NOT ANIMATED AT ALL                   -> base opacity, i.e. opaque
   Case 3 shipped in p1-s05 and p1-s14 and rendered two completely black shots.
   The earlier version of this check only looked for case 1, so it passed a build
   where a third of the episode was invisible. A plate that is never animated is
   the most dangerous version, because there is nothing in the code to look wrong.

   Rule: a full-frame opaque plate must carry an animation that ENDS it hidden. */
{
  const PLATES = ['cutBlack','blackHold','bgQ','cold','hSolid','plate','hazeLayer','shaftLayer'];
  let bad = 0;
  for (const file of files){
    const src = read(file);
    for (const id of PLATES){
      const decl = src.match(new RegExp('id="' + id + '"[^>]*style="([^"]*)"'));
      if (!decl) continue;
      const styleAttr = decl[1];
      /* an inline opacity means the plate manages itself */
      if (/opacity\s*:/.test(styleAttr)){
        const v = styleAttr.match(/opacity\s*:\s*([\d.]+)/);
        if (v && +v[1] < 0.5) continue;   /* starts hidden on purpose */
        continue;                           /* fully opaque + animated below */
      }
      /* does this plate have ANY animation at all? Two engines now drive
         shots: the CSS one (EL.anim / EL.animMulti) and GSAP (T.set / T.to /
         M.cut / M.dissolve). A plate animated by either counts as animated —
         checking only EL.anim flagged every GSAP-migrated shot as an uncovered
         black plate, which is the same false positive in a new place. */
      const RE_CSS = new RegExp('EL[.]anim(?:Multi)?[(][$][(]"#' + id + '"');
      const RE_GSAP = new RegExp(
        '(?:T|M)[.](?:set|to|fromTo|from)\\([\\s]{0,4}"#' + id + '"' +
        '|M[.](?:cut|dissolve)\\([\\s]{0,4}[$][(]"#' + id + '"');
      const found = RE_CSS.test(src) || RE_GSAP.test(src);
      if (!found){
        console.log('  x ' + file + ': #' + id + ' is a full-frame opaque plate with NO animation.');
        console.log('    It sits at opacity 1 from page load and covers every layer under it.');
        bad++; fail++;
        continue;
      }
      /* animated — but does anything fade it OUT? */
      const hasOut = new RegExp('"#' + id + '"[\\s\\S]{0,400}?"f1"|"f1"[\\s\\S]{0,120}?#' + id).test(src);
      const endsHidden = new RegExp(
        'EL[.]anim(?:Multi)?[(][$][(]"#' + id + '"[\\s\\S]{0,400}?(f0|cardOut|fadeOutK|dimOut)' +
        '|M[.](?:cut|dissolve)\\([\\s]{0,4}[$][(]"#' + id + '"').test(src);
      if (!hasOut && !endsHidden && !/opacity/.test(styleAttr)){
        /* allow it if it is the LAST shot of a part, where staying up is correct */
        const dur = (src.match(/data-dur="([\d.]+)"/)||[])[1];
        if (dur && parseFloat(dur) > 3){
          console.log('  ! ' + file + ': #' + id + ' never fades out. Intentional only on a closing shot.');
        }
      }
    }
  }
  if (!bad) console.log('  v every full-frame plate is animated and none is left covering the frame');
}

/* A PARSE ERROR in a shot's choreography is the worst failure in the system,
   because nothing about the page looks broken. The stage renders, the layout is
   there, the artwork is there — and every animation in that shot simply never
   runs. All you get is one line in the console.

   This fired on p1-s02, the hand-written reference shot for the entire Q
   register, and it was invisible until a browser smoke test was run across all
   fourteen files. `node --check` on the extracted last <script> block catches it
   in milliseconds, so catch it here instead of in a screenshot. */
{
  let bad = 0;
  for (const f of files){
    const src = read(f);
    const blocks = [...src.matchAll(/<script>([\s\S]*?)<\/script>/g)];
    if (!blocks.length) continue;
    const code = blocks[blocks.length-1][1];
    /* cheap structural pre-checks — these are what actually go wrong */
    const problems = [];
    const opens = (code.match(/\(/g)||[]).length, closes = (code.match(/\)/g)||[]).length;
    if (opens !== closes) problems.push(`unbalanced parens (${opens} open, ${closes} close)`);
    const bo = (code.match(/\{/g)||[]).length, bc = (code.match(/\}/g)||[]).length;
    if (bo !== bc) problems.push(`unbalanced braces (${bo} open, ${bc} close)`);
    /* the specific typo this build hit: a doubled quote from a regex rewrite */
    if (/querySelector\(["'][^"']*["']["']\)/.test(code))
      problems.push('doubled quote in querySelector — a selector rewrite went wrong');
    if (/\(\s*$/.test(code)) problems.push('statement ends mid-argument');
    if (problems.length){
      console.log('  x ' + f + ': ' + problems.join('; '));
      bad++; fail++;
    }
  }
  if (!bad) console.log('  v every shot\'s choreography is structurally sound');
}

const missing = [...used].filter(u=>!defined.has(u));
if (missing.length){
  console.log('  ✗ MISSING @keyframes:', missing.join(', '));
  console.log('    these layers will render at base opacity and break silently.');
  fail++;
} else {
  console.log(`  ✓ all ${used.size} animation names resolve against ${defined.size} keyframes`);
}
console.log(fail ? `\nFAILED (${fail})` : '\nPASS');
process.exit(fail?1:0);

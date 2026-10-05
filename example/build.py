#!/usr/bin/env python3
"""EXAMPLE BUILD — five shots that demonstrate every technique in the skill.
Copy this file's patterns; replace the SHOTS with your own.

    python3 estimate_timings.py script.txt timings.json   # before the voiceover exists
    python3 vosync.py VO/part1.mp3 script.txt timings.json  # once it does
    python3 build.py && node check.mjs

Every cue comes from T.W / T.WE / T.WS (a spoken word), so swapping the
estimated timings for the real ones re-times the whole video.
"""
import json
from timing import Timeline
from beat_template import build

PROJECT = "DEMO"
PART = 1
T = Timeline("timings.json", hold=2.0)
W, WE, WS, DUR = T.W, T.WE, T.WS, T.DUR

def Q(t): return '"' + t.replace('"', '\\"') + '"'
def cut(n): return f'EL.anim($("#cutBlack"), "f0", {DUR[n]-0.06:.2f}, .06, "linear");'
def svg(id, inner="", style="opacity:0"):
    return (f'\n  <div class="layer" id="{id}" style="{style}">'
            f'<svg viewBox="0 0 1080 1920" width="1080" height="1920" style="position:absolute">{inner}</svg></div>')

# the documentary / narrator plate: cold field + grid + registration marks, hard cut in
COLD = svg("cold", '<rect width="1080" height="1920" fill="url(#coldField)"/><g id="gridArt"></g><g id="regArt"></g>')
COLD_JS = '''injectDefs(["coldField"]);
$("#gridArt").innerHTML = ART.grid(54, "#17202E");
$("#regArt").innerHTML  = ART.regMarks();
EL.anim($("#cold"), "f0", 0.00, .01, "linear");
'''
SHOTS = []

# ── 1 · narrator card (CSS engine) ─────────────────────────────────
n = 1
SHOTS.append(dict(n=n, title="NARRATOR CARD", grain=.04,
  body=COLD + '\n  <div class="layer" id="nMount"></div>',
  notes="Cold plate, kicker, headline words synced to the voice, hard cut.",
  script=COLD_JS + f'''EL.ncard($("#nMount"), {{kicker:"SHOT 1 · NARRATOR", at:{W(n,"Every")}, top:820, size:84,
  times:{WS(n,"Every","hard")},
  text:"Every shot starts with a voice. This one is <span style=\\"color:var(--n)\\">cut hard.</span>"}});
{cut(n)}'''))

# ── 2 · story scene with a real camera rig (GSAP engine) ───────────
n = 2; D = DUR[n]
plane = lambda id, fn: (f'\n    <div class="layer place" id="{id}" style="left:0;top:0;width:1080px;height:1920px;">'
                        f'<svg viewBox="0 0 1080 1920" width="1080" height="1920" style="position:absolute;overflow:visible">'
                        f'<g id="{fn}"></g></svg></div>')
SHOTS.append(dict(n=n, title="STORY SCENE", grain=.08, gsap=True,
  body=('\n  <div class="layer place" id="rig" style="left:0;top:0;width:1080px;height:1920px;">'
        + plane("pFar", "aFar") + plane("pWin", "aWin") + plane("pMid", "aMid") + plane("pFig", "aFig") + '\n  </div>'
        + svg("light", '<rect width="1080" height="1920" fill="url(#keyLight)"/>'
              '<path d="M612 316 L928 316 L780 1402 L180 1402 Z" fill="url(#shaft)" opacity=".42"/>',
              "opacity:0;mix-blend-mode:screen")
        + '\n  <div class="layer place" id="capWrap" style="left:110px;top:1400px;width:860px;height:200px;background:radial-gradient(ellipse 70% 90% at 30% 50%,rgba(10,7,4,.75),rgba(10,7,4,0))">'
          '<div id="cap" class="n-head" style="font-size:56px;color:#F3D2A4">A warm room, a figure in silhouette, and one light from the window.</div></div>'),
  notes="Four depth planes on a perspective rig, slow push, ambient parallax; type lives OUTSIDE the rig.",
  script=f'''injectDefs(["warmRoom","keyLight","shaft"]);
$("#aFar").innerHTML = ART.roomWall();
$("#aWin").innerHTML = ART.roomWindow();
$("#aMid").innerHTML = ART.roomFurniture();
$("#aFig").innerHTML = ART.figure(ART.SEAT.x, ART.SEAT.y, 1.0, 7, 1);
const rig = M.cam($("#rig"), {{ perspective: 1500, origin: "50% 62%" }});
M.plane($("#pFar"), 0.42, {{ scale: 1.34 }});
M.plane($("#pWin"), 0.62, {{ scale: 1.22 }});
M.plane($("#pMid"), 0.80, {{ scale: 1.12 }});
M.plane($("#pFig"), 1.00, {{ scale: 1.06 }});
const T = M.use(M.tl());
M.rise($("#rig"), 0.00, {{ dur: 1.0, y: 0, scale: 1.02, ease: M.EASE.colour }});
T.fromTo("#light", {{ opacity: 0 }}, {{ opacity: 1, duration: 1.6, ease: M.EASE.colour }}, {W(n,"window")-1.2:.2f});
T.fromTo(rig, {{ x: 40, scale: 1.055 }}, {{ x: 0, scale: 1.0, duration: {D-0.4:.2f}, ease: M.EASE.camera }}, 0.10);
M.parallax(rig, [$("#pFig"), $("#pMid"), $("#pWin"), $("#pFar")], {{ amount: 22, dur: 15, rotate: 0.28 }});
/* CSS word reveal for the caption, synced to the voice */
EL.kineticWords($("#cap"), {{name:"wordIn", stagger:.2, dur:.42, delay:{W(n,"A")}}});
EL.syncWords($("#cap"), {WS(n,"A","window")});
T.fromTo("#cutBlack", {{ opacity: 0 }}, {{ opacity: 1, duration: 0.06, ease: "none" }}, {D-0.06:.2f});'''))

# ── 3 · quote card with page turns, words on the voice ─────────────
n = 3; D = DUR[n]
SHOTS.append(dict(n=n, title="QUOTE CARD", grain=.06,
  body=svg("bgWarm", '<rect width="1080" height="1920" fill="#0D0A07"/><ellipse cx="540" cy="760" rx="520" ry="420" fill="#2A1A0B" opacity=".7" filter="url(#soft40)"/>', "")
       + '\n  <div class="layer" id="cardLayer"></div>',
  notes="EL.pages: same card geometry every page; pages never overlap; holdGaps keeps a page up through pauses.",
  script=f'''injectDefs([]);
EL.pages($("#cardLayer"), [
  {{text:{Q("Quotes live on a card.")}, at:{W(n,"Quotes")}, end:{WE(n,"card")+0.3:.2f}, cls:"big", times:{WS(n,"Quotes","card")}}},
  {{text:{Q("Each word appears at the moment it is spoken, and the card turns its page when the sentence ends.")}, at:{W(n,"Each")}, times:{WS(n,"Each","ends")}}}
], {{holdGaps:true, attr:"EXAMPLE CARD · replace with a real, cited source", top:620, hold:{D-0.6:.2f}}});
{cut(n)}'''))

# ── 4 · data: pictogram lights on the spoken number ────────────────
n = 4; D = DUR[n]
SHOTS.append(dict(n=n, title="DATA ON THE WORD", grain=.04,
  body=COLD + svg("crowdLayer", '<g id="crowdArt"></g>')
       + '\n  <div class="layer place" id="numWrap" style="opacity:0;left:110px;top:560px;width:860px;height:200px;text-align:center">'
         '<div id="counter" class="stamp" style="font-size:150px;color:#F5C451;filter:drop-shadow(0 0 30px rgba(245,196,81,.45))">0</div></div>'
       + '\n  <div class="layer" id="nMount"></div>',
  notes="100 pictograms; 60 light exactly on the word 'sixty'; a count-up lands on the same word.",
  script=COLD_JS + f'''$("#crowdArt").innerHTML = ART.crowd();
EL.anim($("#crowdLayer"), "fadeIn", {W(n,"hundred")-0.3:.2f}, .4, "linear");
document.querySelectorAll("#crowdArt .fig").forEach((f,i)=>{{
  f.querySelectorAll("rect,circle,path").forEach(s=>s.setAttribute("fill", i < 60 ? "#F5C451" : "#2A323E"));
  if (i < 60) EL.anim(f, "figLit", {W(n,"sixty")} + (i%10)*.025 + Math.floor(i/10)*.03, .45, "var(--e-back)");
}});
/* the shared clock's counter: count from 0 to 60 across "light up, exactly on the word sixty" */
const c = $("#counter"); c.dataset.countTo = 60;
c.dataset.countStart = {W(n,"sixty")-0.9:.2f}; c.dataset.countEnd = {W(n,"sixty")+0.05:.2f};
EL.anim($("#numWrap"), "popInHard", {W(n,"sixty")-0.9:.2f}, .4, "var(--e-back)");
EL.ncard($("#nMount"), {{at:{W(n,"Data")}, top:330, size:70, times:{WS(n,"Data","care")}, end:{W(n,"Out")-0.3:.2f},
  text:"Data gets the same care."}});
{cut(n)}'''))

# ── 5 · style sampler: the drawing follows the story ───────────────
n = 5; D = DUR[n]
PW = 380
POS = [(135, 400), (565, 400), (135, 810), (565, 810), (135, 1220), (565, 1220)]
NAMES = ["paper", "blueprint", "ink", "isometric", "neon", "light"]
BGS = ["#E8D9C0", "#0F3A66", "#F1E8D6", "#EAF0F6", "#07070D", "#0B0E14"]
def panel(i):
    x, y = POS[i]
    return (f'<g class="panel" id="pn{i}" style="transform-box:fill-box;transform-origin:50% 50%">'
            f'<svg x="{x}" y="{y}" width="{PW}" height="{PW}" viewBox="0 0 400 400">'
            f'<defs><clipPath id="cp{i}"><rect width="400" height="400" rx="22"/></clipPath></defs>'
            f'<g clip-path="url(#cp{i})"><rect width="400" height="400" fill="{BGS[i]}"/><g id="art{i}"></g></g>'
            f'<rect width="400" height="400" rx="22" fill="none" stroke="#2C3E57" stroke-width="2"/>'
            f'<rect x="12" y="352" width="{24 + 14 * len(NAMES[i])}" height="34" rx="8" fill="#0B0E14" opacity=".8"/>'
            f'<text x="24" y="376" fill="#F4F7FB" font-family="JetBrains Mono,monospace" font-size="20" '
            f'letter-spacing="3">{NAMES[i].upper()}</text></svg></g>')
SAMPLER_JS = '''/* 1 paper cut-out */
$("#art0").innerHTML = '<circle cx="290" cy="110" r="46" fill="#F2A35E"/>' + ART.paperLayers(undefined, 4, 150, 400, 400, 55, 90);
/* 2 blueprint: white line-art buildings on a technical sheet */
$("#art1").innerHTML = ART.blueprintSheet(0, 0, 400, 400, "FIG. 2") +
  ART.isoBox(220, 300, 110, 80, 150, "none", "none", "none", "#E6F2FF") +
  ART.isoBox(115, 310, 55, 55, 80, "none", "none", "none", "#E6F2FF") +
  '<path d="M60 335 L340 335" stroke="#CFE6FA" stroke-width="2" stroke-dasharray="6 6"/>';
/* 3 ink: hatched hill, a house and a tree in a wobbly hand-drawn line */
$("#art2").innerHTML = '<path d="M0 300 Q120 220 240 270 T400 250 L400 400 L0 400Z" fill="url(#hatch)"/>' +
  ART.ink("M0 300 Q120 220 240 270 T400 250") +
  ART.ink("M130 250 L130 175 L185 135 L240 175 L240 255 M165 255 L165 215 L195 215 L195 255") +
  ART.ink("M300 262 L300 195 M300 200 C 258 192 258 128 300 118 C 344 124 344 192 300 200", "#1B1A17", 4);
/* 4 isometric city */
$("#art3").innerHTML = [[150,300,70,70,120],[245,320,60,60,70],[90,340,50,50,55],[205,370,70,40,40]]
  .map(b => ART.isoBox(...b, "#F7FBFF", "#9DB4FF", "#5C74C4")).join("");
/* 5 neon: a wave and a ring as glowing tubes */
$("#art4").innerHTML = ART.neon(ART.wave(260, 34, 200, 0, 20, 380), "#5CF2FF") +
  ART.neon("M200 70 a70 70 0 1 1 -0.1 0", "#FF5CD6", 6);
/* 6 light: lit 3D spheres in dust */
$("#art5").innerHTML = ART.particles(40, 9, 0, 0, 400, 400, "#F4F7FB", 1, 2.5) +
  ART.sphere(170, 200, 90, "spA") + ART.sphere(300, 262, 46, "spB", "#D6E4FF", "#7D9BFF", "#1A2350");
'''
SHOTS.append(dict(n=n, title="ANY STYLE", grain=.04,
  body=COLD + svg("panels", "".join(panel(i) for i in range(6)), "") + '\n  <div class="layer" id="nMount"></div>',
  notes="Six art directions from the style kit, each appearing on its spoken name; line art draws on.",
  script=COLD_JS + SAMPLER_JS + f'''const at = {[W(n, w) for w in NAMES]};
document.querySelectorAll(".panel").forEach((p,i) => EL.anim(p, "popInHard", at[i]-0.05, .45, "var(--e-back)"));
document.querySelectorAll("#art2 path[stroke], #art4 path").forEach((p,i) => {{
  const L = p.getTotalLength ? p.getTotalLength() : 600;
  p.style.strokeDasharray = L; p.style.setProperty("--dash", L);
  EL.anim(p, "lineDraw", (p.closest("#art4") ? at[4] : at[2]) + .1 + (i%3)*.12, 1.0, "var(--e-expo)");
}});
EL.ncard($("#nMount"), {{at:{W(n,"And")}, top:250, size:58, times:{WS(n,"And","needs")},
  text:"The drawing follows the story."}});
{cut(n)}'''))

# ── 6 · end card ───────────────────────────────────────────────────
n = 6; D = DUR[n]
SHOTS.append(dict(n=n, title="END CARD", grain=.04,
  body='''
  <div class="layer" style="background:radial-gradient(ellipse 70% 30% at 50% 45%,rgba(78,159,219,.14),rgba(0,0,0,0))"></div>
  <div class="layer center" id="lineWrap" style="opacity:0">
    <div id="line" style="font-family:var(--display);font-weight:700;font-size:100px;letter-spacing:-.03em;
         color:var(--n);text-align:center;line-height:1.05;text-shadow:0 0 60px rgba(78,159,219,.35)">Every cue<br><span style="color:var(--ink)">is a word.</span></div>
  </div>''',
  notes="Display line built per character (EL.kinetic) — short lines only.",
  script=f'''injectDefs([]);
EL.anim($("#lineWrap"), "fadeIn", {W(n,"Every")-0.1:.2f}, .3, "linear");
EL.kinetic($("#line"), {{name:"riseMask", stagger:{(WE(n,"word")-W(n,"Every"))/18:.3f}, dur:.7, delay:{W(n,"Every")-0.05:.2f}}});
{cut(n)}'''))

# ── write pages, beats.js and the gallery ──────────────────────────
for d in SHOTS:
    k = d["n"]
    d.update(off=T.OFF[k], dur=DUR[k], tc=T.tc(k), file=f"p{PART}-s{k:02d}")
    open(f"p{PART}-s{k:02d}.html", "w").write(build(d, part=PART, total_shots=len(SHOTS), project=PROJECT))
    print(f"wrote p{PART}-s{k:02d}.html  {DUR[k]:6.2f}s @ {T.OFF[k]:7.2f}  {d['title']}")
beats = {"title": PROJECT, "parts": {str(PART): {"total": T.TOTAL,
         "beats": [{"n": d["n"], "t": T.OFF[d["n"]], "name": d["title"]} for d in SHOTS]}}}
open("beats.js", "w").write("window.PROJECT = " + json.dumps(beats) + ";\n")
rows = "".join(f'<tr><td>{d["n"]}</td><td><a href="p{PART}-s{d["n"]:02d}.html">{d["title"]}</a></td>'
               f'<td>{DUR[d["n"]]:.2f}s</td><td>{T.P[d["n"]-1]["text"]}</td></tr>' for d in SHOTS)
open("index.html", "w").write(f'''<!doctype html><meta charset="utf-8"><title>{PROJECT} — shots</title>
<style>body{{font:15px/1.5 system-ui;background:#0b0e14;color:#e6ebf2;padding:32px}}a{{color:#7fc0ee}}
td{{padding:8px 14px;border-bottom:1px solid #222b3a;vertical-align:top}}</style>
<h1>{PROJECT} · part {PART} · {T.TOTAL:.1f}s</h1><table>{rows}</table>''')
print("part", PART, "total", T.TOTAL, "s")

#!/usr/bin/env python3
"""KIT COOKBOOK — four gallery pages that render every part of the kit.

    python3 gallery.py      -> gallery-1.html … gallery-4.html (open in Chrome, press space)

Each tile is real, copyable code: find the tile, read its JS, reuse the call.
These pages are a catalogue, not a video, so timings are fixed (no voiceover).
"""
from beat_template import build

DUR = 6.0

def tiles(cols, rows, x0=110, y0=330, w=860, h=1200, gap=26):
    tw = (w - gap * (cols - 1)) / cols; th = (h - gap * (rows - 1)) / rows
    return [(x0 + c * (tw + gap), y0 + r * (th + gap), tw, th) for r in range(rows) for c in range(cols)]

def tile_svg(i, box, label, bg="#0B0E14", vb=(400, 400)):
    x, y, w, h = box
    return (f'<g class="tile" style="transform-box:fill-box;transform-origin:50% 50%">'
            f'<svg x="{x:.0f}" y="{y:.0f}" width="{w:.0f}" height="{h:.0f}" viewBox="0 0 {vb[0]} {vb[1]}" preserveAspectRatio="xMidYMid slice">'
            f'<defs><clipPath id="tc{i}"><rect width="{vb[0]}" height="{vb[1]}" rx="22"/></clipPath></defs>'
            f'<g clip-path="url(#tc{i})"><rect width="{vb[0]}" height="{vb[1]}" fill="{bg}"/><g id="t{i}"></g></g>'
            f'<rect width="{vb[0]}" height="{vb[1]}" rx="22" fill="none" stroke="#2C3E57" stroke-width="2"/></svg>'
            f'<rect x="{x+10:.0f}" y="{y+h-46:.0f}" width="{18+13.2*len(label):.0f}" height="34" rx="8" fill="#0B0E14" opacity=".85"/>'
            f'<text x="{x+20:.0f}" y="{y+h-22:.0f}" fill="#F4F7FB" font-family="JetBrains Mono,monospace" font-size="20" letter-spacing="2">{label}</text></g>')

def page(n, title, kicker, tile_markup, js, palette=""):
    body = f'''
  <div class="layer" style="background:radial-gradient(ellipse 80% 40% at 50% 10%,#12203A,#070A10 70%)"></div>
  <div class="layer place" style="left:110px;top:190px;width:860px;height:120px">
    <div class="kicker" style="border-left:6px solid var(--n);padding-left:20px;line-height:40px">{kicker}</div>
    <div class="n-head" style="font-size:60px;margin-top:14px">{title}</div></div>
  <div class="layer"><svg viewBox="0 0 1080 1920" width="1080" height="1920" style="position:absolute">{tile_markup}</svg></div>'''
    script = f'''injectDefs(["warmRoom","keyLight","coldField","shaft","haze"]);
{js}
document.querySelectorAll(".tile").forEach((t,i)=>EL.anim(t,"popInHard",0.2+i*.08,.45,"var(--e-back)"));
EL.anim($("#cutBlack"), "f0", {DUR-0.06:.2f}, .06, "linear");'''
    d = dict(n=n, title=title, off=0, dur=DUR, tc="", file=f"gallery-{n}", body=body, script=script,
             grain=.03, palette=palette, notes="Kit cookbook — read the JS for each tile.")
    html = build(d, part=0, total_shots=4, project="KIT")
    html = html.replace('href="p0-s%02d.html"' % (n - 1), f'href="gallery-{n-1}.html"').replace('href="p0-s%02d.html"' % (n + 1), f'href="gallery-{n+1}.html"')
    open(f"gallery-{n}.html", "w").write(html)
    print("wrote", f"gallery-{n}.html")

# ── 1 · backgrounds ────────────────────────────────────────────────
T = tiles(2, 4)
names = ["AURORA", "LOW-POLY", "TOPOGRAPHIC", "BOKEH", "WAVES", "STARFIELD", "SUNBURST", "HALFTONE"]
bgs = ["#070814", "#1B2A4A", "#0F2A3F", "#140E1A", "#081C2E", "#05060B", "#FF8C42", "#F1FAEE"]
page(1, "Backgrounds", "KIT · KIT.bg", "".join(tile_svg(i, T[i], names[i], bgs[i]) for i in range(8)), '''
$("#t0").innerHTML = KIT.bg.aurora(undefined, 3, 0,0,400,400);  KIT.bg.animateAurora($("#t0"), 8);
$("#t1").innerHTML = KIT.bg.lowPoly(["#1B2A4A","#3D5A80","#98C1D9","#E0FBFC"], 7, 0,0,400,400, 5, 5);
$("#t2").innerHTML = KIT.bg.topo(5, 0,0,400,400, "#9CC9F5", 2, 7);
$("#t3").innerHTML = KIT.bg.bokeh(undefined, 20, 9, 0,0,400,400);
$("#t4").innerHTML = KIT.bg.waves(undefined, 180, 0, 400, 400, 22);
$("#t5").innerHTML = KIT.bg.starfield(120, 11, 0,0,400,400);
$("#t6").innerHTML = KIT.bg.sunburst(200, 200, 18, "#FFB347", "#FF8C42", 600);
$("#t7").innerHTML = KIT.bg.halftoneFade("#E63946", 0,0,400,400, 18);
document.querySelectorAll("#t5 .tw").forEach((s,i)=>EL.loop(s,"twinkle",1.4+i%3*.4,"var(--e-soft)",true));''')

# ── 2 · art styles ─────────────────────────────────────────────────
T = tiles(3, 3)
names = ["CLAY 3D", "GLASS", "BAUHAUS", "PIXEL", "COMIC", "WATERCOLOUR", "RISO", "CHALK", "NETWORK"]
bgs = ["#EDE7F6", "#1A1440", "#F1FAEE", "#1B1B2F", "#FFF4D6", "#F6F1E7", "#F4EFE6", "#24382E", "#070A14"]
page(2, "Art styles", "KIT · KIT.style", "".join(tile_svg(i, T[i], names[i], bgs[i]) for i in range(9)), '''
$("#t0").innerHTML = KIT.style.clay(80,90,240,150,"#7C9CFF",null,"clA") + KIT.style.clay(130,200,140,110,"#FF8FA3",null,"clB");
$("#t1").innerHTML = KIT.bg.aurora(["#7C5CFF","#FF5CD6","#00C2D1"], 4, 0,0,400,400, "#1A1440") + KIT.style.glass(60,90,280,200);
$("#t2").innerHTML = KIT.style.bauhaus(3, 0,0,400,400);
$("#t3").innerHTML = KIT.style.pixel(["...XX...","..XXXX..",".XYXXYX.","XXXXXXXX","XX.XX.XX",".X....X.","X......X"],
  {X:"#7ED6B4",Y:"#1B1B2F"}, 72, 90, 32);
$("#t4").innerHTML = KIT.style.actionLines(200,220,90,400,30,"#111",6) + KIT.style.burst(200,230,92,12,"#FFD23F","#111",4) +
  KIT.style.bubble(40,40,200,90,120,150,"#fff","#111",5) + '<text x="140" y="96" font-family="Inter Tight" font-weight="800" font-size="34" text-anchor="middle">POW!</text>';
$("#t5").innerHTML = KIT.style.wash(ART.blob(170,180,110,3,10,.25),"#4D8FD6") + KIT.style.wash(ART.blob(250,230,90,8,10,.3),"#E38B6D");
$("#t6").innerHTML = KIT.style.riso(ART.blob(200,190,120,5,9,.2),"#FF48B0","#0078BF",9,6);
$("#t7").innerHTML = KIT.style.chalk("M60 300 Q140 120 220 220 T360 110") + KIT.style.chalk("M90 120 h90 M135 75 v90", "#F7D774", 6);
$("#t8").innerHTML = KIT.style.network(16, 12, 30,30,340,320, "#7FC0EE", 2);
EL.drawOn($("#t7"), .8, 1.2, .2); EL.drawOn($("#t8"), .8, 1.0, .03, "var(--e-expo)", ".edge");''')

# ── 3 · characters & icons ─────────────────────────────────────────
icons = ["person","group","heart","brain","clock","calendar","globe","coin","bars","trendUp","trendDown","warning",
         "check","cross","bolt","eye","lock","house","moon","sun","phone","chat","bulb","book",
         "leaf","drop","flag","search","play","music","shield","pin","atom","star","gift","rocket"]
poses = ["stand", "walk", "wave", "point", "cheer", "think", "sit"]
cols = ["#F4B860", "#7C9CFF", "#FF8FA3", "#7ED6B4", "#F4B860", "#C4A1FF", "#FFD27F"]
pjs = "\n".join(f'$("#pp").insertAdjacentHTML("beforeend", KIT.person({150 + (i % 4) * 255}, {610 + (i // 4) * 300}, 1.05, "{p}", "{cols[i]}"));'
                for i, p in enumerate(poses))
ijs = "\n".join(f'$("#ic").insertAdjacentHTML("beforeend", KIT.icon("{n}", {150 + (i % 9) * 92}, {1170 + (i // 9) * 92}, 56, "#F4F7FB", 2.6));'
                for i, n in enumerate(icons))
plabels = "".join(f'<text x="{150 + (i % 4) * 255}" y="{650 + (i // 4) * 300}" fill="#AEB8C8" font-family="JetBrains Mono" font-size="20" text-anchor="middle" letter-spacing="2">{p.upper()}</text>' for i, p in enumerate(poses))
page(3, "Characters & icons", "KIT.person · KIT.icon",
     f'<g id="pp"></g>{plabels}<g id="ic"></g>'
     f'<text x="110" y="1130" fill="#7E8A9C" font-family="JetBrains Mono" font-size="22" letter-spacing="4">36 LINE ICONS · DRAW THEM ON</text>', f'''
{pjs}
{ijs}
document.querySelectorAll("#pp .person").forEach((p,i)=>{{ p.style.transformBox="fill-box"; p.style.transformOrigin="50% 100%";
  EL.anim(p,"squashLand",.2+i*.12,.6,"var(--e-back)"); }});
EL.drawOn($("#ic"), 1.0, .7, .025);''')

# ── 4 · data, annotation & type ───────────────────────────────────
page(4, "Data, notes & type", "KIT.chart · KIT.annot",
     '<g id="bars"></g><g id="line"></g><g id="ring"></g><g id="waf"></g><g id="tl"></g><g id="an"></g>'
     '<text id="ringPct" x="815" y="790" fill="#F4F7FB" font-family="JetBrains Mono" font-weight="600" font-size="52" text-anchor="middle">0%</text>'
     '<text id="scr" x="110" y="1555" fill="#5CF2FF" font-family="JetBrains Mono" font-weight="600" font-size="40" letter-spacing="6">DECODED ON THE WORD</text>', '''
$("#bars").innerHTML = KIT.chart.bars([34,58,41,82],{x:120,y:380,w:400,h:340,colors:["#4E9FDB","#4E9FDB","#4E9FDB","#F5C451"],labels:["Q1","Q2","Q3","Q4"]});
$("#ring").innerHTML = KIT.chart.donut(815,770,120,72,{color:"#5AD3A2"});
$("#line").innerHTML = KIT.chart.line([12,18,15,26,31,29,44],{x:120,y:880,w:400,h:220,color:"#F5C451",width:6});
$("#waf").innerHTML = KIT.chart.waffle(38,{x:600,y:935,cols:10,rows:10,cell:24,gap:6,on:"#FF8FA3"});
$("#tl").innerHTML = KIT.chart.timeline([{t:0,label:"1998"},{t:.35,label:"2003"},{t:.62,label:"2011"},{t:1,label:"2021"}],{x:150,y:1330,w:780});
$("#an").innerHTML = KIT.annot.circle(810,770,170,165,"#F5C451",5,4) + KIT.annot.arrow(600,560,520,640,"#F5C451",5) +
  KIT.annot.underline(120,520,1150,"#FF8FA3",6) + KIT.annot.check(960,1180,50) + KIT.annot.cross(960,1250,40);
document.querySelectorAll("#bars .bar").forEach((b,i)=>EL.anim(b,"barFill",.5+i*.15,.8,"var(--e-expo)"));
KIT.chart.fillRing($("#ring .ring"), .8, 1.4);  EL.counter($("#ringPct"), 0, 72, .8, 1.4, {suffix:"%"});
EL.drawOn($("#line"), 1.0, 1.4, 0, "var(--e-expo)", ".ln");
document.querySelectorAll("#waf .wf.on").forEach((c,i)=>EL.anim(c,"popInHard",1.2+i*.02,.3,"var(--e-back)"));
EL.drawOn($("#tl"), 1.4, 1.0, .1, "var(--e-expo)", ".tlLine");
EL.drawOn($("#an"), 2.2, .8, .25);
EL.scramble($("#scr"), 2.4, 1.6);''')

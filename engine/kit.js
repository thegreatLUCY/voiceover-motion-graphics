/* =========================================================
   KIT — the motion-design toolkit. Loaded after defs.js and before runtime.js.

   Everything returns SVG markup (strings) or path data, sized in the stage's
   1080x1920 user space unless you pass a box. Combine freely; draw new things
   from these parts. Organisation:

     KIT.defs()                         filters/gradients the kit needs (auto-injected)
     KIT.bg.*      backgrounds          aurora, lowPoly, topo, bokeh, waves, starfield,
                                        sunburst, halftoneFade, dotGrid, isoGrid
     KIT.style.*   art directions       clay, glass, bauhaus, pixel, bubble, burst,
                                        actionLines, wash (watercolour), riso, chalk,
                                        network (constellation)
     KIT.person(x,y,scale,pose,color)   explainer character: stand walk wave point
                                        cheer think sit
     KIT.icon(name,x,y,size,color,w)    36 line icons (KIT.ICONS lists them)
     KIT.chart.*   data                 bars, hbars, line, donut, waffle, timeline
     KIT.annot.*   hand-drawn marks     circle, underline, arrow, highlight, cross,
                                        check, bracket
     KIT.PALETTES  named palettes (also in palettes.css as data-palette)

   Animate anything here with the runtime: EL.drawOn (line draw), EL.anim with
   popInHard/barFill/ringFill/etc, EL.morph (shape morph), EL.every (per-frame).
   ========================================================= */

const KIT = (()=>{
  const R = s => EL.rng(s);
  const f1 = n => (+n).toFixed(1);

  /* ---------- colour helpers ---------- */
  const hex2rgb = h => { h=h.replace('#',''); if(h.length===3) h=h.split('').map(c=>c+c).join('');
    return [0,2,4].map(i=>parseInt(h.slice(i,i+2),16)); };
  const rgb2hex = a => '#'+a.map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');
  const mix = (a,b,t) => { const A=hex2rgb(a), B=hex2rgb(b); return rgb2hex(A.map((v,i)=>v+(B[i]-v)*t)); };
  const shade = (c,k) => k>=0 ? mix(c,'#ffffff',k) : mix(c,'#000000',-k);

  /* ---------- filters the kit uses ---------- */
  const defs = () => `
    <filter id="soft90" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="90"/></filter>
    <filter id="claySh" x="-30%" y="-30%" width="160%" height="170%">
      <feDropShadow dx="0" dy="22" stdDeviation="20" flood-color="#000" flood-opacity=".32"/></filter>
    <filter id="watercolor" x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="3" seed="8" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="26" xChannelSelector="R" yChannelSelector="G" result="d"/>
      <feGaussianBlur in="d" stdDeviation="2.2"/></filter>
    <filter id="chalk" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" seed="4" result="g"/>
      <feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 1.6" result="m"/>
      <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="1" seed="2" result="w"/>
      <feDisplacementMap in="SourceGraphic" in2="w" scale="3" result="s"/>
      <feComposite in="s" in2="m" operator="in"/></filter>
    <filter id="rgbSplit" x="-10%" y="-10%" width="120%" height="120%">
      <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0" result="r"/>
      <feOffset in="r" dx="-5" result="r2"/>
      <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0" result="gb"/>
      <feOffset in="gb" dx="5" result="gb2"/>
      <feBlend in="r2" in2="gb2" mode="screen"/></filter>
    <linearGradient id="glassHi" x1="0" y1="0" x2="0.6" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset=".5" stop-color="#fff" stop-opacity=".06"/>
      <stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`;

  /* =========================================================
     BACKGROUNDS
     ========================================================= */
  const bg = {
    /* drifting colour clouds. animate children (.aur) with auroraDrift loops: KIT.bg.animateAurora(root) */
    aurora(colors=["#6C5CE7","#00C2D1","#FF5E8A","#2BD99F"], seed=3, x=0,y=0,w=1080,h=1920, base="#070814"){
      const r=R(seed), fid=`aurB${seed}_${Math.round(w)}`, sd=f1(Math.min(w,h)*.11);
      let o=`<defs><filter id="${fid}" filterUnits="userSpaceOnUse" x="${x-w}" y="${y-h}" width="${w*3}" height="${h*3}">
        <feGaussianBlur stdDeviation="${sd}"/></filter></defs>
        <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${base}"/>`;
      colors.forEach((c,i)=>{ o+=`<ellipse class="aur" cx="${f1(x+w*(.15+r()*.7))}" cy="${f1(y+h*(.1+r()*.8))}"
        rx="${f1(w*(.28+r()*.22))}" ry="${f1(h*(.14+r()*.14))}" fill="${c}" opacity="${(.5+r()*.3).toFixed(2)}"
        filter="url(#${fid})" style="transform-box:fill-box;transform-origin:50% 50%"/>`; });
      return o;
    },
    animateAurora(root, dur=14){ [...root.querySelectorAll('.aur')].forEach((e,i)=>EL.loop(e,'auroraDrift',dur*(.7+i*.18),'var(--e-circ-io)',true)); },

    /* faceted terrain / sky. light comes from the top-left */
    lowPoly(colors=["#1B2A4A","#3D5A80","#98C1D9"], seed=7, x=0,y=0,w=1080,h=1920, cols=7, rows=12){
      const r=R(seed), P=[];
      for(let j=0;j<=rows;j++){ P.push([]); for(let i=0;i<=cols;i++){
        const jx=(i>0&&i<cols)?(r()-.5)*w/cols*.7:0, jy=(j>0&&j<rows)?(r()-.5)*h/rows*.7:0;
        P[j].push([x+i*w/cols+jx, y+j*h/rows+jy]); } }
      const col=t=>{ const k=t*(colors.length-1), a=Math.floor(Math.min(k,colors.length-2)); return mix(colors[a],colors[a+1],k-a); };
      let o='';
      for(let j=0;j<rows;j++) for(let i=0;i<cols;i++){
        const a=P[j][i], b=P[j][i+1], c=P[j+1][i], d=P[j+1][i+1];
        [[a,b,d],[a,d,c]].forEach((t,k)=>{ const cy=(t[0][1]+t[1][1]+t[2][1])/3;
          const base=col((cy-y)/h), lit=shade(base,(r()-.5)*.22+(k?-.06:.04));
          o+=`<path class="tri" d="M${t.map(p=>f1(p[0])+' '+f1(p[1])).join(' L')}Z" fill="${lit}" stroke="${lit}" stroke-width="1"/>`; }); }
      return o;
    },

    /* topographic contour rings around a few peaks */
    topo(seed=5, x=0,y=0,w=1080,h=1920, color="#9CC9F5", peaks=3, levels=9){
      const r=R(seed); let o='';
      for(let p=0;p<peaks;p++){ const cx=x+w*(.15+r()*.7), cy=y+h*(.15+r()*.7), s=seed*31+p*7;
        for(let k=1;k<=levels;k++) o+=`<path class="contour" d="${ART.blob(cx,cy,26*k+r()*6,s,14,.16)}" fill="none"
          stroke="${color}" stroke-width="${k%4===0?2.4:1.2}" opacity="${(k%4===0?.55:.3).toFixed(2)}"/>`; }
      return o;
    },

    /* out-of-focus light discs */
    bokeh(colors=["#FFD27F","#FF8FA3","#9BD7FF"], n=26, seed=9, x=0,y=0,w=1080,h=1920){
      const r=R(seed); let o='';
      for(let i=0;i<n;i++){ const rr=14+r()*70;
        o+=`<circle class="bk" cx="${f1(x+r()*w)}" cy="${f1(y+r()*h)}" r="${f1(rr)}" fill="${colors[i%colors.length]}"
          opacity="${(.12+r()*.3).toFixed(2)}" filter="url(#${rr>50?'soft18':'soft6'})"/>`; }
      return o;
    },

    /* layered sea / sound / hills: filled sine bands, back to front */
    waves(colors=["#0B3C5D","#1B5E85","#328CC1","#6FB7E6"], y0=1100, x=0, w=1080, h=1920, amp=34){
      return colors.map((c,i)=>`<path class="wv" d="${ART.wave(y0+i*120, amp-i*4, 380+i*60, i*1.7, x-40, x+w+40)} L${x+w+40} ${h} L${x-40} ${h}Z"
        fill="${c}" opacity="${(.85+i*.05).toFixed(2)}"/>`).join('');
    },

    /* stars: many faint points, a few bright with glow. .tw for twinkle loops */
    starfield(n=180, seed=11, x=0,y=0,w=1080,h=1920){
      const r=R(seed); let o='';
      for(let i=0;i<n;i++){ const big=r()<.06;
        o+=`<circle class="${big?'tw':'st'}" cx="${f1(x+r()*w)}" cy="${f1(y+r()*h)}" r="${f1(big?2.6+r()*1.6:.6+r()*1.2)}"
          fill="#F4F7FB" opacity="${(big?.95:.25+r()*.5).toFixed(2)}" ${big?'filter="url(#glowF)"':''}/>`; }
      return o;
    },

    /* rays from a point (poster / energy / revelation) */
    sunburst(cx=540, cy=960, n=24, colorA="#FFB347", colorB="#FF8C42", len=1600){
      let o='';
      for(let i=0;i<n;i++){ const a0=i/n*Math.PI*2, a1=(i+.5)/n*Math.PI*2;
        o+=`<path d="M${cx} ${cy} L${f1(cx+Math.cos(a0)*len)} ${f1(cy+Math.sin(a0)*len)} L${f1(cx+Math.cos(a1)*len)} ${f1(cy+Math.sin(a1)*len)}Z"
          fill="${i%2?colorA:colorB}"/>`; }
      return o;
    },

    /* print-style dot gradient: dots grow down the frame */
    halftoneFade(color="#E63946", x=0,y=0,w=1080,h=1920, step=28){
      let o='';
      for(let j=0;j*step<h;j++) for(let i=0;i*step<w;i++){ const t=j*step/h;
        const rr=step*.48*Math.pow(t,1.3); if(rr<.6) continue;
        o+=`<circle cx="${f1(x+i*step+(j%2)*step/2)}" cy="${f1(y+j*step)}" r="${f1(rr)}" fill="${color}"/>`; }
      return o;
    },

    dotGrid(color="#7E8A9C", step=36, x=0,y=0,w=1080,h=1920, r=1.8, op=.35){
      let o=`<g fill="${color}" opacity="${op}">`;
      for(let j=0;j*step<=h;j++) for(let i=0;i*step<=w;i++) o+=`<circle cx="${x+i*step}" cy="${y+j*step}" r="${r}"/>`;
      return o+'</g>';
    },

    isoGrid(color="#2C3E57", step=60, x=0,y=0,w=1080,h=1920, op=.5){
      const t=Math.tan(Math.PI/6); let d='';
      for(let c=-t*w; c<h+t*w; c+=step){
        d+=`M${x} ${f1(y+c)} L${x+w} ${f1(y+c+t*w)} M${x} ${f1(y+c)} L${x+w} ${f1(y+c-t*w)} `; }
      return `<g><defs><clipPath id="isoClip"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath></defs>
        <path d="${d}" stroke="${color}" stroke-width="1" fill="none" opacity="${op}" clip-path="url(#isoClip)"/></g>`;
    },
  };

  /* =========================================================
     STYLES — objects in distinct art directions
     ========================================================= */
  const style = {
    /* soft 3D "clay" object: rounded shape, top-light gradient, inner rim, soft shadow */
    clay(x,y,w,h,color="#7C9CFF",rx=null,id=null){
      id = id || 'cl'+Math.round(x)+'_'+Math.round(y);
      rx = rx==null ? Math.min(w,h)*.28 : rx;
      return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="${shade(color,.28)}"/><stop offset=".55" stop-color="${color}"/>
          <stop offset="1" stop-color="${shade(color,-.22)}"/></linearGradient></defs>
        <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="url(#${id})" filter="url(#claySh)"/>
        <rect x="${x+4}" y="${y+3}" width="${w-8}" height="${h-8}" rx="${Math.max(0,rx-4)}" fill="none"
          stroke="#fff" stroke-opacity=".35" stroke-width="3"/>
        <ellipse cx="${x+w*.32}" cy="${y+h*.22}" rx="${w*.18}" ry="${h*.07}" fill="#fff" opacity=".28" filter="url(#soft6)"/>`;
    },
    /* frosted glass panel (SVG). For HTML panels use the .glass CSS class (real backdrop blur) */
    glass(x,y,w,h,rx=28,tint="#ffffff"){
      return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${tint}" fill-opacity=".08"/>
        <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="url(#glassHi)"/>
        <rect x="${x+.75}" y="${y+.75}" width="${w-1.5}" height="${h-1.5}" rx="${rx}" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="1.5"/>`;
    },
    /* Bauhaus / Swiss poster composition from primitives, seeded */
    bauhaus(seed=2, x=0,y=0,w=1080,h=1920, palette=["#E63946","#F4C430","#1D3557","#F1FAEE","#111111"]){
      const r=R(seed), u=Math.min(w,h)/6; let o=`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${palette[3]}"/>`;
      const cells=[]; for(let j=0;j*u<h;j++) for(let i=0;i*u<w;i++) cells.push([x+i*u,y+j*u]);
      cells.forEach(([cx,cy])=>{ if(r()<.45) return; const c=palette[Math.floor(r()*5)%5===3?4:Math.floor(r()*3)], k=Math.floor(r()*6);
        if(k===0) o+=`<circle class="bh" cx="${cx+u/2}" cy="${cy+u/2}" r="${u/2}" fill="${c}"/>`;
        else if(k===1) o+=`<path class="bh" d="M${cx} ${cy+u} A${u} ${u} 0 0 1 ${cx+u} ${cy}L${cx+u} ${cy+u}Z" fill="${c}"/>`;
        else if(k===2) o+=`<path class="bh" d="M${cx} ${cy+u} L${cx+u/2} ${cy} L${cx+u} ${cy+u}Z" fill="${c}"/>`;
        else if(k===3) o+=`<rect class="bh" x="${cx}" y="${cy}" width="${u}" height="${u}" fill="${c}"/>`;
        else if(k===4) o+=`<path class="bh" d="M${cx} ${cy+u/2} A${u/2} ${u/2} 0 0 1 ${cx+u} ${cy+u/2}Z" fill="${c}"/>`;
        else o+=`<g class="bh">${[0,1,2,3].map(s=>`<rect x="${cx}" y="${cy+s*u/4}" width="${u}" height="${u/8}" fill="${c}"/>`).join('')}</g>`; });
      return o;
    },
    /* pixel art from strings: rows like "..XX..", palette {X:"#f00"}; '.' = empty. class "px" */
    pixel(rows, palette, x, y, size=12){
      let o=''; rows.forEach((row,j)=>[...row].forEach((ch,i)=>{ if(palette[ch])
        o+=`<rect class="px" x="${x+i*size}" y="${y+j*size}" width="${size}" height="${size}" fill="${palette[ch]}"/>`; }));
      return o;
    },
    /* comic speech bubble with a tail pointing at (tx,ty) */
    bubble(x,y,w,h,tx,ty,fill="#FFFFFF",stroke="#111111",sw=6){
      const r=Math.min(w,h)*.45, bx=Math.max(x+r,Math.min(x+w-r,tx)), by=y+h;
      return `<path d="M${x+r} ${y} H${x+w-r} A${r} ${r} 0 0 1 ${x+w} ${y+r} V${y+h-r} A${r} ${r} 0 0 1 ${x+w-r} ${by}
        H${bx+26} L${tx} ${ty} L${bx-20} ${by} H${x+r} A${r} ${r} 0 0 1 ${x} ${y+h-r} V${y+r} A${r} ${r} 0 0 1 ${x+r} ${y}Z"
        fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"/>`;
    },
    /* comic explosion / starburst */
    burst(cx,cy,r=160,points=14,fill="#FFD23F",stroke="#111111",seed=4){
      const rr=R(seed); let d='';
      for(let i=0;i<points*2;i++){ const a=i/(points*2)*Math.PI*2, k=i%2?r*.6:r*(.9+rr()*.25);
        d+=(i?'L':'M')+f1(cx+Math.cos(a)*k)+' '+f1(cy+Math.sin(a)*k); }
      return `<path d="${d}Z" fill="${fill}" stroke="${stroke}" stroke-width="6" stroke-linejoin="round"/>`;
    },
    /* speed / focus lines radiating around a centre (manga energy) */
    actionLines(cx,cy,r1=260,r2=900,n=40,color="#111111",seed=6){
      const r=R(seed); let d='';
      for(let i=0;i<n;i++){ const a=r()*Math.PI*2, k1=r1+r()*120;
        d+=`M${f1(cx+Math.cos(a)*k1)} ${f1(cy+Math.sin(a)*k1)} L${f1(cx+Math.cos(a)*r2)} ${f1(cy+Math.sin(a)*r2)} `; }
      return `<path d="${d}" stroke="${color}" stroke-width="3" stroke-linecap="round" opacity=".7"/>`;
    },
    /* watercolour wash: any closed path d, pigment-pooled edge */
    wash(d,color="#4D8FD6",op=.55){
      return `<g style="mix-blend-mode:multiply" filter="url(#watercolor)">
        <path d="${d}" fill="${color}" opacity="${op}"/>
        <path d="${d}" fill="none" stroke="${shade(color,-.25)}" stroke-width="6" opacity="${op*.6}"/></g>`;
    },
    /* risograph: two inks, slightly misregistered, with halftone grain */
    riso(d,inkA="#FF48B0",inkB="#0078BF",dx=7,dy=5){
      return `<g style="mix-blend-mode:multiply"><path d="${d}" fill="${inkA}" opacity=".9"/>
        <path d="${d}" fill="${inkB}" opacity=".75" transform="translate(${dx} ${dy})"/>
        <path d="${d}" fill="url(#halftone)" opacity=".6"/></g>`;
    },
    /* chalk line on a blackboard */
    chalk(d,color="#F2F2EC",width=7){
      return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" filter="url(#chalk)"/>`;
    },
    /* constellation / network graph: .node circles, .edge lines (draw them on) */
    network(n=18, seed=12, x=110,y=300,w=860,h=1100, color="#7FC0EE", k=2){
      const r=R(seed), N=[...Array(n)].map(()=>[x+r()*w, y+r()*h]); let e='', v='';
      const seen=new Set();
      N.forEach((p,i)=>{ N.map((q,j)=>[j,(q[0]-p[0])**2+(q[1]-p[1])**2]).filter(a=>a[0]!==i)
        .sort((a,b)=>a[1]-b[1]).slice(0,k).forEach(([j])=>{ const key=[i,j].sort().join('-'); if(seen.has(key)) return; seen.add(key);
          e+=`<path class="edge" d="M${f1(p[0])} ${f1(p[1])} L${f1(N[j][0])} ${f1(N[j][1])}" stroke="${color}" stroke-width="2" opacity=".55"/>`; }); });
      N.forEach((p,i)=>{ v+=`<circle class="node" cx="${f1(p[0])}" cy="${f1(p[1])}" r="${f1(5+r()*7)}" fill="${color}" filter="url(#glowF)"
        style="transform-box:fill-box;transform-origin:50% 50%"/>`; });
      return e+v;
    },
  };

  /* =========================================================
     PEOPLE — explainer characters (rounded pictogram style)
     origin = between the feet on the ground; ~210 units tall at scale 1
     ========================================================= */
  const POSES = {
    stand: {neck:[0,-158],hip:[0,-92], aL:[[-24,-122],[-28,-92]], aR:[[24,-122],[28,-92]], lL:[[-10,-46],[-14,0]], lR:[[10,-46],[14,0]]},
    walk:  {neck:[2,-158],hip:[0,-92], aL:[[-14,-122],[-30,-100]], aR:[[22,-124],[34,-104]], lL:[[-16,-48],[-32,-2]], lR:[[12,-46],[22,0]]},
    wave:  {neck:[0,-158],hip:[0,-92], aL:[[-24,-122],[-28,-92]], aR:[[32,-168],[40,-204]], lL:[[-10,-46],[-14,0]], lR:[[10,-46],[14,0]]},
    point: {neck:[0,-158],hip:[0,-92], aL:[[-24,-122],[-28,-92]], aR:[[38,-150],[78,-152]], lL:[[-10,-46],[-14,0]], lR:[[10,-46],[14,0]]},
    cheer: {neck:[0,-158],hip:[0,-92], aL:[[-26,-176],[-34,-212]], aR:[[26,-176],[34,-212]], lL:[[-14,-46],[-22,0]], lR:[[14,-46],[22,0]]},
    think: {neck:[0,-158],hip:[0,-92], aL:[[-22,-118],[2,-112]], aR:[[26,-124],[10,-166]], lL:[[-10,-46],[-14,0]], lR:[[10,-46],[14,0]]},
    sit:   {neck:[0,-138],hip:[0,-72], aL:[[10,-102],[34,-76]], aR:[[18,-104],[40,-78]], lL:[[34,-72],[36,0]], lR:[[40,-70],[44,0]]},
  };
  const person = (x,y,s=1,pose="stand",color="#F4B860",outline=null) => {
    const p=POSES[pose]||POSES.stand, head=[p.neck[0],p.neck[1]-26];
    const L=(pts,w)=>`<path d="M${pts.map(q=>q.join(' ')).join(' L')}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
    const sh=[p.neck[0],p.neck[1]+12];
    const ol = outline ? `<g opacity=".9">${[p.aL,p.aR].map(a=>`<path d="M${[sh,...a].map(q=>q.join(' ')).join(' L')}" fill="none" stroke="${outline}" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>`).join('')}</g>` : '';
    /* outer <g class="person"> carries no transform attribute, so CSS animations on it
       (squashLand, floatY, …) don't wipe out the positioning on the inner group */
    return `<g class="person"><g transform="translate(${x} ${y}) scale(${s})">
      <ellipse cx="0" cy="4" rx="46" ry="7" fill="#000" opacity=".3" filter="url(#soft6)"/>${ol}
      ${L([p.hip,...p.lL],18)}${L([p.hip,...p.lR],18)}
      ${L([p.neck,p.hip],34)}
      ${L([sh,...p.aL],15)}${L([sh,...p.aR],15)}
      <circle cx="${head[0]}" cy="${head[1]}" r="21" fill="${color}"/>
      <path d="M${head[0]-12} ${head[1]-14} A21 21 0 0 1 ${head[0]+19} ${head[1]-6}" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="4" stroke-linecap="round"/>
    </g></g>`;
  };

  /* =========================================================
     ICONS — 24x24 line icons, drawn with stroke (use EL.drawOn to draw them on)
     ========================================================= */
  const ICONS = {
    person:'<circle cx="12" cy="7" r="3.6"/><path d="M5 21c0-4 3.1-7 7-7s7 3 7 7"/>',
    group:'<circle cx="8.5" cy="8" r="3"/><circle cx="16.5" cy="9" r="2.5"/><path d="M2.5 20c0-3.6 2.7-6 6-6s6 2.4 6 6M14 14.4c3.8-.6 7.5 1.4 7.5 5.6"/>',
    heart:'<path d="M12 20s-7.5-4.6-7.5-10.2A4.2 4.2 0 0 1 12 7.2a4.2 4.2 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z"/>',
    brain:'<path d="M10 4.5a3 3 0 0 0-5 2.2 3 3 0 0 0-1.5 5.1A3 3 0 0 0 5.5 17a3 3 0 0 0 4.5 2.5zM14 4.5a3 3 0 0 1 5 2.2 3 3 0 0 1 1.5 5.1 3 3 0 0 1-2 5.2 3 3 0 0 1-4.5 2.5zM10 4.5v15M14 4.5v15"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2.2"/>',
    calendar:'<rect x="3.5" y="5" width="17" height="15.5" rx="2.2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3.2 3.2 3.2 14.8 0 18M12 3c-3.2 3.2-3.2 14.8 0 18"/>',
    coin:'<circle cx="12" cy="12" r="9"/><path d="M14.6 9.6c-.5-1-1.5-1.6-2.6-1.6-1.5 0-2.6.8-2.6 2s1 1.7 2.6 2 2.6.8 2.6 2-1.1 2-2.6 2c-1.1 0-2.1-.6-2.6-1.6M12 6.5V8M12 16v1.5"/>',
    bars:'<path d="M4 20h16M7 16.5v-4M12 16.5V7.5M17 16.5v-7"/>',
    trendUp:'<path d="M3 17l6-6 4 4 8-8M15 7h6v6"/>',
    trendDown:'<path d="M3 7l6 6 4-4 8 8M15 17h6v-6"/>',
    warning:'<path d="M12 3.5l9.5 16.5h-19z"/><path d="M12 10v4.5M12 17.6v.1"/>',
    check:'<path d="M5 12.5l4.5 4.5L19 7"/>',
    cross:'<path d="M6 6l12 12M18 6L6 18"/>',
    bolt:'<path d="M13 2.5L4.5 14h7l-1 7.5L19 10h-7z"/>',
    eye:'<path d="M2 12s3.8-7 10-7 10 7 10 7-3.8 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    lock:'<rect x="5" y="11" width="14" height="9.5" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    house:'<path d="M3 11l9-8 9 8M5.5 9.5V21h13V9.5M10 21v-6h4v6"/>',
    moon:'<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.5 1.5M17.2 17.2l1.5 1.5M5.3 18.7l1.5-1.5M17.2 6.8l1.5-1.5"/>',
    phone:'<rect x="7" y="2.5" width="10" height="19" rx="2.2"/><path d="M11 18.2h2"/>',
    chat:'<path d="M4 5h16v11H9.5L4 20.5z"/>',
    bulb:'<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z"/>',
    book:'<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5zM4 21.5V5.5M8.5 7.5h7"/>',
    leaf:'<path d="M5 19C5 9 11 4 20 4c0 9-5 15-15 15zM5 19l7.5-7.5"/>',
    drop:'<path d="M12 3s6.2 7 6.2 11.2a6.2 6.2 0 0 1-12.4 0C5.8 10 12 3 12 3z"/>',
    flag:'<path d="M5.5 21V3.5M5.5 4h11l-2.2 4.2 2.2 4.3h-11"/>',
    search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="M20 20l-4.8-4.8"/>',
    play:'<path d="M8 5v14l11-7z"/>',
    music:'<path d="M9 18V5.5l11-2V16"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',
    shield:'<path d="M12 3l8 3v6c0 5-3.5 8-8 9.2C7.5 20 4 17 4 12V6z"/>',
    pin:'<path d="M12 21.5s-7-6.3-7-11.5a7 7 0 0 1 14 0c0 5.2-7 11.5-7 11.5z"/><circle cx="12" cy="10" r="2.6"/>',
    atom:'<circle cx="12" cy="12" r="1.6"/><ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-60 12 12)"/>',
    star:'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
    gift:'<rect x="3.5" y="8" width="17" height="4.5" rx="1"/><path d="M5 12.5V21h14v-8.5M12 8v13M12 8c-1.5-4-6-4-5-1.5S12 8 12 8zm0 0c1.5-4 6-4 5-1.5S12 8 12 8z"/>',
    rocket:'<path d="M12 2.5c4 2.5 5.5 6.5 5 11l-2.5 3h-5L7 13.5c-.5-4.5 1-8.5 5-11zM9.5 16.5L7 21l3.2-1.6M14.5 16.5L17 21l-3.2-1.6"/><circle cx="12" cy="9.5" r="1.8"/>',
  };
  const icon = (name,x,y,size=64,color="#F4F7FB",width=2,fill="none") => {
    const s=size/24;
    return `<g class="icon"><g transform="translate(${x} ${y}) scale(${s})" fill="${fill}" stroke="${color}"
      stroke-width="${(width/s).toFixed(3)}" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]||''}</g></g>`;
  };

  /* =========================================================
     CHARTS — data you can animate. bars use .bar (barFill), lines .ln (EL.drawOn),
     rings .ring (KIT.chart.fillRing), waffle cells .wf
     ========================================================= */
  const chart = {
    bars(values, {x=180,y=600,w=720,h=700,colors=["#4E9FDB"],labels=[],max=null,gap=.28,labelColor="#AEB8C8",valueFmt=v=>v}={}){
      const m=max||Math.max(...values), bw=w/values.length*(1-gap), step=w/values.length; let o='';
      o+=`<path d="M${x} ${y+h} H${x+w}" stroke="#7E8A9C" stroke-width="2"/>`;
      values.forEach((v,i)=>{ const bh=h*v/m, bx=x+i*step+(step-bw)/2, c=colors[i%colors.length];
        o+=`<rect class="bar" x="${f1(bx)}" y="${f1(y+h-bh)}" width="${f1(bw)}" height="${f1(bh)}" rx="6" fill="${c}" style="transform-box:fill-box;transform-origin:50% 100%"/>
          <text class="barVal" x="${f1(bx+bw/2)}" y="${f1(y+h-bh-16)}" fill="#F4F7FB" font-family="JetBrains Mono,monospace" font-size="28" font-weight="600" text-anchor="middle">${valueFmt(v)}</text>`;
        if(labels[i]) o+=`<text x="${f1(bx+bw/2)}" y="${y+h+42}" fill="${labelColor}" font-family="JetBrains Mono,monospace" font-size="24" letter-spacing="2" text-anchor="middle">${labels[i]}</text>`; });
      return o;
    },
    hbars(items, {x=110,y=600,w=860,row=110,max=null,color="#4E9FDB"}={}){  /* items [{label,value,color}] */
      const m=max||Math.max(...items.map(i=>i.value)); let o='';
      items.forEach((it,i)=>{ const yy=y+i*row, bw=(w-0)*it.value/m;
        o+=`<text x="${x}" y="${yy}" fill="#AEB8C8" font-family="JetBrains Mono,monospace" font-size="24" letter-spacing="2">${it.label}</text>
          <rect x="${x}" y="${yy+14}" width="${w}" height="30" rx="15" fill="#141A26"/>
          <rect class="bar" x="${x}" y="${yy+14}" width="${f1(bw)}" height="30" rx="15" fill="${it.color||color}" style="transform-box:fill-box;transform-origin:0 50%"/>`; });
      return o;
    },
    line(values, {x=150,y=600,w=780,h=600,color="#F5C451",width=7,min=null,max=null,dots=true,area=true}={}){
      const lo=min??Math.min(...values), hi=max??Math.max(...values);
      const P=values.map((v,i)=>[x+i*w/(values.length-1), y+h-(v-lo)/(hi-lo||1)*h]);
      let d=`M${P.map(p=>f1(p[0])+' '+f1(p[1])).join(' L')}`, o='';
      o+=`<path d="M${x} ${y+h} H${x+w}" stroke="#7E8A9C" stroke-width="2"/>`;
      if(area) o+=`<path class="lnArea" d="${d} L${x+w} ${y+h} L${x} ${y+h}Z" fill="${color}" opacity=".14"/>`;
      o+=`<path class="ln" d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" filter="url(#glowF)"/>`;
      if(dots) P.forEach(p=>o+=`<circle class="lnDot" cx="${f1(p[0])}" cy="${f1(p[1])}" r="${width*1.3}" fill="${color}" style="transform-box:fill-box;transform-origin:50% 50%"/>`);
      return o;
    },
    donut(cx,cy,r,pct,{color="#5AD3A2",track="#1C2433",width=34}={}){
      const C=2*Math.PI*r;
      return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${track}" stroke-width="${width}"/>
        <circle class="ring" cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round"
          transform="rotate(-90 ${cx} ${cy})" stroke-dasharray="${f1(C)}" stroke-dashoffset="${f1(C)}" data-c="${f1(C)}" data-pct="${pct}"/>`;
    },
    fillRing(el, at, dur=1.2, ease="var(--e-expo)"){ const C=+el.dataset.c, p=+el.dataset.pct;
      el.style.setProperty('--dash', C); el.style.setProperty('--to', C*(1-p/100)); EL.anim(el,'ringFill',at,dur,ease); },
    waffle(filled, {x=210,y=700,cols=10,rows=10,cell=56,gap=10,on="#F5C451",off="#1C2433"}={}){
      let o=''; for(let i=0;i<cols*rows;i++){ const cx=x+(i%cols)*(cell+gap), cy=y+Math.floor(i/cols)*(cell+gap);
        o+=`<rect class="wf${i<filled?' on':''}" x="${cx}" y="${cy}" width="${cell}" height="${cell}" rx="10" fill="${i<filled?on:off}"
          style="transform-box:fill-box;transform-origin:50% 50%"/>`; }
      return o;
    },
    timeline(events, {x=150,y=960,w=780,color="#4E9FDB",labelColor="#AEB8C8"}={}){  /* events [{t:0..1,label,sub}] */
      let o=`<path class="tlLine" d="M${x} ${y} H${x+w}" stroke="${color}" stroke-width="4" stroke-linecap="round"/>`;
      events.forEach((e,i)=>{ const ex=x+e.t*w, up=i%2===0;
        o+=`<g class="tlEv" style="transform-box:fill-box;transform-origin:50% 50%"><circle cx="${f1(ex)}" cy="${y}" r="12" fill="${color}" stroke="#0B0E14" stroke-width="4"/>
          <text x="${f1(ex)}" y="${up?y-34:y+56}" fill="#F4F7FB" font-family="JetBrains Mono,monospace" font-size="26" font-weight="600" text-anchor="middle">${e.label}</text>
          ${e.sub?`<text x="${f1(ex)}" y="${up?y-70:y+90}" fill="${labelColor}" font-family="JetBrains Mono,monospace" font-size="20" text-anchor="middle">${e.sub}</text>`:''}</g>`; });
      return o;
    },
  };

  /* =========================================================
     ANNOTATIONS — hand-drawn marks (use EL.drawOn, or EL.annotate on a DOM element)
     ========================================================= */
  const annot = {
    circle(cx,cy,rx,ry,color="#F5C451",w=5,seed=3){
      const r=R(seed), o=.08+r()*.06; let d='';
      for(let i=0;i<=40;i++){ const a=-0.6+i/40*(Math.PI*2+0.5), k=1+(r()-.5)*.05+(i/40)*o;
        d+=(i?' L':'M')+f1(cx+Math.cos(a)*rx*k)+' '+f1(cy+Math.sin(a)*ry*k); }
      return `<path class="anno" d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" filter="url(#rough)"/>`;
    },
    underline(x1,x2,y,color="#F5C451",w=6){
      return `<path class="anno" d="M${x1} ${y} C ${f1(x1+(x2-x1)*.3)} ${y-6} ${f1(x1+(x2-x1)*.7)} ${y+7} ${x2} ${y-2}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" filter="url(#rough)"/>`;
    },
    arrow(x1,y1,x2,y2,color="#F5C451",w=6,bend=.25){
      const mx=(x1+x2)/2-(y2-y1)*bend, my=(y1+y2)/2+(x2-x1)*bend, a=Math.atan2(y2-my,x2-mx), L=28;
      return `<path class="anno" d="M${x1} ${y1} Q${f1(mx)} ${f1(my)} ${x2} ${y2}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" filter="url(#rough)"/>
        <path class="anno" d="M${f1(x2-L*Math.cos(a-.45))} ${f1(y2-L*Math.sin(a-.45))} L${x2} ${y2} L${f1(x2-L*Math.cos(a+.45))} ${f1(y2-L*Math.sin(a+.45))}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" filter="url(#rough)"/>`;
    },
    highlight(x,y,w,h,color="#F5C451",op=.35){
      return `<rect class="annoHi" x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${color}" opacity="${op}" style="transform-box:fill-box;transform-origin:0 50%;mix-blend-mode:screen"/>`;
    },
    cross(x,y,s=60,color="#E8605B",w=7){ return `<path class="anno" d="M${x-s/2} ${y-s/2} L${x+s/2} ${y+s/2} M${x+s/2} ${y-s/2} L${x-s/2} ${y+s/2}" stroke="${color}" stroke-width="${w}" stroke-linecap="round" filter="url(#rough)"/>`; },
    check(x,y,s=60,color="#5AD3A2",w=7){ return `<path class="anno" d="M${x-s/2} ${y} L${x-s/8} ${y+s*.38} L${x+s/2} ${y-s*.42}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" filter="url(#rough)"/>`; },
    bracket(x,y1,y2,color="#F5C451",w=5,side=1){ const k=24*side;
      return `<path class="anno" d="M${x} ${y1} Q${x+k} ${y1} ${x+k} ${y1+24} V${(y1+y2)/2-16} Q${x+k} ${(y1+y2)/2} ${x+k*2} ${(y1+y2)/2} Q${x+k} ${(y1+y2)/2} ${x+k} ${(y1+y2)/2+16} V${y2-24} Q${x+k} ${y2} ${x} ${y2}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" filter="url(#rough)"/>`; },
  };

  const PALETTES = {
    documentary: {base:"#080A0F", ink:"#F4F7FB", accents:["#4E9FDB","#E0A458","#E8605B"]},
    warmStory:   {base:"#14100B", ink:"#F6EDE1", accents:["#E0A458","#C9744A","#8BA88E"]},
    pastel:      {base:"#F7F3EC", ink:"#2B2B33", accents:["#7C9CFF","#FF8FA3","#7ED6B4","#FFD27F"]},
    neonNight:   {base:"#07070D", ink:"#F4F7FB", accents:["#5CF2FF","#FF5CD6","#C4FF4D"]},
    paperEarth:  {base:"#E8D9C0", ink:"#2E2117", accents:["#C08A5A","#5C3A28","#7A8B5E"]},
    blueprint:   {base:"#0F3A66", ink:"#E6F2FF", accents:["#CFE6FA","#FFD166"]},
    printRetro:  {base:"#F1FAEE", ink:"#111111", accents:["#E63946","#1D3557","#F4C430"]},
  };

  return { defs, bg, style, person, POSES, ICONS, icon, chart, annot, PALETTES, mix, shade };
})();

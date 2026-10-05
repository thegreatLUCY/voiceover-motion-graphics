/* =========================================================
   ARTWORK LIBRARY — every illustration is a function that returns layered SVG.
   Never draw in a beat file: put new art here so it is reusable and consistent.

   The look that makes this read as "premium" rather than clip-art:
     - one key light (top-right); every solid has a 3+-stop gradient
     - a rim highlight on the lit edge (stroke + filter="url(#glowF)")
     - a soft contact shadow (blurred ellipse, filter="url(#soft6)")
     - silhouettes, never faces; depth from layered planes
   Filters/gradients come from support() and are injected by injectDefs().
   Uses EL.rng from runtime.js for seeded (repeatable) randomness.
   ========================================================= */

const ART = (()=>{

  /* ---------- gradients ---------- */

  /* warm interior wall gradient (story register) */
  const warmRoom = (id)=>`
    <linearGradient id="${id}" x1="0" y1="0" x2="0.35" y2="1">
      <stop offset="0"    stop-color="#2E2014"/>
      <stop offset="0.45" stop-color="#241910"/>
      <stop offset="0.72" stop-color="#1A120B"/>
      <stop offset="1"    stop-color="#0E0A07"/>
    </linearGradient>`;

  /* warm key light from the top-right; overlay on any warm scene */
  const keyLight = (id)=>`
    <radialGradient id="${id}" cx="0.74" cy="0.30" r="0.70">
      <stop offset="0"    stop-color="#F2B868" stop-opacity="0.42"/>
      <stop offset="0.40" stop-color="#E0A458" stop-opacity="0.13"/>
      <stop offset="1"    stop-color="#E0A458" stop-opacity="0"/>
    </radialGradient>`;

  /* cold radial field for data / documentary plates */
  const coldField = (id)=>`
    <radialGradient id="${id}" cx="0.5" cy="0.42" r="0.85">
      <stop offset="0"    stop-color="#122034"/>
      <stop offset="0.55" stop-color="#0B111C"/>
      <stop offset="1"    stop-color="#05070C"/>
    </radialGradient>`;

  /* volumetric light shaft through a window */
  const shaft = (id)=>`
    <linearGradient id="${id}" x1="0.9" y1="0" x2="0.2" y2="1">
      <stop offset="0"   stop-color="#FFD9A0" stop-opacity="0.42"/>
      <stop offset="0.5" stop-color="#E0A458" stop-opacity="0.14"/>
      <stop offset="1"   stop-color="#E0A458" stop-opacity="0"/>
    </linearGradient>`;

  /* rising warm haze from the bottom of frame */
  const haze = (id)=>`
    <linearGradient id="${id}" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0"   stop-color="#E9AE62" stop-opacity="0.55"/>
      <stop offset="0.5" stop-color="#E0A458" stop-opacity="0.16"/>
      <stop offset="1"   stop-color="#E0A458" stop-opacity="0"/>
    </linearGradient>`;

  /* filters (soft2/6/18/40 blurs, glowF, glowBig, grainF film grain) + utility gradients. Always injected. */
  const support = ()=>`
    <linearGradient id="floorG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#22170E"/><stop offset="1" stop-color="#0A0705"/>
    </linearGradient>
    <linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0"    stop-color="#F6D29A"/>
      <stop offset="0.55" stop-color="#E7A95E"/>
      <stop offset="1"    stop-color="#B26A30"/>
    </linearGradient>
    <linearGradient id="poolG" x1="0.8" y1="0" x2="0.3" y2="1">
      <stop offset="0" stop-color="#F0B062" stop-opacity="0.30"/>
      <stop offset="1" stop-color="#E0A458" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="curtainG" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0"    stop-color="#4A2F18"/>
      <stop offset="0.35" stop-color="#2C1C0E"/>
      <stop offset="0.6"  stop-color="#42291A"/>
      <stop offset="1"    stop-color="#1E140A"/>
    </linearGradient>
    <linearGradient id="woodG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#4A3320"/><stop offset="1" stop-color="#2A1C10"/>
    </linearGradient>
    <linearGradient id="nightG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0"    stop-color="#07080B"/>
      <stop offset="0.55" stop-color="#151009"/>
      <stop offset="1"    stop-color="#2A1B0E"/>
    </linearGradient>
    <radialGradient id="lampG" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0"    stop-color="#FFE0A8" stop-opacity="0.95"/>
      <stop offset="0.18" stop-color="#F0B464" stop-opacity="0.45"/>
      <stop offset="1"    stop-color="#E0A458" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="coneG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#F3BF78" stop-opacity="0.30"/>
      <stop offset="1" stop-color="#E0A458" stop-opacity="0.02"/>
    </linearGradient>
    <radialGradient id="screenG" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#FFF1DC" stop-opacity="0.30"/>
      <stop offset="1" stop-color="#FFF1DC" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glowBlue" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#4E9FDB" stop-opacity="0.30"/>
      <stop offset="1" stop-color="#4E9FDB" stop-opacity="0"/>
    </radialGradient>
    <filter id="soft2"  x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2"/></filter>
    <filter id="soft6"  x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="6"/></filter>
    <filter id="soft18" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="18"/></filter>
    <filter id="soft40" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="40"/></filter>
    <filter id="glowF" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="7" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="glowBig" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="16" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <!-- STYLE KIT filters & patterns -->
    <!-- hand-drawn wobble: apply to strokes for an ink / sketch look -->
    <filter id="rough" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="3" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
    <!-- paper fibre texture: put on a rect over a paper-coloured fill, blend multiply -->
    <filter id="paperTex" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="11"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.9 0.55"/>
    </filter>
    <!-- cut-paper drop shadow: each layer seems to float above the one behind -->
    <filter id="paperShadow" x="-10%" y="-10%" width="120%" height="140%">
      <feDropShadow dx="0" dy="10" stdDeviation="9" flood-color="#000" flood-opacity=".38"/>
    </filter>
    <!-- neon: tight bright core + wide colour bloom -->
    <filter id="neon" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="3" result="a"/><feGaussianBlur stdDeviation="14" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="a"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <pattern id="hatch" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
      <line x1="0" y1="0" x2="0" y2="14" stroke="#1B1A17" stroke-width="2.2" opacity=".55"/>
    </pattern>
    <pattern id="halftone" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(20)">
      <circle cx="8" cy="8" r="3.4" fill="#000" opacity=".28"/>
    </pattern>
    <pattern id="blueprintGrid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M40 0 L0 0 0 40" fill="none" stroke="#9CC9F5" stroke-width="1" opacity=".22"/>
    </pattern>
    <!-- film grain. #grain in shared.js points at this; it was never defined,
         and an SVG element whose filter reference is missing is not painted,
         so the film had no grain at all. -->
    <filter id="grainF" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer><feFuncA type="linear" slope="1.4"/></feComponentTransfer>
    </filter>`;

  /* ---------- SCENES ---------- */

  /* seated silhouette in profile, facing left, origin = hips on the seat. pose "desk" (forearms forward) or "bench" (hands on lap). Upper body is <g class="upper"> so it can recline independently. */
  const figure=(x,y,s=1,seed=7,opacity=1,pose="desk")=>`
    <g transform="translate(${x} ${y}) scale(${s})" opacity="${opacity}">
      <ellipse cx="-110" cy="226" rx="150" ry="12" fill="#000" opacity="0.45" filter="url(#soft6)"/>
      <!-- shin + foot -->
      <path d="M -226 -34 L -234 198 L -196 198 L -186 -14 Z" fill="#140E08"/>
      <path d="M -238 194 L -278 206 Q -288 220 -272 224 L -194 224 L -194 194 Z" fill="#110C07"/>
      <!-- thigh -->
      <path d="M 26 -46 L -204 -50 Q -232 -46 -230 -18 Q -228 6 -204 8 L 26 8 Z" fill="#17100A"/>
      <!-- everything above the hips is its own group, so a shot can recline
           the torso without lifting the legs off the floor -->
      <g class="upper">
      <!-- far arm, a shade lighter so the body has volume -->
      <path d="${pose==="desk" ? "M -10 -248 L -86 -150 L -226 -150" : "M -10 -248 L -50 -140 L -150 -62"}"
            fill="none" stroke="#1F160D" stroke-width="30" stroke-linecap="round" stroke-linejoin="round"/>
      <!-- torso: a slight slouch, the back is the window side -->
      <path d="M 34 4 C 52 -80 46 -190 8 -280 L -58 -272 C -70 -200 -58 -110 -44 4 Z" fill="#18110A"/>
      <!-- neck + head -->
      <path d="M -16 -282 L -42 -282 L -46 -306 L -12 -306 Z" fill="#150F09"/>
      <ellipse cx="-36" cy="-338" rx="40" ry="44" fill="#18110A"/>
      <!-- near arm, forearm resting forward -->
      <path d="${pose==="desk" ? "M -22 -252 L -98 -146 L -242 -144" : "M -22 -252 L -62 -136 L -168 -56"}" fill="none" stroke="#1B130B"
            stroke-width="34" stroke-linecap="round" stroke-linejoin="round"/>
      <!-- RIM LIGHT: window behind him, so the back edge catches it -->
      <g fill="none" stroke="#F4B768" stroke-linecap="round" filter="url(#glowF)" opacity=".85">
        <path d="M 36 -2 C 52 -80 46 -190 10 -276" stroke-width="4"/>
        <path d="M 6 -350 C 2 -330 -2 -316 -8 -308" stroke-width="3.5"/>
        <path d="M -60 -380 C -30 -394 -2 -380 6 -356" stroke-width="3"/>
        <path d="M 24 -46 L -40 -48" stroke-width="2.5" opacity=".5"/>
      </g>
      <!-- a breath of screen light on the face side, never a feature -->
      <path d="M -76 -346 C -80 -330 -74 -312 -62 -302" fill="none" stroke="#FFEBD0"
            stroke-width="2.5" opacity=".28" filter="url(#soft2)"/>
      </g>
    </g>`;

  /* room plane 1: wall, floor with perspective boards, light pool. Oversized so camera moves never reveal edges. */
  const roomWall=()=>{
    const r=EL.rng(23);
    return `<g>
      <rect x="-400" y="-400" width="1880" height="2720" fill="url(#warmRoom)"/>
      <!-- plaster: barely-there vertical variation so the wall is a surface, not a fill -->
      ${Array.from({length:14},(_,i)=>`<rect x="${(-60+i*86+r()*30).toFixed(0)}" y="-400" width="${(30+r()*60).toFixed(0)}"
            height="2720" fill="#000" opacity="${(0.03+r()*0.05).toFixed(3)}"/>`).join("")}
      <!-- chair rail + darker lower wall -->
      <rect x="-400" y="1236" width="1880" height="164" fill="#000" opacity=".22"/>
      <rect x="-400" y="1230" width="1880" height="7" fill="#4A3420" opacity=".75"/>
      <rect x="-400" y="1237" width="1880" height="3" fill="#000" opacity=".35"/>
      <!-- floor -->
      <rect x="-400" y="1400" width="1880" height="920" fill="url(#floorG)"/>
      <rect x="-400" y="1388" width="1880" height="14" fill="#2E2014"/>
      <rect x="-400" y="1386" width="1880" height="2" fill="#5A3E22" opacity=".6"/>
      ${Array.from({length:13},(_,i)=>{
        const xb=-500+i*170; return `<line x1="${540+(xb-540)*0.18}" y1="1402" x2="${xb}" y2="2320"
          stroke="#000" stroke-width="2" opacity=".28"/>`;}).join("")}
      <!-- the window's light lands on the floor, down and to the left -->
      <path d="M 610 1402 L 950 1402 L 860 1920 L 160 1920 Z" fill="url(#poolG)"/>
      <!-- and spills on the wall beneath the sill -->
      <path d="M 600 900 L 940 900 L 980 1230 L 560 1230 Z" fill="#E0A458" opacity=".05"/>
    </g>`;
  };

  /* room plane 2: window with sky, rooftops, bloom, mullions, sill, curtain. */
  const roomWindow=()=>{
    const r=EL.rng(9);
    return `<g>
      <!-- recess -->
      <rect x="588" y="288" width="364" height="604" rx="4" fill="#0E0905"/>
      <!-- the sky: late afternoon, the only bright thing in his life -->
      <rect x="612" y="312" width="316" height="556" fill="url(#skyG)"/>
      <!-- distant rooftops through the glass -->
      <path d="M612 760 L 650 760 L 650 724 L 700 724 L 700 748 L 742 748 L 742 700 L 790 700
               L 790 736 L 836 736 L 836 690 L 880 690 L 880 742 L 928 742 L 928 868 L 612 868 Z"
            fill="#8E5326" opacity=".55"/>
      <path d="M612 812 L 680 812 L 680 790 L 760 790 L 760 806 L 850 806 L 850 784 L 928 784 L 928 868 L 612 868 Z"
            fill="#6E3E1B" opacity=".6"/>
      <!-- bloom on the glass -->
      <ellipse cx="770" cy="470" rx="190" ry="230" fill="#FFF0D0" opacity=".22" filter="url(#soft40)"/>
      <!-- frame + mullions, lit on the inside edge -->
      <rect x="600" y="300" width="340" height="580" fill="none" stroke="#3A2716" stroke-width="22"/>
      <rect x="611" y="311" width="318" height="558" fill="none" stroke="#7A5530" stroke-width="2" opacity=".7"/>
      <rect x="764" y="300" width="12" height="580" fill="#3A2716"/>
      <rect x="600" y="582" width="340" height="12" fill="#3A2716"/>
      <rect x="776" y="300" width="2" height="580" fill="#8A6236" opacity=".5"/>
      <rect x="600" y="594" width="340" height="2" fill="#8A6236" opacity=".5"/>
      <!-- sill -->
      <rect x="572" y="878" width="396" height="20" rx="2" fill="#3E2B18"/>
      <rect x="572" y="878" width="396" height="3" fill="#A27646" opacity=".55"/>
      <rect x="580" y="898" width="380" height="10" fill="#000" opacity=".35"/>
      <!-- the curtain, drawn back to the right -->
      <path d="M 930 250 C 960 520 950 820 1000 1230 L 1090 1230 L 1090 250 Z" fill="url(#curtainG)"/>
      ${Array.from({length:5},(_,i)=>{const x=960+i*24+r()*8;
        return `<path d="M ${x} 250 C ${x+16} 560 ${x+8} 860 ${x+40} 1230" fill="none" stroke="#000" stroke-width="${(3+r()*5).toFixed(1)}" opacity=".28"/>`;}).join("")}
      <path d="M 932 252 C 962 520 952 820 1002 1230" fill="none" stroke="#C88A4C" stroke-width="3" opacity=".45"/>
      <rect x="560" y="236" width="540" height="14" rx="7" fill="#2A1C10"/>
    </g>`;
  };

  /* room plane 3: desk, lamp, books, laptop with screen glow, mug, chair. */
  const roomFurniture=()=>`
    <g>
      <!-- desk -->
      <rect x="96" y="1050" width="480" height="24" rx="3" fill="url(#woodG)"/>
      <rect x="96" y="1050" width="480" height="3" fill="#A07446" opacity=".55"/>
      <rect x="112" y="1074" width="18" height="326" fill="#20160C"/>
      <rect x="542" y="1074" width="18" height="326" fill="#20160C"/>
      <rect x="376" y="1074" width="166" height="118" fill="#251A0F"/>
      <rect x="376" y="1074" width="166" height="4" fill="#000" opacity=".4"/>
      <rect x="436" y="1124" width="46" height="6" rx="3" fill="#5A3E22"/>
      <!-- desk lamp, off -->
      <ellipse cx="160" cy="1048" rx="36" ry="6" fill="#120C07"/>
      <path d="M160 1046 L 176 930 L 236 892" fill="none" stroke="#1A120A" stroke-width="7" stroke-linecap="round"/>
      <path d="M 214 868 L 272 900 L 254 926 Z" fill="#1A120A"/>
      <!-- books -->
      <rect x="250" y="1006" width="22" height="44" fill="#3B2615"/>
      <rect x="274" y="1014" width="16" height="36" fill="#2C2014"/>
      <rect x="292" y="1000" width="20" height="50" fill="#342216"/>
      <!-- laptop: lid seen side-on, leaning back toward the wall -->
      <rect x="352" y="1042" width="140" height="8" rx="3" fill="#2A2018"/>
      <path d="M 356 1044 L 322 924 L 330 922 L 364 1042 Z" fill="#2E241A"/>
      <ellipse cx="410" cy="980" rx="130" ry="110" fill="url(#screenG)"/>
      <!-- mug -->
      <rect x="512" y="1018" width="26" height="32" rx="4" fill="#2A1D12"/>
      <path d="M 538 1024 q 14 4 0 18" fill="none" stroke="#2A1D12" stroke-width="5"/>
      <!-- chair -->
      <rect x="640" y="1184" width="170" height="18" rx="5" fill="#2B1D11"/>
      <rect x="640" y="1184" width="170" height="3" fill="#8A6036" opacity=".45"/>
      <path d="M 796 1186 L 822 920 L 842 920 L 816 1190 Z" fill="#24180D"/>
      <path d="M 822 920 L 842 920" stroke="#C08A50" stroke-width="3" opacity=".5"/>
      <rect x="654" y="1202" width="12" height="198" fill="#1C130A"/>
      <rect x="786" y="1202" width="12" height="198" fill="#1C130A"/>
      <ellipse cx="720" cy="1402" rx="120" ry="10" fill="#000" opacity=".4" filter="url(#soft6)"/>
    </g>`;

  /* where figure() should be placed to sit on the room chair */
  const SEAT={x:720, y:1186};

  /* the full room = roomWall + roomWindow + roomFurniture + key light. Use the three planes separately for parallax. */
  const room=()=>`
    <g>
      ${roomWall()}
      ${roomWindow()}
      ${roomFurniture()}
      <rect x="-400" y="-400" width="1880" height="2720" fill="url(#keyLight)"/>
    </g>`;

  /* night street: city silhouette with lit windows, a street lamp with cone + glow, slatted bench lit from the lamp. */
  const bench=()=>{
    const r=EL.rng(17);
    let city="", win="";
    let x=-20;
    while(x<1100){
      const w=60+r()*110, h=120+r()*260;
      city+=`<rect x="${x.toFixed(0)}" y="${(1150-h).toFixed(0)}" width="${w.toFixed(0)}" height="${h.toFixed(0)}" fill="#0D0A07"/>`;
      for(let k=0;k<5;k++) if(r()<.5)
        win+=`<rect x="${(x+8+r()*(w-20)).toFixed(0)}" y="${(1150-h+14+r()*(h-40)).toFixed(0)}" width="7" height="10"
               fill="#E9B66C" opacity="${(0.25+r()*0.5).toFixed(2)}"/>`;
      x+=w+4+r()*20;
    }
    return `<g>
      <rect x="-200" y="-200" width="1480" height="2320" fill="url(#nightG)"/>
      <ellipse cx="540" cy="1150" rx="900" ry="180" fill="#5A361A" opacity=".25" filter="url(#soft40)"/>
      <g opacity=".95">${city}</g>${win}
      <!-- ground -->
      <rect x="-200" y="1150" width="1480" height="970" fill="#0F0B08"/>
      <rect x="-200" y="1150" width="1480" height="3" fill="#3A2716" opacity=".7"/>
      <path d="M -200 1300 L 1280 1300" stroke="#000" stroke-width="2" opacity=".5"/>
      <!-- the lamp -->
      <ellipse cx="300" cy="1200" rx="460" ry="80" fill="#E0A458" opacity=".16" filter="url(#soft18)"/>
      <path d="M 254 640 L 346 640 L 640 1200 L -40 1200 Z" fill="url(#coneG)"/>
      <rect x="292" y="640" width="14" height="560" fill="#16100A"/>
      <rect x="282" y="1180" width="34" height="22" fill="#16100A"/>
      <path d="M 270 640 L 330 640 L 318 618 L 282 618 Z" fill="#1E150C"/>
      <circle cx="300" cy="648" r="210" fill="url(#lampG)"/>
      <ellipse cx="300" cy="644" rx="24" ry="8" fill="#FFF2D8"/>
      <!-- the bench: slats catch the lamp on their top edges -->
      <ellipse cx="560" cy="1196" rx="500" ry="16" fill="#000" opacity=".55" filter="url(#soft6)"/>
      ${[0,1,2].map(i=>`<rect x="110" y="${960+i*24}" width="880" height="16" rx="3" fill="#2E2114"/>
        <rect x="110" y="${960+i*24}" width="880" height="2.5" fill="#C48A4C" opacity="${(0.55-i*0.12).toFixed(2)}"/>`).join("")}
      ${[0,1].map(i=>`<rect x="96" y="${1046+i*22}" width="908" height="16" rx="3" fill="#33251A"/>
        <rect x="96" y="${1046+i*22}" width="908" height="2.5" fill="#D29856" opacity="${(0.6-i*0.2).toFixed(2)}"/>`).join("")}
      <path d="M 150 1088 L 150 1196 M 930 1088 L 930 1196" stroke="#14100B" stroke-width="16"/>
      <path d="M 150 960 L 150 1088 M 930 960 L 930 1088" stroke="#14100B" stroke-width="12"/>
      <path d="M 130 1050 L 210 1050 M 870 1050 L 950 1050" stroke="#14100B" stroke-width="10" stroke-linecap="round"/>
    </g>`;
  };

  /* standing silhouette, origin = between the feet, rim light colour configurable. */
  const figureStanding=(x,y,s=1,opacity=1,rim="#F4B768")=>`
    <g transform="translate(${x} ${y}) scale(${s})" opacity="${opacity}">
      <ellipse cx="0" cy="6" rx="110" ry="12" fill="#000" opacity=".45" filter="url(#soft6)"/>
      <path d="M -40 -250 L -46 0 L -12 0 L -4 -200 L 4 -200 L 12 0 L 46 0 L 40 -250 Z" fill="#140E08"/>
      <path d="M -62 -470 C -70 -400 -64 -300 -46 -240 L 46 -240 C 64 -300 70 -400 62 -470 C 40 -486 -40 -486 -62 -470 Z" fill="#18110A"/>
      <path d="M -62 -462 C -84 -400 -86 -320 -74 -250" fill="none" stroke="#1B130B" stroke-width="30" stroke-linecap="round"/>
      <path d="M 62 -462 C 84 -400 86 -320 74 -250" fill="none" stroke="#1F160D" stroke-width="30" stroke-linecap="round"/>
      <path d="M -16 -486 L 16 -486 L 14 -506 L -14 -506 Z" fill="#150F09"/>
      <ellipse cx="0" cy="-546" rx="40" ry="46" fill="#18110A"/>
      <g fill="none" stroke="${rim}" stroke-linecap="round" filter="url(#glowF)" opacity=".85">
        <path d="M 64 -468 C 72 -400 66 -300 48 -244" stroke-width="4"/>
        <path d="M 30 -584 C 44 -568 44 -526 30 -508" stroke-width="3.5"/>
        <path d="M 90 -440 C 94 -380 92 -320 84 -256" stroke-width="3" opacity=".7"/>
        <path d="M 42 -240 L 44 -6" stroke-width="3" opacity=".6"/>
      </g>
    </g>`;

  /* the bench scene in warm daylight (callback-friendly variant of bench). */
  const benchDay=()=>{
    const r=EL.rng(17);
    let city="", x=-20;
    while(x<1100){
      const w=60+r()*110, h=120+r()*260;
      city+=`<rect x="${x.toFixed(0)}" y="${(1150-h).toFixed(0)}" width="${w.toFixed(0)}" height="${h.toFixed(0)}" fill="#6E5236" opacity="${(0.35+r()*0.3).toFixed(2)}"/>`;
      x+=w+4+r()*20;
    }
    return `<g>
      <defs><linearGradient id="dayG" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#3A2B1C"/><stop offset=".55" stop-color="#8A6438"/><stop offset="1" stop-color="#D9A464"/>
      </linearGradient></defs>
      <rect x="-200" y="-200" width="1480" height="2320" fill="url(#dayG)"/>
      <circle cx="840" cy="760" r="260" fill="#FFE2B0" opacity=".35" filter="url(#soft40)"/>
      <g>${city}</g>
      <rect x="-200" y="1150" width="1480" height="970" fill="#2A1E14"/>
      <rect x="-200" y="1150" width="1480" height="3" fill="#E8B878" opacity=".6"/>
      <ellipse cx="560" cy="1196" rx="500" ry="16" fill="#000" opacity=".45" filter="url(#soft6)"/>
      ${[0,1,2].map(i=>`<rect x="110" y="${960+i*24}" width="880" height="16" rx="3" fill="#4A3522"/>
        <rect x="110" y="${960+i*24}" width="880" height="2.5" fill="#F2C48A" opacity="${(0.6-i*0.12).toFixed(2)}"/>`).join("")}
      ${[0,1].map(i=>`<rect x="96" y="${1046+i*22}" width="908" height="16" rx="3" fill="#523B26"/>
        <rect x="96" y="${1046+i*22}" width="908" height="2.5" fill="#F7D09C" opacity="${(0.7-i*0.2).toFixed(2)}"/>`).join("")}
      <path d="M 150 1088 L 150 1196 M 930 1088 L 930 1196" stroke="#22180F" stroke-width="16"/>
      <path d="M 150 960 L 150 1088 M 930 960 L 930 1088" stroke="#22180F" stroke-width="12"/>
      <rect x="-200" y="-200" width="1480" height="2320" fill="url(#keyLight)" opacity=".6"/>
    </g>`;
  };

  /* dim living room: sofa, floor lamp, two quiet silhouettes. Low-key and still. */
  const sofaScene=()=>`
    <g>
      <rect x="-200" y="-200" width="1480" height="2320" fill="#120E0A"/>
      <rect x="-200" y="1240" width="1480" height="900" fill="#0C0907"/>
      <rect x="-200" y="1236" width="1480" height="4" fill="#2A1E14"/>
      <!-- a dim floor lamp, the only light -->
      <circle cx="930" cy="760" r="260" fill="url(#lampG)" opacity=".35"/>
      <rect x="926" y="790" width="8" height="450" fill="#17110B"/>
      <path d="M 880 790 L 980 790 L 962 720 L 898 720 Z" fill="#3A2A18"/>
      <path d="M 880 790 L 980 790" stroke="#E0A458" stroke-width="3" opacity=".5"/>
      <!-- sofa -->
      <ellipse cx="520" cy="1250" rx="440" ry="16" fill="#000" opacity=".6" filter="url(#soft6)"/>
      <rect x="150" y="920" width="740" height="200" rx="34" fill="#2A2018"/>
      <rect x="150" y="920" width="740" height="3" fill="#6E5236" opacity=".5"/>
      <rect x="120" y="1040" width="800" height="150" rx="24" fill="#251C14"/>
      <rect x="96"  y="980" width="110" height="230" rx="40" fill="#2E2319"/>
      <rect x="834" y="980" width="110" height="230" rx="40" fill="#2E2319"/>
      <rect x="160" y="1206" width="22" height="34" fill="#16100A"/>
      <rect x="858" y="1206" width="22" height="34" fill="#16100A"/>
      <!-- the person lying still -->
      <g fill="#17110C">
        <ellipse cx="262" cy="1010" rx="40" ry="38"/>
        <path d="M 296 994 C 420 980 600 990 760 1006 C 800 1010 820 1030 790 1040 C 620 1046 420 1046 300 1040 Z"/>
      </g>
      <path d="M 300 994 C 420 980 600 990 760 1006" fill="none" stroke="#C99558" stroke-width="2.5" opacity=".35"/>
      <!-- the person kneeling beside them -->
      <g fill="#140F0A">
        <ellipse cx="420" cy="1090" rx="34" ry="37"/>
        <path d="M 400 1124 C 380 1160 386 1200 396 1240 L 520 1240 C 520 1210 500 1196 470 1192 C 470 1160 462 1136 444 1124 Z"/>
        <path d="M 404 1140 L 330 1060" stroke="#140F0A" stroke-width="26" stroke-linecap="round"/>
      </g>
      <path d="M 446 1124 C 464 1138 472 1160 470 1190" fill="none" stroke="#C99558" stroke-width="2.5" opacity=".35"/>
      <rect x="-200" y="-200" width="1480" height="2320" fill="url(#keyLight)" opacity=".18"/>
    </g>`;

  /* institutional corridor in perspective: ceiling tubes, door, side walls. */
  const corridor=()=>`
    <g>
      <defs><linearGradient id="corG" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#2A2A26"/><stop offset="1" stop-color="#151513"/></linearGradient></defs>
      <rect x="-200" y="-200" width="1480" height="2320" fill="url(#corG)"/>
      <path d="M0 0 L1080 0 L700 560 L380 560 Z" fill="#33322D"/>
      <path d="M0 1920 L1080 1920 L700 1240 L380 1240 Z" fill="#1E1D1A"/>
      <path d="M0 0 L380 560 L380 1240 L0 1920 Z" fill="#26251F"/>
      <path d="M1080 0 L700 560 L700 1240 L1080 1920 Z" fill="#23221D"/>
      <rect x="380" y="560" width="320" height="680" fill="#3A3934"/>
      ${[0,1,2,3].map(i=>{const t=i/4, w=420*(1-t*.8), y=40+t*480;
        return `<rect x="${540-w/2}" y="${y}" width="${w}" height="${18*(1-t*.7)}" rx="4" fill="#F2F3EE" opacity="${.85-t*.4}"/>`;}).join("")}
      <ellipse cx="540" cy="300" rx="520" ry="280" fill="#F2F3EE" opacity=".08" filter="url(#soft40)"/>
      <rect x="470" y="760" width="140" height="480" fill="#24231F"/>
      <rect x="470" y="760" width="140" height="480" fill="none" stroke="#55534B" stroke-width="4"/>
      <circle cx="592" cy="1010" r="6" fill="#9A988E"/>
      <path d="M 120 520 L 120 1500 M 960 520 L 960 1500" stroke="#3E3D37" stroke-width="6"/>
      ${[0,1,2,3,4,5].map(i=>`<line x1="${380-i*70}" y1="${1240+i*112}" x2="${700+i*70}" y2="${1240+i*112}" stroke="#000" stroke-width="2" opacity=".25"/>`).join("")}
    </g>`;

  /* a plain room with five seated silhouettes in a row (group meeting). */
  const groupRoom=()=>`
    <g>
      <rect x="-200" y="-200" width="1480" height="2320" fill="#2B2620"/>
      <rect x="120" y="300" width="840" height="520" rx="6" fill="#3A3229"/>
      <rect x="140" y="320" width="800" height="480" fill="#D9B98A" opacity=".18"/>
      <circle cx="540" cy="560" r="300" fill="#FFE2B0" opacity=".12" filter="url(#soft40)"/>
      <rect x="-200" y="1420" width="1480" height="700" fill="#211C17"/>
      ${[0,1,2,3,4].map(i=>{
        const x=180+i*180;
        return `<g>
          <ellipse cx="${x}" cy="1300" rx="62" ry="12" fill="#000" opacity=".4" filter="url(#soft6)"/>
          <rect x="${x-52}" y="1190" width="104" height="22" rx="8" fill="#4A3B2B"/>
          <rect x="${x-46}" y="1212" width="10" height="90" fill="#3A2E22"/><rect x="${x+36}" y="1212" width="10" height="90" fill="#3A2E22"/>
          <path d="M ${x-38} 1192 C ${x-44} 1110 ${x-36} 1040 ${x-20} 1000 L ${x+20} 1000 C ${x+36} 1040 ${x+44} 1110 ${x+38} 1192 Z" fill="#1B140D"/>
          <circle cx="${x}" cy="966" r="30" fill="#1B140D"/>
          <path d="M ${x+22} 990 C ${x+36} 1040 ${x+42} 1110 ${x+38} 1188" fill="none" stroke="#F4B768" stroke-width="3" opacity=".6" filter="url(#glowF)"/>
        </g>`;
      }).join("")}
    </g>`;

  /* desaturated hospital room: ceiling panel, window blinds, made empty bed. */
  const hospitalRoom=()=>`
    <g>
      <defs>
        <linearGradient id="hWall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#2E2D2A"/><stop offset=".7" stop-color="#22211F"/><stop offset="1" stop-color="#141412"/>
        </linearGradient>
        <linearGradient id="hDay" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#B9BDB8"/><stop offset="1" stop-color="#7E837F"/>
        </linearGradient>
      </defs>
      <rect x="-200" y="-200" width="1480" height="2320" fill="url(#hWall)"/>
      <!-- ceiling panel: flat, sourceless light -->
      <rect x="300" y="120" width="480" height="40" rx="6" fill="#E8EAE4" opacity=".55"/>
      <ellipse cx="540" cy="150" rx="420" ry="160" fill="#E8EAE4" opacity=".08" filter="url(#soft40)"/>
      <!-- window with blinds -->
      <rect x="600" y="340" width="320" height="500" fill="#121211"/>
      <rect x="616" y="356" width="288" height="468" fill="url(#hDay)" opacity=".55"/>
      ${Array.from({length:22},(_,i)=>`<rect x="616" y="${360+i*21}" width="288" height="12" fill="#3A3935" opacity=".85"/>`).join("")}
      <rect x="600" y="340" width="320" height="500" fill="none" stroke="#45443F" stroke-width="10"/>
      <!-- floor -->
      <rect x="-200" y="1400" width="1480" height="720" fill="#151513"/>
      ${Array.from({length:9},(_,i)=>`<line x1="${-60+i*150}" y1="1400" x2="${-260+i*190}" y2="1920" stroke="#000" stroke-width="2" opacity=".3"/>`).join("")}
      <rect x="-200" y="1392" width="1480" height="10" fill="#2C2B28"/>
      <!-- the bed, made, empty -->
      <ellipse cx="520" cy="1404" rx="420" ry="14" fill="#000" opacity=".55" filter="url(#soft6)"/>
      <rect x="150" y="1210" width="740" height="26" rx="6" fill="#3B3A36"/>
      <rect x="170" y="1150" width="700" height="64" rx="18" fill="#5A5953"/>
      <rect x="170" y="1150" width="700" height="4" fill="#8E8C84" opacity=".6"/>
      <path d="M 300 1150 C 420 1128 640 1132 868 1150 L 868 1214 L 300 1214 Z" fill="#4B4A45"/>
      <rect x="190" y="1110" width="150" height="50" rx="20" fill="#6A6962"/>
      <path d="M 150 1236 L 150 1390 M 890 1236 L 890 1390" stroke="#2E2D2A" stroke-width="12"/>
      <circle cx="150" cy="1392" r="10" fill="#1E1D1B"/><circle cx="890" cy="1392" r="10" fill="#1E1D1B"/>
      <path d="M 150 980 L 150 1236" stroke="#3B3A36" stroke-width="14" stroke-linecap="round"/>
      <path d="M 150 1000 L 200 1000" stroke="#3B3A36" stroke-width="10" stroke-linecap="round"/>
    </g>`;

  /* ---------- DATA / DOCUMENTARY ---------- */

  /* 54px measurement grid with heavier every-5th lines (documentary backdrop). */
  const grid=(step=54,color="#1B2534")=>{
    let d="", D="";
    for(let x=0,k=0;x<=1080;x+=step,k++) (k%5? (d+=`M${x} 0 L${x} 1920 `) : (D+=`M${x} 0 L${x} 1920 `));
    for(let y=0,k=0;y<=1920;y+=step,k++) (k%5? (d+=`M0 ${y} L1080 ${y} `) : (D+=`M0 ${y} L1080 ${y} `));
    return `<path d="${d}" stroke="${color}" stroke-width="1" fill="none" opacity="0.5"/>`+
           `<path d="${D}" stroke="#24344A" stroke-width="1.5" fill="none" opacity="0.6"/>`;
  };

  /* corner registration marks for the safe band (makes a plate read as a document). */
  const regMarks=(c="#4E9FDB")=>{
    const m=(x,y,sx,sy)=>`<path d="M${x} ${y+sy*44} L${x} ${y} L${x+sx*44} ${y}" fill="none" stroke="${c}" stroke-width="2" opacity=".55"/>`;
    return m(110,200,1,1)+m(970,200,-1,1)+m(110,1580,1,-1)+m(970,1580,-1,-1);
  };

  /* 10x10 pictogram people (head + shoulders) with class "fig" for EL.crowd(). */
  const crowd=(n=100,cols=10,x0=216,y0=868,gapX=72,gapY=72,seed=41)=>{
    let out="";
    for(let i=0;i<n;i++){
      const cx=x0+(i%cols)*gapX, cy=y0+Math.floor(i/cols)*gapY;
      /* a pictogram, head + shoulders: reads as a PERSON at 40px, where a pill
         shape reads as a bar chart */
      out+=`<g class="fig" data-i="${i}" opacity="0.2">
        <circle cx="${cx}" cy="${cy-15}" r="11" fill="#2A323E"/>
        <path d="M${cx-18} ${cy+26} L${cx-18} ${cy+8} Q${cx-18} ${cy-2} ${cx-7} ${cy-2} L${cx+7} ${cy-2}
                 Q${cx+18} ${cy-2} ${cx+18} ${cy+8} L${cx+18} ${cy+26} Z" fill="#2A323E"/>
      </g>`;
    }
    return out;
  };

  /* grid of dots (class "dot") for counts / unit visualisations. */
  const dotField=(cols=22,rows=26,x0=170,y0=520,gapX=34,gapY=34)=>{
    let out="";
    for(let i=0;i<cols*rows;i++){
      const cx=x0+(i%cols)*gapX, cy=y0+Math.floor(i/cols)*gapY;
      out+=`<circle class="dot" data-i="${i}" cx="${cx}" cy="${cy}" r="6.5" fill="#2A323E" opacity="0"/>`;
    }
    return out;
  };

  /* returns an SVG path d: a heart trace with three bursts, then flat. Draw it on with molDraw. */
  const flatline=(y=980,w=1080)=>{
    let d=`M0 ${y} `;
    const r=EL.rng(19);
    for(let x=0;x<w;x+=8){
      const spike=(x>300&&x<372)||(x>470&&x<500)||(x>640&&x<676)
        ? (r()*2-1)*150 : 0;
      d+=`L${x} ${(y+spike).toFixed(1)} `;
    }
    d+=`L${w} ${y}`;
    return d;
  };

  /* tally: four strokes + a fifth across, class "tick" for EL.ticks() (pen-stroke draw). */
  const fiveTicks=(x=760,y=1120)=>
    Array.from({length:5},(_,i)=>{
      const d = i<4 ? `M${x+i*40} ${y-46} L${x+i*40+4} ${y+46}`
                    : `M${x-26} ${y+30} L${x+148} ${y-30}`;
      return `<path class="tick" data-i="${i}" d="${d}"
             stroke="#E8605B" stroke-width="9" stroke-linecap="round"
             filter="url(#glowF)" opacity="0"/>`;
    }).join("");

  /* a calendar page with one day boxed. */
  const oneDay=()=>`
    <g>
      <rect x="330" y="820" width="420" height="560" rx="14"
            fill="#171310" stroke="#4A3A22" stroke-width="3"/>
      <rect x="330" y="820" width="420" height="86" fill="#241C13"/>
      ${Array.from({length:4},(_,i)=>
        Array.from({length:7},(_,j)=>
          `<rect x="${356+j*54}" y="${940+i*98}" width="42" height="82" rx="6"
                 fill="#1F1A14"/>`).join("")).join("")}
      <rect x="410" y="1038" width="42" height="82" rx="6"
            fill="none" stroke="#E0A458" stroke-width="4"/>
    </g>`;



  /* ---------- STYLE KIT — building blocks for ANY look ----------
     The scenes above are one art direction (lit flat vector). These are
     primitives for others: paper cut-out, blueprint, ink, isometric, neon,
     3D-lit forms, organic shapes. Combine them; invent new ones. */

  /* organic closed shape (cells, clouds, stones, splats). returns path d */
  const blob=(cx,cy,r,seed=1,points=9,wobble=.22)=>{
    const rnd=EL.rng(seed), pts=[];
    for(let i=0;i<points;i++){ const a=i/points*Math.PI*2, k=1+(rnd()*2-1)*wobble;
      pts.push([cx+Math.cos(a)*r*k, cy+Math.sin(a)*r*k]); }
    let d=`M${((pts[0][0]+pts[points-1][0])/2).toFixed(1)} ${((pts[0][1]+pts[points-1][1])/2).toFixed(1)}`;
    for(let i=0;i<points;i++){ const p=pts[i], q=pts[(i+1)%points];
      d+=` Q${p[0].toFixed(1)} ${p[1].toFixed(1)} ${((p[0]+q[0])/2).toFixed(1)} ${((p[1]+q[1])/2).toFixed(1)}`; }
    return d+"Z";
  };

  /* sine wave across a width. returns path d (open). close it yourself for a fill */
  const wave=(y,amp=30,len=240,phase=0,x0=0,x1=1080,step=8)=>{
    let d=`M${x0} ${(y+Math.sin(phase)*amp).toFixed(1)}`;
    for(let x=x0+step;x<=x1;x+=step) d+=` L${x} ${(y+Math.sin(phase+(x-x0)/len*Math.PI*2)*amp).toFixed(1)}`;
    return d;
  };

  /* an isometric box with three shaded faces. (x,y) = bottom-front corner */
  const isoBox=(x,y,w,dp,h,top="#7FB2E5",left="#3E6C9C",right="#2A4D73",stroke="none")=>{
    const c=Math.cos(Math.PI/6), s=Math.sin(Math.PI/6);
    const P=(u,v,z)=>[x+(u-v)*c, y-(u+v)*s-z];
    const f=pts=>pts.map(p=>p.map(n=>n.toFixed(1)).join(" ")).join(" L");
    const A=P(0,0,0),B=P(w,0,0),C=P(w,dp,0),D=P(0,dp,0),A2=P(0,0,h),B2=P(w,0,h),C2=P(w,dp,h),D2=P(0,dp,h);
    return `<g stroke="${stroke}" stroke-linejoin="round">
      <path d="M${f([A,D,D2,A2])}Z" fill="${left}"/>
      <path d="M${f([A,B,B2,A2])}Z" fill="${right}"/>
      <path d="M${f([A2,B2,C2,D2])}Z" fill="${top}"/></g>`;
  };

  /* a lit 3D sphere: radial-gradient body, specular hotspot, contact shadow.
     id must be unique per sphere (gradients live in the SVG) */
  const sphere=(cx,cy,r,id,light="#FFE2B0",mid="#E0A458",dark="#3A2410")=>`
    <defs><radialGradient id="${id}" cx="0.35" cy="0.3" r="0.8">
      <stop offset="0" stop-color="${light}"/><stop offset=".45" stop-color="${mid}"/><stop offset="1" stop-color="${dark}"/>
    </radialGradient></defs>
    <ellipse cx="${cx+r*.15}" cy="${cy+r*1.02}" rx="${r*.9}" ry="${r*.18}" fill="#000" opacity=".45" filter="url(#soft6)"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${id})"/>
    <ellipse cx="${cx-r*.35}" cy="${cy-r*.4}" rx="${r*.22}" ry="${r*.14}" fill="#fff" opacity=".55" filter="url(#soft2)"/>`;

  /* a field of particles (dust, stars, cells, data points). class "pt" for staggering */
  const particles=(n=60,seed=5,x0=110,y0=180,w=860,h=1420,color="#F4F7FB",rmin=1.5,rmax=4)=>{
    const rnd=EL.rng(seed); let o="";
    for(let i=0;i<n;i++) o+=`<circle class="pt" cx="${(x0+rnd()*w).toFixed(1)}" cy="${(y0+rnd()*h).toFixed(1)}" r="${(rmin+rnd()*(rmax-rmin)).toFixed(1)}" fill="${color}" opacity="${(.25+rnd()*.6).toFixed(2)}"/>`;
    return o;
  };

  /* cut-paper landscape: stacked ridge layers, each floating on a soft shadow,
     with a paper-fibre texture. colours from back to front */
  const paperLayers=(colors=["#E8D9C0","#D9B98E","#C08A5A","#8E5A3A","#5C3A28"],seed=4,top=900,bottom=1920,w=1080,gap=150,amp=160)=>{
    let o=`<rect width="${w}" height="${bottom}" fill="${colors[0]}"/>`;
    colors.slice(1).forEach((c,i)=>{
      o+=`<path d="${EL.plane(seed+i*7, top+i*gap, amp*(1-i*.08), bottom, w, 7)}" fill="${c}" filter="url(#paperShadow)"/>`;
    });
    return o+`<rect width="${w}" height="${bottom}" filter="url(#paperTex)" opacity=".5" style="mix-blend-mode:multiply"/>`;
  };

  /* blueprint sheet: deep blue, fine grid, a title block. draw white line art on top */
  const blueprintSheet=(x=0,y=0,w=1080,h=1920,title="DRAWING NO. 01")=>`
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#0F3A66"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#blueprintGrid)"/>
    <rect x="${x+24}" y="${y+24}" width="${w-48}" height="${h-48}" fill="none" stroke="#CFE6FA" stroke-width="2" opacity=".6"/>
    <text x="${x+w-40}" y="${y+h-40}" fill="#CFE6FA" opacity=".7" font-family="JetBrains Mono,monospace" font-size="22" letter-spacing="4" text-anchor="end">${title}</text>`;

  /* an ink stroke: any path d drawn with a wobbly hand-made edge */
  const ink=(d,color="#1B1A17",width=5,extra="")=>
    `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" filter="url(#rough)" ${extra}/>`;

  /* a neon line: any path d as a glowing tube */
  const neon=(d,color="#5CF2FF",width=6,extra="")=>
    `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" filter="url(#neon)" ${extra}/>`;

  return {
    /* gradients + filters (injectDefs puts them in the page) */
    warmRoom, keyLight, coldField, shaft, haze, support,
    /* scenes & figures (warm "story" register) */
    figure, figureStanding, room, roomWall, roomWindow, roomFurniture, SEAT,
    bench, benchDay, sofaScene, corridor, groupRoom, hospitalRoom, oneDay,
    /* data / documentary register */
    grid, regMarks, crowd, dotField, flatline, fiveTicks,
    /* style kit: primitives for any look */
    blob, wave, isoBox, sphere, particles, paperLayers, blueprintSheet, ink, neon
  };
})();

/* ---------- shared art injection ----------
   Each beat declares the gradients it needs by name. All artwork SVG
   lives in defs.js so the two molecules are provably the same symbols
   wherever they appear. */
function injectDefs(grads=[]){
  const need=["warmRoom","keyLight","coldField","shaft","haze"];
  const all=[...new Set([...need,...grads])];
  const map={warmRoom:ART.warmRoom,keyLight:ART.keyLight,coldField:ART.coldField,
             shaft:ART.shaft,haze:ART.haze};
  const svg=`<svg id="defs" width="0" height="0" aria-hidden="true"
      style="position:absolute"><defs>${all.map(g=>map[g](g)).join("")}${ART.support()}</defs></svg>`;
  const old=document.getElementById("defs");
  if(old) old.remove();
  document.body.insertAdjacentHTML("afterbegin", svg);
}

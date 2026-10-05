/* Render one part to MP4 (1080x1920, H.264 + AAC), frame-exact.
   Each shot page is loaded once and SEEKED to k/fps for every frame (CSS
   animations via the Web Animations API, GSAP via M.seek), so frames never
   drop and picture and audio cannot drift.

   usage (run from the project's motion folder):
     node render.mjs [part=1] [fps=30] [out=video-part<part>.mp4] [audio=VO/part<part>.mp3]
   No audio file? It renders with silence (good for previews).
   Needs ffmpeg on PATH and Playwright (require('playwright'), or env PWC=<playwright-core path>,
   optional EXE=<chromium executable>). */
import { createRequire } from 'module';
import { spawn } from 'child_process';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { resolve } from 'path';
const require = createRequire(import.meta.url);
let pw; try { pw = require(process.env.PWC || 'playwright'); } catch { pw = require('playwright-core'); }

const part = +(process.argv[2] || 1), fps = +(process.argv[3] || 30);
const out = resolve(process.argv[4] || `video-part${part}.mp4`);
const audio = process.argv[5] || `VO/part${part}.mp3`;
const shots = readdirSync('.').filter(f => new RegExp(`^p${part}-s\\d\\d\\.html$`).test(f)).sort()
  .map(f => { const h = readFileSync(f, 'utf8');
    return { f, off: +h.match(/data-offset="([\d.]+)"/)[1], dur: +h.match(/data-dur="([\d.]+)"/)[1] }; });
if (!shots.length) { console.error(`no p${part}-sNN.html files here`); process.exit(1); }
const total = shots.reduce((a, s) => a + s.dur, 0), frames = Math.round(total * fps);
const hasAudio = existsSync(audio);
console.log(`part ${part}: ${shots.length} shots, ${total.toFixed(2)}s, ${frames} frames @ ${fps}fps, audio: ${hasAudio ? audio : 'silent'} -> ${out}`);

const ffArgs = ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-'];
if (hasAudio) ffArgs.push('-i', audio); else ffArgs.push('-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo');
ffArgs.push('-filter_complex', `[1:a]apad,atrim=0:${total.toFixed(3)}[a]`, '-map', '0:v', '-map', '[a]',
  '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p',
  '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', out);
const ff = spawn('ffmpeg', ffArgs, { stdio: ['pipe', 'inherit', 'inherit'] });

const browser = await pw.chromium.launch({ headless: true, executablePath: process.env.EXE || undefined });
const ctx = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
let k = 0;
for (const s of shots) {
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', e => errs.push(String(e)));
  await page.goto('file://' + resolve(s.f), { waitUntil: 'load' });
  await page.evaluate(async () => { await document.fonts.ready;
    const st = document.querySelector('#stage'), w = document.querySelector('#wrap');
    st.style.transform = 'none'; w.style.width = '1080px'; w.style.height = '1920px';
    document.querySelector('#ui').style.display = 'none';
    const l = document.querySelector('.legend'); if (l) l.style.display = 'none';
    Object.assign(document.body.style, { padding: '0', margin: '0', display: 'block', background: '#000' });
    document.body.classList.add('playing'); });
  await page.waitForTimeout(300);
  const end = s.off + s.dur;
  while (k < frames && k / fps < end - 1e-9) {
    const t = k / fps - s.off;
    await page.evaluate(t => { for (const a of document.getAnimations()) { a.pause(); a.currentTime = t * 1000; }
      if (window.M && M.seek) M.seek(t); if (typeof render === 'function') render(t); }, t);
    const buf = await page.screenshot({ type: 'jpeg', quality: 93, clip: { x: 0, y: 0, width: 1080, height: 1920 } });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    k++;
  }
  console.log(`  ${s.f}  ${s.dur}s  -> frame ${k}${errs.length ? '  ERR ' + errs.join(' | ') : ''}`);
  await page.close();
}
await browser.close(); ff.stdin.end();
await new Promise(r => ff.on('close', r));
console.log('done', out);

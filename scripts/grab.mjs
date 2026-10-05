/* Screenshot shots at exact times (for review). Seeks animations; no realtime play.
   usage: node grab.mjs <outDir> "p1-s01.html:1.5,4,7.2" "p1-s02.html:2" ...
   Playwright: uses require('playwright') or env PWC=<path to playwright-core>; EXE = optional chromium path. */
import { createRequire } from 'module';
import { mkdirSync } from 'fs';
import { resolve } from 'path';
const require = createRequire(import.meta.url);
let pw; try { pw = require(process.env.PWC || 'playwright'); } catch { pw = require('playwright-core'); }
const out = process.argv[2]; mkdirSync(out, { recursive: true });
const b = await pw.chromium.launch({ headless: true, executablePath: process.env.EXE || undefined });
const ctx = await b.newContext({ viewport: { width: 1080, height: 1920 } });
for (const job of process.argv.slice(3)) {
  const [f, ts] = job.split(':');
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e).slice(0, 160)));
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)); });
  await p.goto('file://' + resolve(f), { waitUntil: 'load' });
  await p.evaluate(async () => { await document.fonts.ready;
    const s = document.querySelector('#stage'), w = document.querySelector('#wrap');
    s.style.transform = 'none'; w.style.width = '1080px'; w.style.height = '1920px';
    document.querySelector('#ui').style.display = 'none';
    const l = document.querySelector('.legend'); if (l) l.style.display = 'none';
    Object.assign(document.body.style, { padding: '0', margin: '0', display: 'block' });
    document.body.classList.add('playing'); });
  await p.waitForTimeout(300);
  for (const t of ts.split(',').map(Number)) {
    await p.evaluate(t => { /* render first: per-frame ticks may create animations (lazy annotations), then seek them all */
      if (typeof render === 'function') render(t); else if (window.M && M.seek) M.seek(t);
      for (const a of document.getAnimations()) { a.pause(); a.currentTime = t * 1000; } }, t);
    await p.waitForTimeout(80);
    await p.screenshot({ path: `${out}/${f.replace(/.*\//, '').replace('.html', '')}_${t}.png`, clip: { x: 0, y: 0, width: 1080, height: 1920 } });
  }
  console.log(f, errs.length ? 'ERRORS: ' + errs.join(' | ') : 'ok');
  await p.close();
}
await b.close();

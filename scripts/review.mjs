/* One-command review pass: screenshot every shot at 30% / 60% / 95% of its
   duration and build contact sheets. usage: node review.mjs <outDir> [part=1]
   Then OPEN THE SHEETS AND LOOK. Fix, rebuild, repeat. */
import { readdirSync, readFileSync, mkdirSync } from 'fs';
import { execFileSync } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
const HERE = dirname(fileURLToPath(import.meta.url));
const out = process.argv[2] || 'review'; const part = process.argv[3] || '1';
mkdirSync(out, { recursive: true });
const shots = readdirSync('.').filter(f => new RegExp(`^p${part}-s\\d\\d\\.html$`).test(f)).sort();
const jobs = shots.map(f => { const d = +readFileSync(f, 'utf8').match(/data-dur="([\d.]+)"/)[1];
  return `${f}:${[.3, .6, .95].map(k => (d * k).toFixed(2)).join(',')}`; });
execFileSync('node', [join(HERE, 'grab.mjs'), out, ...jobs], { stdio: 'inherit' });
const pngs = readdirSync(out).filter(f => f.endsWith('.png') && !f.startsWith('sheet')).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
for (let i = 0; i < pngs.length; i += 12)
  execFileSync('python3', [join(HERE, 'contact_sheet.py'), join(out, `sheet-${String(i / 12 + 1).padStart(2, '0')}.png`),
    ...pngs.slice(i, i + 12).map(p => join(out, p))], { stdio: 'inherit' });

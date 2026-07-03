#!/usr/bin/env node
// ─── scene-concepts.mjs — lore SCENE concepts via create-image-pixflux (text → pixel art).
// One-off concept exploration for the Carved Stones lore (docs/RINGWARD-LORE-BIBLE.md):
// four key beats of the deep past, as candidate art for stone reveals / Chronicle / waysides.
// Sync endpoint, ~73s/call on Tier 1, 1 generation each. Run: node scene-concepts.mjs --go
// Writes PNGs to the dir given by --out (default /tmp/rw-scenes). NOT wired into the game.

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { BASE, loadKey, authHeaders } from './pixellab.mjs';

const STYLE = 'dark folk-fantasy pixel art, painterly dither, muted earth tones on near-black, single strong light source, quiet and melancholy, no text';

const SCENES = [
  {
    id: 'gardens-before',
    // The Rim-Stone: "We set this stone when the rings were gardens."
    description: `${STYLE}. Wide view of eight concentric ring-shaped garden terraces seen from a hill at the rim, lush green and amber crops, small round earthen creatures with softly glowing chest-cores tending plants beside robed gardeners, warm golden light pooling toward a small bright white doorway glow at the very center of the rings`,
  },
  {
    id: 'growing-the-keepers',
    // The Garden-Stone: "Here we grew the first keepers."
    description: `${STYLE}. Close scene in an overgrown green hollow: a half-grown round earthen creature emerging from tilled soil like a planted bulb, its chest-core glowing warm amber, two weathered hands cupped protectively around it, too-bright green leaves, soft floating spores of light`,
  },
  {
    id: 'wire-stone-promise',
    // The Wire-Stone: "The current must not stop."
    description: `${STYLE}. A line of old leaning power pylons marching inward across dark scrubland at dusk, their wires faintly glowing pale blue against the gloom, one weathered carved standing stone in the foreground with moss, wind-bent grass, lonely kept-promise mood`,
  },
  {
    id: 'door-not-pit',
    // Frostbound / the Drop: "not a pit but a doorway, light spilling up out of the dark."
    description: `${STYLE}. At the frozen center of the last ring, a tall rectangular doorway of soft white-violet light standing open in dark ground, light spilling upward like slow water, one small cloaked handler figure with three tiny glowing cores at the chest standing before it, snowflakes hanging motionless in the air`,
  },
];

const go = process.argv.includes('--go');
const outDir = (() => { const i = process.argv.indexOf('--out'); return i >= 0 ? process.argv[i + 1] : '/tmp/rw-scenes'; })();
if (!go) { console.log('Dry run — 4 scenes, ~1 generation each. Add --go to spend.'); SCENES.forEach((s) => console.log(`  ${s.id}: ${s.description.slice(0, 90)}…`)); process.exit(0); }

const key = loadKey();
mkdirSync(outDir, { recursive: true });
for (const s of SCENES) {
  const t0 = Date.now();
  process.stdout.write(`→ ${s.id} … `);
  const res = await fetch(`${BASE}/create-image-pixflux`, {
    method: 'POST', headers: authHeaders(key),
    body: JSON.stringify({ description: s.description, image_size: { width: 400, height: 260 } }),
    signal: AbortSignal.timeout(300000), // it's slow, not hung (NOTES §3)
  });
  if (!res.ok) { console.log(`FAILED ${res.status}: ${(await res.text()).slice(0, 200)}`); continue; }
  const data = await res.json();
  const b64 = (data.image?.base64 || '').replace(/^data:image\/\w+;base64,/, '');
  if (!b64) { console.log(`no image in response: ${JSON.stringify(data).slice(0, 150)}`); continue; }
  const file = join(outDir, `${s.id}.png`);
  writeFileSync(file, Buffer.from(b64, 'base64'));
  console.log(`saved ${file} (${Math.round((Date.now() - t0) / 1000)}s, usage: ${JSON.stringify(data.usage || {})})`);
}
console.log('DONE');

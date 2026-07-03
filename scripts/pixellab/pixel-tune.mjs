#!/usr/bin/env node
// Pixel look tuning + evolution sweep — LOCAL ONLY, spends credits with --go.
//
// Two goals:
//  A) CRISP PIXEL ART: pixflux + init_image at strengths 300/450/600
//     Lower strength → description + model's own pixel-art aesthetic dominate
//     Higher strength (850 shown previously) → stays semi-painterly
//  B) EVOLUTION: pixflux at low strengths 150/200 → diverge enough for "evolved form"
//     s400 was too faithful; sweeping lower here
//
// Calls are sync pixflux (~180-300s each on Tier 1). Run in series to avoid chaos.
// DRY RUN by default; arm with --go. Each call = 1 credit.

import { BASE, loadKey, authHeaders, imageObject, saveAssets } from '/Users/sky/8gents/scripts/pixellab/pixellab.mjs';
import { join } from 'node:path';
import { mkdirSync } from 'node:fs';

const ARMED = process.argv.includes('--go');
const key = loadKey();
if (!key) { console.error('no key — set PIXELLAB_API_KEY or add to scripts/pixellab/.env'); process.exit(1); }

const SOURCE = 'public/sprites/cinderpaw.jpg';

// Pixel art description: lean into crisp pixels, hard edges, limited palette
// The lower the strength the more this description drives the output
const PIXEL_DESC =
  'fiery volcanic rock-cat creature with big black eyes and glowing molten chest, ' +
  'crisp pixel art game sprite, chunky hard-edged pixels, limited 16-color palette, ' +
  'NES-era sprite style, clean silhouette, no anti-aliasing, dark background';

// Evolution: bigger fiercer evolved form — low strength so it genuinely diverges
const EVO_DESC =
  'a much larger and more powerful evolved form of a small fiery rock-cat creature, ' +
  'heavier jagged stone-plated armor, intense glowing molten cracks across entire body, ' +
  'blazing ember mane, fierce predatory stance, fearsome glowing eyes, ' +
  'crisp pixel art game sprite, dark background';

const JOBS = [
  // --- A: pixel art look, 96px, 3 strengths ---
  { label: 'pixel_s300', desc: PIXEL_DESC, size: 96,  strength: 300, out: 'public/art/creatures/cinderpaw/pixel_96/s300' },
  { label: 'pixel_s450', desc: PIXEL_DESC, size: 96,  strength: 450, out: 'public/art/creatures/cinderpaw/pixel_96/s450' },
  { label: 'pixel_s600', desc: PIXEL_DESC, size: 96,  strength: 600, out: 'public/art/creatures/cinderpaw/pixel_96/s600' },
  // --- B: evolution, 128px, 2 low strengths ---
  { label: 'evo_s150',   desc: EVO_DESC,  size: 128, strength: 150, out: 'public/art/creatures/cinderpaw/evolved/s150' },
  { label: 'evo_s200',   desc: EVO_DESC,  size: 128, strength: 200, out: 'public/art/creatures/cinderpaw/evolved/s200' },
];

if (!ARMED) {
  console.log('DRY RUN — would run (5 pixflux calls, 5 credits, ~180-300s each):');
  for (const j of JOBS) {
    console.log(`  ${j.label}: strength=${j.strength}, size=${j.size}px → ${j.out}`);
  }
  console.log('\nRe-run with --go to generate. Runs in series, expect ~20-30 min total.');
  process.exit(0);
}

// Series: pixflux is slow, parallel would just pile up queue time
for (const j of JOBS) {
  console.log(`\n→ ${j.label} (strength=${j.strength}, ${j.size}px)…`);
  const t0 = Date.now();
  try {
    const body = {
      description: j.desc,
      image_size: { width: j.size, height: j.size },
      init_image: imageObject(SOURCE, j.size),
      init_image_strength: j.strength,
    };
    const res = await fetch(`${BASE}/create-image-pixflux`, {
      method: 'POST',
      headers: authHeaders(key),
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      console.error(`  ✗ HTTP ${res.status}: ${await res.text()}`);
      continue;
    }
    const data = await res.json();
    mkdirSync(join('/Users/sky/8gents', j.out), { recursive: true });
    const n = await saveAssets(data, join('/Users/sky/8gents', j.out));
    const s = Math.round((Date.now() - t0) / 1000);
    console.log(`  ✓ ${n} image(s) saved → ${j.out}  (${s}s)`);
  } catch (e) {
    console.error(`  ✗ ${j.label}: ${e.message}`);
  }
}

console.log('\nAll done. Now run the montage command to compare:');
console.log('  node scripts/pixellab/make-compare.mjs');

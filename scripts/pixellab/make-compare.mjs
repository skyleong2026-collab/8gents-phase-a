#!/usr/bin/env node
// Build two PNG contact sheets for Sky to review on iPad:
//   1. LOOK-COMPARE.png  — painterly (v3) vs crisp-pixel at 3 strengths side by side
//   2. EVOLUTION.png     — base → evo_s150 → evo_s200 → evo_s400 (too-faithful baseline)
//
// Uses ImageMagick `montage`. Run AFTER pixel-tune.mjs completes.

import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = '/Users/sky/8gents';
const OUT  = join(ROOT, 'public/art/creatures/_previews');
const ART  = join(ROOT, 'public/art/creatures/cinderpaw');
const SRC  = join(ROOT, 'public/sprites/cinderpaw.jpg');

function exists(p) { return existsSync(p); }
function abortIfMissing(paths, label) {
  const missing = paths.filter(p => !exists(p));
  if (missing.length) { console.warn(`SKIP ${label} — missing:\n  ${missing.join('\n  ')}`); return true; }
  return false;
}

// ─── 1. LOOK COMPARE ─────────────────────────────────────────────────────────
// Row headers (left), then 6 images across:
//   source | v3-painterly | s300 | s450 | s600 | prev-s850 (native_pixel)
const lookImages = [
  SRC,
  join(ART, 'idle_v3/frame_02.png'),
  join(ART, 'pixel_96/s300/frame_00.png'),
  join(ART, 'pixel_96/s450/frame_00.png'),
  join(ART, 'pixel_96/s600/frame_00.png'),
  join(ART, 'native_pixel/px96/frame_00.png'),
];

const lookLabels = ['SOURCE', 'v3-painterly', 'pxflux-s300', 'pxflux-s450', 'pxflux-s600', 'pxflux-s850(old)'];

if (!abortIfMissing(lookImages, 'LOOK-COMPARE')) {
  const tileArgs = lookImages.map((p, i) => `-label "${lookLabels[i]}" "${p}"`).join(' ');
  const out = join(OUT, 'LOOK-COMPARE.png');
  const cmd = `magick montage ${tileArgs} -tile 6x1 -geometry 192x192+8+8 -background "#1a1a1a" -fill white -font Helvetica -pointsize 14 "${out}"`;
  console.log('→ building LOOK-COMPARE.png…');
  execSync(cmd, { cwd: ROOT });
  console.log(`✓ ${out}`);
}

// ─── 2. EVOLUTION ────────────────────────────────────────────────────────────
const evoImages = [
  SRC,
  join(ART, 'evolved/s150/frame_00.png'),
  join(ART, 'evolved/s200/frame_00.png'),
  join(ART, 'evolved/s400/frame_00.png'),
];
const evoLabels = ['BASE', 'evo-s150', 'evo-s200', 'evo-s400(old)'];

if (!abortIfMissing(evoImages, 'EVOLUTION')) {
  const tileArgs = evoImages.map((p, i) => `-label "${evoLabels[i]}" "${p}"`).join(' ');
  const out = join(OUT, 'EVOLUTION.png');
  const cmd = `magick montage ${tileArgs} -tile 4x1 -geometry 256x256+8+8 -background "#1a1a1a" -fill white -font Helvetica -pointsize 14 "${out}"`;
  console.log('→ building EVOLUTION.png…');
  execSync(cmd, { cwd: ROOT });
  console.log(`✓ ${out}`);
}

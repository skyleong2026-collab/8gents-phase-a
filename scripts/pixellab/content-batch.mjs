#!/usr/bin/env node
// MULTI-TEST content batch (local-only, spends generations — guarded by --go).
// Tests several capabilities in one run while producing usable content:
//   1. EVOLUTION  — can PixelLab morph a character into a stronger "evolved" form
//      (Charmander→Charizard)? Uses /create-image-pixflux with init_image +
//      init_image_strength as the resemblance dial. 3 strengths to see the spectrum.
//   2. NATIVE PIXEL SIZE — animate Cinderpaw at 128px (vs our 256px) to compare a
//      chunkier native look + frames-per-request, via animate-with-text-v3.
//   3. NEW STATES — death (Cinderpaw) + idle (Hexmoth, Frostwarden): real kit content.
import { BASE, loadKey, authHeaders, imageObject, awaitJob, saveAssets } from './pixellab.mjs';
import { join } from 'node:path';

const ARMED = process.argv.includes('--go');
const key = loadKey();
if (!key) { console.error('no key'); process.exit(1); }

// rich evolution prompt — describe the EVOLVED form, lean on the init image for identity
const EVO_DESC = 'a much larger and more powerful evolved form of a small fiery rock-cat creature, '
  + 'heavier jagged stone-plated armor, intense glowing molten cracks, blazing ember mane, fierce predatory stance';

// async v3 animation job spec
const V3 = (creature, image, action, size) => ({ kind: 'v3', creature, image, action, size });
// sync pixflux evolution spec
const EVO = (strength) => ({ kind: 'evo', creature: 'cinderpaw', image: 'public/sprites/cinderpaw.jpg', strength });

const JOBS = [
  EVO(250), EVO(500), EVO(750),                                   // 1. evolution spectrum (3 imgs)
  V3('cinderpaw', 'public/sprites/cinderpaw.jpg', 'attack', 128), // 2. native 128px pixel anim
  V3('cinderpaw', 'public/sprites/cinderpaw.jpg', 'death', 256),  // 3a. new state: death
  V3('hexmoth',   'public/sprites/hexmoth.jpg',   'idle', 256),   // 3b. hexmoth idle
  V3('frostwarden','public/sprites/frostwarden.jpg','idle', 256), // 3c. frostwarden idle
];

if (!ARMED) {
  console.log('DRY RUN — would run:');
  for (const j of JOBS) console.log(j.kind === 'evo'
    ? `  EVOLVE cinderpaw @ init_strength ${j.strength}`
    : `  ANIM ${j.creature}/${j.action} @ ${j.size}px (v3)`);
  process.exit(0);
}

// submit everything; evo (pixflux) is sync → resolves now, v3 → returns a job id to poll
const pending = [];
for (const j of JOBS) {
  if (j.kind === 'evo') {
    const body = { description: EVO_DESC, image_size: { width: 128, height: 128 },
      init_image: imageObject(j.image, 128), init_image_strength: j.strength };
    const res = await fetch(`${BASE}/create-image-pixflux`, { method: 'POST', headers: authHeaders(key), body: JSON.stringify(body) });
    if (!res.ok) { console.error(`✗ evolve@${j.strength}: HTTP ${res.status} ${await res.text()}`); continue; }
    const data = await res.json();
    const n = await saveAssets(data, join('public', 'art', 'creatures', 'cinderpaw', 'evolved', `s${String(j.strength).replace('.', '')}`));
    console.log(`✓ EVOLVE @${j.strength}: saved ${n} (sync)`);
  } else {
    const body = { first_frame: imageObject(j.image, j.size), action: j.action, frame_count: 4 };
    const res = await fetch(`${BASE}/animate-with-text-v3`, { method: 'POST', headers: authHeaders(key), body: JSON.stringify(body) });
    if (!res.ok) { console.error(`✗ ${j.creature}/${j.action}@${j.size}: HTTP ${res.status} ${await res.text()}`); continue; }
    const { background_job_id, id } = await res.json();
    pending.push({ ...j, jobId: background_job_id || id });
    console.log(`✓ submitted ${j.creature}/${j.action}@${j.size} → ${(background_job_id || id).slice(0, 8)}`);
  }
}

// poll the async animation jobs concurrently
const results = await Promise.allSettled(pending.map(async (j) => {
  const done = await awaitJob(key, j.jobId);
  const outDir = join('public', 'art', 'creatures', j.creature, `${j.action}_${j.size}`);
  const n = await saveAssets(done, outDir);
  console.log(`✓ ${j.creature}/${j.action}@${j.size}: saved ${n} → ${outDir}`);
  return j;
}));
const ok = results.filter((r) => r.status === 'fulfilled').length;
console.log(`\nDONE: ${ok}/${pending.length} animations + evolution images saved.`);
for (const r of results) if (r.status === 'rejected') console.error('  ✗', r.reason?.message || r.reason);

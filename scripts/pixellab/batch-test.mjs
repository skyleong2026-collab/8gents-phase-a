#!/usr/bin/env node
// CAPABILITY TEST (local-only, spends credits — guarded by --go). Proves the v3 faithful
// recipe GENERALISES: same recipe, visually-different creatures + multiple actions.
// Submits every job up front, then polls them together (the v3 queue is slow — we wait
// through it ONCE instead of once per job). Reuses the proven helpers from pixellab.mjs.
import { BASE, loadKey, authHeaders, imageObject, awaitJob, saveAssets } from './pixellab.mjs';
import { join } from 'node:path';

const ARMED = process.argv.includes('--go');
const FRAMES = 4; // v3 enforces frame_count >= 4 (422 below that). Cost = per frame.

// matrix: maximally-contrasting silhouettes (round cat / winged moth / hulking golem)
// + action variety on the known-good creature.
const JOBS = [
  { creature: 'hexmoth',    image: 'public/sprites/hexmoth.jpg',    action: 'attack' }, // wings: fine detail + symmetry
  { creature: 'frostwarden', image: 'public/sprites/frostwarden.jpg', action: 'attack' }, // big slow hulk
  { creature: 'cinderpaw',  image: 'public/sprites/cinderpaw.jpg',   action: 'idle'   }, // action variety…
  { creature: 'cinderpaw',  image: 'public/sprites/cinderpaw.jpg',   action: 'hurt'   }, // …on the proven one
];

const key = loadKey();
if (!key) { console.error('no key'); process.exit(1); }

console.log(`— capability batch — ${JOBS.length} jobs × ${FRAMES} frames = ~${JOBS.length * FRAMES} generations`);
if (!ARMED) {
  console.log('DRY RUN — would submit:');
  for (const j of JOBS) console.log(`  ${j.creature}/${j.action}  ← ${j.image}`);
  console.log('Re-run with --go to actually generate.');
  process.exit(0);
}

// 1) submit all (sequential build so each base64 is captured before the shared tmp is reused)
const submitted = [];
for (const j of JOBS) {
  const body = { first_frame: imageObject(j.image, 256), action: j.action, frame_count: FRAMES };
  const res = await fetch(`${BASE}/animate-with-text-v3`, { method: 'POST', headers: authHeaders(key), body: JSON.stringify(body) });
  if (!res.ok) { console.error(`✗ submit ${j.creature}/${j.action}: HTTP ${res.status} ${await res.text()}`); continue; }
  const { background_job_id, id } = await res.json();
  const jobId = background_job_id || id;
  submitted.push({ ...j, jobId });
  console.log(`✓ submitted ${j.creature}/${j.action} → ${jobId.slice(0, 8)}`);
}

// 2) poll all concurrently, save as each lands
const results = await Promise.allSettled(submitted.map(async (j) => {
  const done = await awaitJob(key, j.jobId);
  const outDir = join('public', 'art', 'creatures', j.creature, `${j.action}_v3`);
  const n = await saveAssets(done, outDir);
  console.log(`✓ ${j.creature}/${j.action}: saved ${n} → ${outDir}`);
  return { ...j, n };
}));

const ok = results.filter((r) => r.status === 'fulfilled');
console.log(`\nDONE: ${ok.length}/${submitted.length} jobs saved.`);
for (const r of results) if (r.status === 'rejected') console.error('  ✗', r.reason?.message || r.reason);

#!/usr/bin/env node
// One-shot: generate painterly idle for the agent (v3, 4 frames @ 256px).
// Run from ~/8gents. Add --go to actually spend gens.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
const BASE = 'https://api.pixellab.ai/v2';
const LOCKED = join(ROOT, 'art', 'agent-locked.png');
const OUT = join(ROOT, 'public', 'art', 'agent', 'idle-painterly');
const ARMED = process.argv.includes('--go');

function loadKey() {
  if (process.env.PIXELLAB_API_KEY) return process.env.PIXELLAB_API_KEY.trim();
  const f = join(HERE, '.env');
  if (existsSync(f)) {
    for (const l of readFileSync(f, 'utf8').split('\n')) {
      const m = l.match(/PIXELLAB_API_KEY\s*=\s*(.+)/);
      if (m) return m[1].trim().replace(/['"]/g, '');
    }
  }
}
const key = loadKey();
if (!key) { console.error('no key'); process.exit(1); }
console.log(ARMED ? '⚠ ARMED' : 'DRY RUN');

if (!ARMED) { console.log('would POST animate-with-text-v3 idle 4 frames 256px. Add --go.'); process.exit(0); }

// resize to 256
const tmp = join(tmpdir(), 'pl_agent_256.png');
execSync(`sips -z 256 256 "${LOCKED}" --out "${tmp}" -s format png 2>/dev/null`);
const b64 = readFileSync(tmp).toString('base64');

console.log('submitting v3 idle…');
const res = await fetch(`${BASE}/animate-with-text-v3`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    first_frame: { type: 'base64', base64: b64 },
    action: 'idle breathing, gentle bob, front-facing',
    frame_count: 4,
  }),
});
if (!res.ok) { console.error('submit failed:', res.status, await res.text()); process.exit(1); }
const { background_job_id } = await res.json();
console.log('job:', background_job_id);

process.stdout.write('polling');
let jobData;
for (let i = 0; i < 120; i++) {
  await new Promise(r => setTimeout(r, 8000));
  process.stdout.write('.');
  const pr = await fetch(`${BASE}/background-jobs/${background_job_id}`, {
    headers: { Authorization: `Bearer ${key}` }
  });
  const d = await pr.json();
  if (process.argv.includes('--debug') && i === 0) console.log('\nfirst poll:', JSON.stringify(d, null, 2));
  const status = d.status || d.state;
  if (status === 'failed' || status === 'error') { console.error('\nfailed:', JSON.stringify(d)); process.exit(1); }
  if (status === 'completed' || status === 'succeeded') { jobData = d; break; }
  // also check if images are already present even without "completed"
  if (d.last_response?.images?.length || d.images?.length) { jobData = d; break; }
}
if (!jobData) { console.error('\ntimed out'); process.exit(1); }

// debug: print keys so we know where images live
console.log('\njob keys:', Object.keys(jobData));
if (jobData.last_response) console.log('last_response keys:', Object.keys(jobData.last_response));

// walk and save all images
const blobs = [];
const walk = (o, depth=0) => {
  if (!o || typeof o !== 'object' || depth > 8) return;
  for (const [k, v] of Object.entries(o)) {
    if (typeof v === 'string') {
      if (/^data:image/i.test(v)) { blobs.push({ type: 'datauri', val: v }); }
      else if (/^https?:\/\//i.test(v)) { blobs.push({ type: 'url', val: v }); }
      else if ((k === 'base64' || k === 'image') && v.length > 100) { blobs.push({ type: 'b64', val: v }); }
    } else if (typeof v === 'object') walk(v, depth+1);
  }
};
walk(jobData);
console.log(`found ${blobs.length} image blob(s)`);
mkdirSync(OUT, { recursive: true });
let n = 0;
for (const blob of blobs) {
  const path = join(OUT, `frame_${String(n).padStart(2,'0')}.png`);
  if (blob.type === 'url') {
    for (let t = 0; t < 6; t++) {
      const r = await fetch(blob.val);
      if (r.ok) { writeFileSync(path, Buffer.from(await r.arrayBuffer())); n++; break; }
      await new Promise(r => setTimeout(r, 5000));
    }
  } else {
    const b = blob.val.replace(/^data:image\/[^;]+;base64,/, '');
    writeFileSync(path, Buffer.from(b, 'base64'));
    n++;
  }
}
console.log(`✓ saved ${n} frames → public/art/agent/idle-painterly/`);

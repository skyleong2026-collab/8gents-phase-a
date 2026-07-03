#!/usr/bin/env node
// Generate player-agent sprite frames from the locked reference image.
// Pipeline: art/agent-locked.png → PixelLab → public/art/agent/<state>/
//
// BAKE-OFF first — generates ONE idle in both styles so Sky can pick the art identity:
//   painterly : animate-with-text-v3  (keeps Midjourney look, motion only)
//   crisp     : create-character-v3 → animate-character (true pixel art, 8 directions)
//
// USAGE
//   node scripts/pixellab/agent-gen.mjs                        # dry run (prints plan, free)
//   node scripts/pixellab/agent-gen.mjs --bake-off --go        # run both idle styles (~5 gens)
//   node scripts/pixellab/agent-gen.mjs --kit --style painterly --go  # full 4-state kit, painterly
//   node scripts/pixellab/agent-gen.mjs --kit --style crisp --go      # full 4-state kit, crisp

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
const BASE = 'https://api.pixellab.ai/v2';
const LOCKED = join(ROOT, 'art', 'agent-locked.png');
const OUT_BASE = join(ROOT, 'public', 'art', 'agent');

if (!existsSync(LOCKED)) {
  console.error('✗ locked image not found at art/agent-locked.png');
  process.exit(1);
}

// ── env ────────────────────────────────────────────────────────────────────
function loadKey() {
  if (process.env.PIXELLAB_API_KEY) return process.env.PIXELLAB_API_KEY.trim();
  const envPath = join(HERE, '.env');
  if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, 'utf8').split('\n')) {
      const m = line.match(/^\s*PIXELLAB_API_KEY\s*=\s*(.+?)\s*$/);
      if (m) return m[1].replace(/^["']|["']$/g, '').trim();
    }
  }
  return null;
}

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? (process.argv[i + 1] || true) : null;
}
const has = (name) => process.argv.includes(`--${name}`);
const ARMED = has('go');

// ── image helpers ───────────────────────────────────────────────────────────
function resizeToBase64(srcPath, size) {
  const tmp = join(tmpdir(), `pl_agent_${size}.png`);
  execSync(`sips -z ${size} ${size} "${srcPath}" --out "${tmp}" -s format png 2>/dev/null`);
  const b64 = readFileSync(tmp).toString('base64');
  try { execSync(`rm "${tmp}"`); } catch (_) {}
  return b64;
}

// ── auth ────────────────────────────────────────────────────────────────────
function authHeaders(key) {
  return { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };
}

// ── async job poller ─────────────────────────────────────────────────────────
async function awaitJob(key, jobId, tries = 90, delayMs = 8000) {
  for (let i = 0; i < tries; i++) {
    const res = await fetch(`${BASE}/background-jobs/${jobId}`, { headers: authHeaders(key) });
    const data = await res.json();
    const status = data.status || data.state;
    if (status === 'completed' || status === 'succeeded' || data.result || data.images) return data;
    if (status === 'failed' || status === 'error') throw new Error(`job ${jobId} failed: ${JSON.stringify(data)}`);
    process.stdout.write('.');
    await new Promise((r) => setTimeout(r, delayMs));
  }
  throw new Error(`job ${jobId} timed out after ${tries} polls`);
}

// ── save helpers ─────────────────────────────────────────────────────────────
async function saveFromJob(jobData, outDir) {
  mkdirSync(outDir, { recursive: true });
  // walk the whole response tree — response shape varies (last_response.images, images, result.images, etc.)
  const blobs = [];
  const walk = (o) => {
    if (!o || typeof o !== 'object') return;
    for (const [k, v] of Object.entries(o)) {
      if (typeof v === 'string') {
        if (/^data:image/i.test(v)) { blobs.push({ type: 'datauri', val: v }); continue; }
        if (/^https?:\/\//i.test(v) && (k === 'url' || k === 'image' || /image|frame|sprite/i.test(k))) {
          blobs.push({ type: 'url', val: v }); continue;
        }
        if ((k === 'base64' || k === 'image') && v.length > 100) {
          blobs.push({ type: 'b64', val: v }); continue;
        }
      } else if (typeof v === 'object') walk(v);
    }
  };
  walk(jobData);

  let n = 0;
  for (const blob of blobs) {
    const path = join(outDir, `frame_${String(n).padStart(2, '0')}.png`);
    if (blob.type === 'url') {
      let buf;
      for (let t = 0; t < 5; t++) {
        const r = await fetch(blob.val);
        if (r.ok) { buf = Buffer.from(await r.arrayBuffer()); break; }
        await new Promise((r) => setTimeout(r, 5000));
      }
      if (buf) { writeFileSync(path, buf); n++; }
    } else {
      const b64 = blob.val.replace(/^data:image\/[^;]+;base64,/, '');
      writeFileSync(path, Buffer.from(b64, 'base64'));
      n++;
    }
  }
  return n;
}

function saveSync(data, outDir) {
  mkdirSync(outDir, { recursive: true });
  const raw = data?.image?.base64 || '';
  const b64 = raw.replace(/^data:image\/[^;]+;base64,/, '');
  const path = join(outDir, 'frame_00.png');
  writeFileSync(path, Buffer.from(b64, 'base64'));
  return 1;
}

// ── run ───────────────────────────────────────────────────────────────────────
const key = loadKey();
console.log('— agent-gen —');
console.log(key ? '✓ key found' : '✗ no key — add PIXELLAB_API_KEY to scripts/pixellab/.env');
console.log(ARMED ? '⚠ ARMED (--go): spending generations.' : 'DRY run — prints plan, spends NOTHING.');

const STATES = [
  { id: 'idle',     v3: 'idle breathing, gentle bob, front-facing' },
  { id: 'attack',   v3: 'attacking lunge forward, mid-strike, front-facing' },
  { id: 'hurt',     v3: 'recoiling, hit and flinching back, front-facing' },
  { id: 'defeated', v3: 'collapsing, defeated, slumping down' },
];

const CHAR_DESCRIPTION =
  'a teenage human in sleek powered mech armor, cyan hex glowing chest core, gunmetal-blue plating, '
  + 'youthful open face, heroic stance, clean neutral pose, no arm cannon, front-facing';

// ── BAKE-OFF (one idle each style) ───────────────────────────────────────────
if (has('bake-off')) {
  console.log('\n— BAKE-OFF: idle in both styles (~5 gens) —');
  console.log('  painterly : animate-with-text-v3 (4 frames @ 256px, keeps MJ look)');
  console.log('  crisp     : create-character-v3 (8 rotations @ 256px, true pixel art)');
  if (!ARMED) { console.log('\nAdd --go to actually generate.'); process.exit(0); }
  if (!key) { console.error('no key'); process.exit(1); }

  // 1. PAINTERLY — v3 idle
  console.log('\n[painterly] submitting v3 idle…');
  const b64_256 = resizeToBase64(LOCKED, 256);
  const v3Res = await fetch(`${BASE}/animate-with-text-v3`, {
    method: 'POST', headers: authHeaders(key),
    body: JSON.stringify({ first_frame: { type: 'base64', base64: b64_256 }, action: STATES[0].v3, frame_count: 4 }),
  });
  if (!v3Res.ok) throw new Error(`v3 idle failed: HTTP ${v3Res.status} ${await v3Res.text()}`);
  const { background_job_id: v3JobId } = await v3Res.json();
  console.log(`  job ${v3JobId.slice(0, 12)}… polling`);
  const v3Done = await awaitJob(key, v3JobId);
  const v3n = await saveFromJob(v3Done, join(OUT_BASE, 'idle-painterly'));
  console.log(`\n✓ painterly: ${v3n} frames → public/art/agent/idle-painterly/`);

  // 2. CRISP — create-character-v3 (gives 8 rotations; south = front view)
  console.log('\n[crisp] submitting create-character-v3…');
  const charRes = await fetch(`${BASE}/create-character-v3`, {
    method: 'POST', headers: authHeaders(key),
    body: JSON.stringify({
      description: CHAR_DESCRIPTION,
      reference_image: { type: 'base64', base64: b64_256 },
      view: 'side',
      name: 'agent-v1',
      no_background: true,
      outline: 'single color black outline',
      detail: 'low detail',
    }),
  });
  if (!charRes.ok) throw new Error(`create-character-v3 failed: HTTP ${charRes.status} ${await charRes.text()}`);
  const charData = await charRes.json();
  const charId = charData.id || charData.character_id;
  console.log(`  character_id: ${charId}`);

  // poll for rotations
  console.log('  polling for rotations');
  let charReady;
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 10000));
    process.stdout.write('.');
    const poll = await fetch(`${BASE}/characters/${charId}`, { headers: authHeaders(key) });
    const pdata = await poll.json();
    if (pdata.rotation_urls && Object.keys(pdata.rotation_urls).length >= 1) { charReady = pdata; break; }
  }
  if (!charReady) throw new Error('character rotations timed out');
  const crispDir = join(OUT_BASE, 'idle-crisp-rotations');
  mkdirSync(crispDir, { recursive: true });
  let cn = 0;
  for (const [dir, url] of Object.entries(charReady.rotation_urls || {})) {
    for (let t = 0; t < 5; t++) {
      const r = await fetch(url);
      if (r.ok) {
        writeFileSync(join(crispDir, `${dir}.png`), Buffer.from(await r.arrayBuffer()));
        cn++; break;
      }
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
  console.log(`\n✓ crisp: ${cn} rotations → public/art/agent/idle-crisp-rotations/`);
  console.log(`  character_id saved: ${charId}`);
  writeFileSync(join(OUT_BASE, 'character-id.txt'), charId);
  console.log('\nBake-off done. Show Sky both folders and let them pick the art direction.');
  process.exit(0);
}

// ── FULL KIT ─────────────────────────────────────────────────────────────────
if (has('kit')) {
  const style = arg('style') || 'painterly';
  if (!['painterly', 'crisp'].includes(style)) {
    console.error('--style must be painterly or crisp'); process.exit(1);
  }
  console.log(`\n— FULL KIT: ${style} style, 4 states —`);
  for (const s of STATES) console.log(`  ${s.id}`);
  if (!ARMED) { console.log('\nAdd --go to generate.'); process.exit(0); }
  if (!key) { console.error('no key'); process.exit(1); }

  if (style === 'painterly') {
    const b64_256 = resizeToBase64(LOCKED, 256);
    const pending = [];
    for (const s of STATES) {
      console.log(`\n[${s.id}] submitting v3…`);
      const res = await fetch(`${BASE}/animate-with-text-v3`, {
        method: 'POST', headers: authHeaders(key),
        body: JSON.stringify({ first_frame: { type: 'base64', base64: b64_256 }, action: s.v3, frame_count: 4 }),
      });
      if (!res.ok) { console.error(`✗ ${s.id}: HTTP ${res.status} ${await res.text()}`); continue; }
      const { background_job_id } = await res.json();
      pending.push({ ...s, jobId: background_job_id });
      console.log(`  queued ${background_job_id.slice(0, 12)}`);
    }
    const results = await Promise.allSettled(pending.map(async (s) => {
      process.stdout.write(`\n[${s.id}] polling`);
      const done = await awaitJob(key, s.jobId);
      const n = await saveFromJob(done, join(OUT_BASE, s.id));
      console.log(`\n✓ ${s.id}: ${n} frames → public/art/agent/${s.id}/`);
    }));
    const ok = results.filter((r) => r.status === 'fulfilled').length;
    console.log(`\nDONE: ${ok}/${STATES.length} states.`);

  } else {
    // crisp: need character_id from bake-off, or create fresh
    let charId;
    const idFile = join(OUT_BASE, 'character-id.txt');
    if (existsSync(idFile)) {
      charId = readFileSync(idFile, 'utf8').trim();
      console.log(`  using existing character_id: ${charId}`);
    } else {
      console.log('  no character-id.txt — run --bake-off --go first to create the character.');
      process.exit(1);
    }
    const pending = [];
    for (const s of STATES) {
      console.log(`\n[${s.id}] submitting animate-character…`);
      const res = await fetch(`${BASE}/animate-character`, {
        method: 'POST', headers: authHeaders(key),
        body: JSON.stringify({ character_id: charId, action_description: s.v3, frame_count: 4 }),
      });
      if (!res.ok) { console.error(`✗ ${s.id}: HTTP ${res.status} ${await res.text()}`); continue; }
      const { background_job_ids } = await res.json();
      const southJob = (background_job_ids || {}).south || Object.values(background_job_ids || {})[0];
      if (!southJob) { console.error(`✗ ${s.id}: no job id returned`); continue; }
      pending.push({ ...s, jobId: southJob });
      console.log(`  queued ${southJob.slice(0, 12)}`);
    }
    const results = await Promise.allSettled(pending.map(async (s) => {
      process.stdout.write(`\n[${s.id}] polling`);
      const done = await awaitJob(key, s.jobId);
      const n = await saveFromJob(done, join(OUT_BASE, s.id));
      console.log(`\n✓ ${s.id}: ${n} frames → public/art/agent/${s.id}/`);
    }));
    const ok = results.filter((r) => r.status === 'fulfilled').length;
    console.log(`\nDONE: ${ok}/${STATES.length} states.`);
  }
  process.exit(0);
}

// default: show the plan
console.log('\nNothing run. Commands:');
console.log('  --bake-off [--go]             idle in both styles (~5 gens); compare, then pick');
console.log('  --kit --style painterly [--go] full 4-state kit, painterly (keeps MJ look)');
console.log('  --kit --style crisp [--go]     full 4-state kit, crisp pixel (needs bake-off first)');

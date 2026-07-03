#!/usr/bin/env node
// MJ → crisp pixel sprite, via PixelLab /image-to-pixelart (synchronous, Tier 1, ~1 gen each).
// LOCAL ONLY — reads the key from the gitignored scripts/pixellab/.env. Never imported by the game.
//
// Pipeline: a locked Midjourney character image (any size ≤1280) → clean game pixel sprite.
// Guarded: prints the plan and spends NOTHING unless you pass --go.
//
// USAGE
//   node scripts/pixellab/mj-to-pixel.mjs --src /tmp/rwt-src --out public/art/tactics            # dry run
//   node scripts/pixellab/mj-to-pixel.mjs --src /tmp/rwt-src --out public/art/tactics --only sharpshooter --go
//   node scripts/pixellab/mj-to-pixel.mjs --src /tmp/rwt-src --out public/art/tactics --go        # all
//
// Flags: --size <in px, default 320>  --out-size <out px 16-320, default 128>  --only a,b  --force

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { dirname, join, basename, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
const BASE = 'https://api.pixellab.ai/v2';

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
function arg(name, def) { const i = process.argv.indexOf(`--${name}`); return i >= 0 ? (process.argv[i + 1] ?? true) : def; }
const has = (name) => process.argv.includes(`--${name}`);
const ARMED = has('go');
const authHeaders = (key) => ({ Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' });

function abs(p) { return isAbsolute(p) ? p : join(ROOT, p); }

// resize source to NxN PNG (square; image-to-pixelart wants image_size == sent image dims)
function resizePng(srcPath, size) {
  const tmp = join(tmpdir(), `mj2px_${basename(srcPath)}_${size}.png`);
  execSync(`sips -s format png -z ${size} ${size} "${srcPath}" --out "${tmp}" 2>/dev/null`);
  return tmp;
}

async function convertOne(key, srcPath, outPath, inSize, outSize) {
  const png = resizePng(srcPath, inSize);
  const b64 = readFileSync(png).toString('base64');
  const body = {
    image: { type: 'base64', base64: b64, format: 'png' },
    image_size: { width: inSize, height: inSize },
    output_size: { width: outSize, height: outSize },
    text_guidance_scale: 8,
  };
  let res, lastErr;
  for (let t = 0; t < 5; t++) {
    res = await fetch(`${BASE}/image-to-pixelart`, { method: 'POST', headers: authHeaders(key), body: JSON.stringify(body) });
    if (res.ok) break;
    lastErr = `HTTP ${res.status} ${await res.text()}`;
    if (res.status >= 500 || res.status === 429) { await new Promise((r) => setTimeout(r, 4000 * (t + 1))); continue; }
    throw new Error(lastErr); // 4xx (not rate limit) — don't retry
  }
  if (!res.ok) throw new Error(`gave up after retries: ${lastErr}`);
  const data = await res.json();
  const raw = data?.image?.base64;
  if (!raw) throw new Error('no image in response: ' + JSON.stringify(data).slice(0, 200));
  const clean = raw.replace(/^data:image\/[^;]+;base64,/, '');
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, Buffer.from(clean, 'base64'));
  return { bytes: Buffer.from(clean, 'base64').length, usage: data.usage };
}

async function main() {
  const key = loadKey();
  const srcDir = abs(arg('src', '/tmp/rwt-src'));
  const outDir = abs(arg('out', 'public/art/tactics'));
  const inSize = Number(arg('size', 320));
  const outSize = Number(arg('out-size', 128));
  const onlyArg = arg('only', null);
  const only = onlyArg && typeof onlyArg === 'string' ? onlyArg.split(',').map((s) => s.trim()) : null;
  const force = has('force');

  console.log('— mj-to-pixel —');
  console.log(key ? '✓ key found' : '✗ no key — add PIXELLAB_API_KEY to scripts/pixellab/.env');
  console.log(`src=${srcDir}  out=${outDir}  in=${inSize}px  out=${outSize}px`);
  console.log(ARMED ? '⚠ ARMED (--go): this WILL spend generations.' : 'DRY RUN: spends NOTHING. Add --go to convert.');

  if (!existsSync(srcDir)) { console.error('src dir not found'); process.exit(1); }
  let files = readdirSync(srcDir).filter((f) => /\.(png|jpe?g|webp)$/i.test(f));
  if (only) files = files.filter((f) => only.includes(basename(f).replace(/\.[^.]+$/, '')));
  if (!files.length) { console.error('no source images matched'); process.exit(1); }

  let done = 0, skipped = 0, failed = 0;
  for (const f of files) {
    const name = basename(f).replace(/\.[^.]+$/, '');
    const outPath = join(outDir, `${name}.png`);
    if (!force && existsSync(outPath)) { console.log(`· ${name}: exists — skip (--force to redo)`); skipped++; continue; }
    if (!ARMED) { console.log(`· ${name}: would convert ${f} → ${outPath}`); continue; }
    if (!key) { console.error('armed but no key'); process.exit(1); }
    process.stdout.write(`· ${name}: converting… `);
    try {
      const r = await convertOne(key, join(srcDir, f), outPath, inSize, outSize);
      console.log(`✓ ${r.bytes}b → ${outPath.replace(ROOT + '/', '')}`);
      done++;
    } catch (e) { console.log(`✗ ${e.message}`); failed++; }
  }
  console.log(`\n— summary — ${ARMED ? `converted ${done}` : `${files.length - skipped} would convert`}, skipped ${skipped}${failed ? `, ${failed} failed` : ''}.`);
}
main().catch((e) => { console.error('ERROR:', e.message); process.exit(1); });

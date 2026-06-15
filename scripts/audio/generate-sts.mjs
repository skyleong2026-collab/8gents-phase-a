// generate-sts.mjs — Speech-to-Speech pass. Converts your reference performances (real
// cries/shouts/emotion) into the character voices, overwriting the flat TTS versions.
//
// REQUIRES the key to have the "Speech to Speech" permission (add it at elevenlabs.io → API Keys).
//
// WORKFLOW:
//   1. Record each performance (phone voice memo is fine). One line per file.
//   2. Name the file EXACTLY like its line: <speaker>-<event>-<n>.<ext>  e.g. mara-down-1.m4a
//      (.wav/.mp3/.m4a/.ogg/.webm all accepted).
//   3. Drop them in scripts/audio/refs/.
//   4. node scripts/audio/generate-sts.mjs   → writes public/audio/vo/<name>.mp3 (overwrites TTS).
//
// Only the PERFORMANCE transfers (pitch, timing, cries) — your accent/voice is replaced by the
// character's. So perform the emotion fully; how you sound doesn't matter.

import { readFileSync, existsSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { join, dirname, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE = dirname(fileURLToPath(import.meta.url));
const REFS = process.argv[2] || join(HERE, 'refs');
const OUT_DIR = join(HERE, '..', '..', 'public', 'audio', 'vo');
const MODEL = 'eleven_multilingual_sts_v2';

function loadKey() {
  if (process.env.ELEVENLABS_API_KEY) return process.env.ELEVENLABS_API_KEY.trim();
  for (const p of [join(HERE, '.env'), join(process.env.HOME || '', '.openclaw', '.env')]) {
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, 'utf8').split('\n')) {
      const m = line.match(/^\s*ELEVENLABS_API_KEY\s*=\s*(.+?)\s*$/);
      if (m) return m[1].replace(/^["']|["']$/g, '').trim();
    }
  }
  return null;
}

// speaker → voice id (keep in sync with generate-vo.mjs VOICES).
const VOICE = {
  spotter: 'Q4oILuo4P8VeXtE6FMLI', handler: '9PVP7ENhDskL0KYHAKtD', eli: 'Av4Fi2idMFuA8kTbVZgv',
  ruth: '0lyV68Aacjmcsjj9LO1q', cal: 'Xq2dbIWNPChFB77imiDe', mara: 'oWAxZDx7w5VEj9dCyTzz',
  wren: 'GGRMgbKfr7QscdcrvWga', tom: '1yDXKNtyiAtDljYHKmZy',
};
const MIME = { '.wav': 'audio/wav', '.mp3': 'audio/mpeg', '.m4a': 'audio/mp4', '.ogg': 'audio/ogg', '.webm': 'audio/webm' };

const key = loadKey();
if (!key) { console.error('✗ no key'); process.exit(1); }
if (!existsSync(REFS)) { console.error(`✗ refs folder not found: ${REFS}`); process.exit(1); }
mkdirSync(OUT_DIR, { recursive: true });

const files = readdirSync(REFS).filter((f) => MIME[extname(f).toLowerCase()]);
if (!files.length) { console.log(`No audio in ${REFS}. Drop reference recordings there first.`); process.exit(0); }

// Forgiving filename → canonical line id: lowercase, turn spaces / dashes (incl. – —) /
// underscores into single hyphens. "Handler – squad – wiped –1" → "handler-squad-wiped-1".
const canon = (stem) => stem.toLowerCase().replace(/[\s‐-―_]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

let made = 0, failed = 0;
for (const f of files) {
  const stem = canon(basename(f, extname(f)));
  const speaker = stem.split('-')[0];
  const voiceId = VOICE[speaker];
  if (!voiceId) { console.log(`· skip ${f} (unknown speaker '${speaker}')`); failed++; continue; }
  // Guard against typos: only overwrite a line that already exists as a TTS baseline.
  if (!existsSync(join(OUT_DIR, `${stem}.mp3`))) { console.log(`· skip ${f} → "${stem}.mp3" has no matching line (check name)`); failed++; continue; }
  process.stdout.write(`→ ${stem}.mp3  (${speaker}) … `);
  try {
    const buf = readFileSync(join(REFS, f));
    const fd = new FormData();
    fd.append('audio', new Blob([buf], { type: MIME[extname(f).toLowerCase()] }), f);
    fd.append('model_id', MODEL);
    fd.append('remove_background_noise', 'true');
    const res = await fetch(`https://api.elevenlabs.io/v1/speech-to-speech/${voiceId}`, {
      method: 'POST', headers: { 'xi-api-key': key, accept: 'audio/mpeg' }, body: fd,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${(await res.text()).slice(0,160)}`);
    writeFileSync(join(OUT_DIR, `${stem}.mp3`), Buffer.from(await res.arrayBuffer()));
    console.log('ok'); made++;
  } catch (e) { console.log('FAIL ' + e.message); failed++; }
}
console.log(`\nDone — ${made} converted, ${failed} failed → ${OUT_DIR}`);

// list-voices.mjs — list ElevenLabs voices available to this key, and confirm TTS access.
// Usage: node scripts/audio/list-voices.mjs
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE = dirname(fileURLToPath(import.meta.url));

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

const key = loadKey();
if (!key) { console.error('no key'); process.exit(1); }

const r = await fetch('https://api.elevenlabs.io/v1/voices', { headers: { 'xi-api-key': key } });
if (!r.ok) { console.error('voices HTTP', r.status, await r.text().catch(()=> '')); process.exit(1); }
const { voices } = await r.json();
console.log(`${voices.length} voices:\n`);
for (const v of voices) {
  const L = v.labels || {};
  const tags = [L.gender, L.age, L.accent, L.descriptive || L.description, L.use_case].filter(Boolean).join(', ');
  console.log(`${(v.name||'').padEnd(16)} ${v.voice_id}  [${tags}]`);
}

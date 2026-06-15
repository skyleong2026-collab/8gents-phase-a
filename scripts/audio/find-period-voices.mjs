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
async function search(terms, extra = {}) {
  const url = 'https://api.elevenlabs.io/v1/shared-voices?' + new URLSearchParams({ page_size: '30', language: 'en', search: terms, ...extra });
  const r = await fetch(url, { headers: { 'xi-api-key': key } });
  if (!r.ok) { console.log(`[${terms}] HTTP ${r.status}`); return; }
  const { voices = [] } = await r.json();
  console.log(`\n=== "${terms}"${extra.gender ? ' ('+extra.gender+')' : ''} — ${voices.length} ===`);
  for (const v of voices.slice(0, 12)) {
    const tags = [v.gender, v.age, v.accent, v.descriptive, v.use_case].filter(Boolean).join(', ');
    console.log(`${(v.name||'').slice(0,18).padEnd(18)} ${v.voice_id}  [${tags}]`);
  }
}
await search('grizzled old man', { gender: 'male' });
await search('confident strong woman', { gender: 'female' });
await search('blunt serious woman', { gender: 'female' });
await search('cocky young man', { gender: 'male' });
await search('brave young woman', { gender: 'female' });
await search('old soldier veteran', { gender: 'male' });

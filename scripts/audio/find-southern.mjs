// find-southern.mjs — confirm paid plan + search the shared Voice Library for Southern/Western
// American voices to cast the weird-West crew. Prints name, voice_id, and tags.
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

// 1) paid check — Grace (a library voice) returned 402 on free.
const t = await fetch('https://api.elevenlabs.io/v1/text-to-speech/oWAxZDx7w5VEj9dCyTzz', {
  method: 'POST', headers: { 'xi-api-key': key, 'Content-Type': 'application/json', accept: 'audio/mpeg' },
  body: JSON.stringify({ text: 'Testing, one two.', model_id: 'eleven_multilingual_v2' }),
});
console.log(`paid check (library voice TTS): ${t.status} ${t.ok ? 'OK — paid active' : '(' + (await t.text()).slice(0,80) + ')'}\n`);

// 2) search the shared library for Southern/Western American voices.
async function search(label, params) {
  const url = 'https://api.elevenlabs.io/v1/shared-voices?' + new URLSearchParams({ page_size: '40', language: 'en', ...params });
  const r = await fetch(url, { headers: { 'xi-api-key': key } });
  if (!r.ok) { console.log(`[${label}] HTTP ${r.status} ${(await r.text()).slice(0,100)}`); return; }
  const { voices = [] } = await r.json();
  console.log(`\n=== ${label} (${voices.length}) ===`);
  for (const v of voices.slice(0, 25)) {
    const tags = [v.gender, v.age, v.accent, v.descriptive, v.use_case].filter(Boolean).join(', ');
    console.log(`${(v.name||'').padEnd(18)} ${v.voice_id}  [${tags}]`);
  }
}
await search('search=southern', { search: 'southern' });
await search('accent=american + western', { search: 'western cowboy gravel', accent: 'american' });

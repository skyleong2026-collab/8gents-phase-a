// sts-test.mjs — confirm Speech-to-Speech works on this key. Pushes an existing VO clip
// through STS into a target (Southern) voice. Output → ~/Desktop/sts-test.mp3
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
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
const TARGET = 'oWAxZDx7w5VEj9dCyTzz'; // Grace (Southern)
const IN = join(HERE, '..', '..', 'public', 'audio', 'vo', 'mara-down-1.mp3'); // a panic line we already have
const OUT = join(process.env.HOME, 'Desktop', 'sts-test.mp3');

const buf = readFileSync(IN);
const fd = new FormData();
fd.append('audio', new Blob([buf], { type: 'audio/mpeg' }), 'in.mp3');
fd.append('model_id', 'eleven_multilingual_sts_v2');
fd.append('remove_background_noise', 'true');

const r = await fetch(`https://api.elevenlabs.io/v1/speech-to-speech/${TARGET}`, {
  method: 'POST', headers: { 'xi-api-key': key, accept: 'audio/mpeg' }, body: fd,
});
console.log('STS status:', r.status);
if (!r.ok) { console.log((await r.text()).slice(0, 240)); process.exit(1); }
writeFileSync(OUT, Buffer.from(await r.arrayBuffer()));
console.log('OK → ' + OUT);

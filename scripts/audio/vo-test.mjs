// vo-test.mjs — recast Eli + Ruth → ~/Desktop/ringward-vo-recast/
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(process.env.HOME, 'Desktop', 'ringward-vo-recast');
const MODEL = 'eleven_multilingual_v2';
const STEADY = { stability: 0.4, similarity_boost: 0.85, style: 0.35, use_speaker_boost: true };

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

const CAST = {
  eli: { voices: [['christopher','P1z1v1qQU22zZKAwS1Up'],['russel','Av4Fi2idMFuA8kTbVZgv']],
    lines: ["Knew it'd drop.",
            "That's the dice. Frontier doesn't owe you the hit. Reset, find a cleaner angle."] },
  ruth: { voices: [['jessie','0lyV68Aacjmcsjj9LO1q'],['viktoria','tPzOTlbmuCEa6h67Xb6k']],
    lines: ["Holding.",
            "Let 'em come.",
            "Hold the line. They don't get past me — not tonight."] },
};

const key = loadKey();
if (!key) { console.error('no key'); process.exit(1); }
mkdirSync(OUT, { recursive: true });

let made = 0, failed = 0;
for (const [char, c] of Object.entries(CAST)) {
  for (const [vn, id] of c.voices) {
    for (let i = 0; i < c.lines.length; i++) {
      const name = `${char}-${vn}-${i + 1}.mp3`;
      process.stdout.write(`→ ${name} … `);
      try {
        const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${id}`, {
          method: 'POST', headers: { 'xi-api-key': key, 'Content-Type': 'application/json', accept: 'audio/mpeg' },
          body: JSON.stringify({ text: c.lines[i], model_id: MODEL, voice_settings: STEADY }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status} ${(await res.text()).slice(0,90)}`);
        writeFileSync(join(OUT, name), Buffer.from(await res.arrayBuffer()));
        console.log('ok'); made++;
      } catch (e) { console.log('FAIL ' + e.message); failed++; }
    }
  }
}
console.log(`\nDone — ${made} made, ${failed} failed → ${OUT}`);

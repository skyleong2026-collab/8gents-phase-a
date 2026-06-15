// generate-vo.mjs — generate Ringward Tactics character voice-over with ElevenLabs TTS.
// Source of truth for lines + casting: docs/RINGWARD-TACTICS-SCRIPT.md
//
// REQUIRES a PAID ElevenLabs plan (Starter+): Free accounts get 402 on TTS via API.
// The key in scripts/audio/.env already has Text-to-Speech permission.
//
// USAGE:
//   node scripts/audio/generate-vo.mjs --sample   # one line per speaker → casting check
//   node scripts/audio/generate-vo.mjs            # all lines not already present
//   node scripts/audio/generate-vo.mjs --force    # regenerate everything
//   node scripts/audio/generate-vo.mjs --only spotter         # one speaker
//   node scripts/audio/generate-vo.mjs --only spotter-tutorial# one speaker+event
//   node scripts/audio/generate-vo.mjs --list     # print the plan, generate nothing
//
// Files land at public/audio/vo/<speaker>-<event>-<n>.mp3 (the doc's convention).

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(HERE, '..', '..', 'public', 'audio', 'vo');
const MODEL = 'eleven_multilingual_v2'; // high-quality VO model

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
const arg = (n) => { const i = process.argv.indexOf(`--${n}`); return i >= 0 ? (process.argv[i + 1] || true) : null; };
const has = (n) => process.argv.includes(`--${n}`);

// ── Casting (DEFAULT ElevenLabs voices — these work on the free plan via API; the older
// "library" voices return 402 on free). Bill + George confirmed working. Refine after a listen. ──
// PERIOD CAST (frontier-era voices, locked 2026-06-15 after Sky's auditions). "Steady"
// profile preferred (stability ~0.4 reads more genuinely emotional than cranked-low).
const VOICES = {
  spotter: { voiceId: 'Q4oILuo4P8VeXtE6FMLI', settings: { stability: 0.4,  similarity_boost: 0.85, style: 0.35, use_speaker_boost: true } }, // Matthew Schmitz — old, weathered (Sam Elliott seat)
  handler: { voiceId: '9PVP7ENhDskL0KYHAKtD', settings: { stability: 0.42, similarity_boost: 0.85, style: 0.3,  use_speaker_boost: true } }, // Jerry B. — deep Southern command
  eli:     { voiceId: 'Av4Fi2idMFuA8kTbVZgv', settings: { stability: 0.45, similarity_boost: 0.85, style: 0.3,  use_speaker_boost: true } }, // Russel — raw old cowboy marksman
  ruth:    { voiceId: '0lyV68Aacjmcsjj9LO1q', settings: { stability: 0.45, similarity_boost: 0.85, style: 0.3,  use_speaker_boost: true } }, // Jessie — confident Southern, blunt
  cal:     { voiceId: 'Xq2dbIWNPChFB77imiDe', settings: { stability: 0.35, similarity_boost: 0.8,  style: 0.45, use_speaker_boost: true } }, // Gideon — rough Irish, reckless
  mara:    { voiceId: 'oWAxZDx7w5VEj9dCyTzz', settings: { stability: 0.4,  similarity_boost: 0.85, style: 0.4,  use_speaker_boost: true } }, // Grace — warm Southern medic
  wren:    { voiceId: 'GGRMgbKfr7QscdcrvWga', settings: { stability: 0.35, similarity_boost: 0.8,  style: 0.45, use_speaker_boost: true } }, // Kai — young Southern scout
  tom:     { voiceId: '1yDXKNtyiAtDljYHKmZy', settings: { stability: 0.42, similarity_boost: 0.85, style: 0.3,  use_speaker_boost: true } }, // Paddy — old Irish veteran
};

// ── Lines (verbatim from RINGWARD-TACTICS-SCRIPT.md). {speaker, event, n, text}.
// `sample:true` marks the one line per speaker used by --sample for casting checks. ──
const LINES = [
  // §2 Tutorial — Spotter, sequenced
  { s: 'spotter', e: 'tutorial', n: 1, t: "Six of us against whatever crossed the Rim tonight. Pick a trooper — click one, bottom-left.", sample: true },
  { s: 'spotter', e: 'tutorial', n: 2, t: "Good. Two actions a turn, each one. Spend 'em like they're your last, 'cause out here they might be." },
  { s: 'spotter', e: 'tutorial', n: 3, t: "Lit tiles are where they can reach. Click one to move — then Confirm. No takin' it back once the boots move." },
  { s: 'spotter', e: 'tutorial', n: 4, t: "See those shields on the tile edges? Half cover knocks 'em off their aim. Full cover blocks the shot cold. Live behind it." },
  { s: 'spotter', e: 'tutorial', n: 5, t: "Hover a target — that number's your odds. Get 'round their cover for a flank: no defense, and it stings extra." },
  { s: 'spotter', e: 'tutorial', n: 6, t: "That's the dice. Frontier doesn't owe you the hit. Reset, find a cleaner angle." },
  { s: 'spotter', e: 'tutorial', n: 7, t: "Overwatch sets a trap — first thing that moves in your sights, you drop it. Good for holding a gap." },
  { s: 'spotter', e: 'tutorial', n: 8, t: "High ground's worth climbing — better aim, and it strips a level off their cover." },
  { s: 'spotter', e: 'tutorial', n: 9, t: "When you're spent, end the turn. Then it's their move. Watch the dark." },
  { s: 'spotter', e: 'tutorial', n: 10, t: "Job tonight's simple: every hostile that crossed, put it down. Simple ain't the same as easy." },
  { s: 'spotter', e: 'tutorial', n: 11, t: "They'll take hits. Sawbones can patch 'em mid-fight — keep her close, keep her alive." },
  { s: 'spotter', e: 'tutorial', n: 12, t: "That's the shape of it. The rest you'll learn the hard way. Everybody does." },

  // §3 Battle barks
  { s: 'spotter', e: 'contact', n: 1, t: "Contact. They know we're here now." },
  { s: 'spotter', e: 'contact', n: 2, t: "Somethin' moved — pack's awake." },
  { s: 'spotter', e: 'contact', n: 3, t: "Eyes up. That's not the wind." },

  { s: 'wren', e: 'move', n: 1, t: "On the wind.", sample: true },
  { s: 'wren', e: 'move', n: 2, t: "Watch this." },
  { s: 'ruth', e: 'move', n: 1, t: "Holding.", sample: true },
  { s: 'eli',  e: 'move', n: 1, t: "Findin' my angle.", sample: true },

  { s: 'eli',  e: 'hit', n: 1, t: "Knew it'd drop." },
  { s: 'eli',  e: 'hit', n: 2, t: "Wind was right." },
  { s: 'cal',  e: 'hit', n: 1, t: "Ha! Sit down.", sample: true },
  { s: 'ruth', e: 'hit', n: 1, t: "Down." },

  { s: 'spotter', e: 'miss', n: 1, t: "Damn. Reset, find the angle." },
  { s: 'eli',  e: 'miss', n: 1, t: "...Wind." },
  { s: 'cal',  e: 'miss', n: 1, t: "Who built this thing crooked?" },

  { s: 'eli',  e: 'crit', n: 1, t: "That's the one." },
  { s: 'cal',  e: 'crit', n: 1, t: "Now THAT'S a hole." },
  { s: 'spotter', e: 'crit', n: 1, t: "Clean through. That's how." },

  { s: 'spotter', e: 'kill', n: 1, t: "That's one down." },
  { s: 'tom',  e: 'kill', n: 1, t: "One less crossin' tonight.", sample: true },
  { s: 'ruth', e: 'kill', n: 1, t: "Stay down." },

  { s: 'cal',  e: 'grenade', n: 1, t: "Frag out — cover's comin' down!" },
  { s: 'cal',  e: 'grenade', n: 2, t: "Fire in the hole, darlin'!" },

  { s: 'mara', e: 'heal', n: 1, t: "Stay with me — you're alright.", sample: true },
  { s: 'mara', e: 'heal', n: 2, t: "Hold still, this'll sting worse'n the wound." },

  { s: 'tom',  e: 'rally', n: 1, t: "On me! Move!" },
  { s: 'tom',  e: 'rally', n: 2, t: "We don't break. Not tonight." },

  { s: 'wren', e: 'mark', n: 1, t: "Lit 'em up — no cover, nowhere to fly." },
  { s: 'spotter', e: 'mark', n: 1, t: "Marked. Put it down." },

  { s: 'ruth', e: 'overwatch', n: 1, t: "Let 'em come." },
  { s: 'eli',  e: 'overwatch', n: 1, t: "I'll be watchin'." },

  { s: 'mara', e: 'down', n: 1, t: "No no no — somebody cover me!" },
  { s: 'tom',  e: 'down', n: 1, t: "Hold the line — I've got their name." },
  { s: 'spotter', e: 'down', n: 1, t: "We're hurt. Tighten up." },

  { s: 'spotter', e: 'flanked', n: 1, t: "You're exposed — get to cover." },
  { s: 'ruth', e: 'flanked', n: 1, t: "Bad spot." },

  // §4 Mission & objective
  { s: 'spotter', e: 'hunt-deploy', n: 1, t: "Hostiles came through the Rim. Advance careful — keep to cover, mind your flanks.", sample: true },
  { s: 'spotter', e: 'rite-deploy', n: 1, t: "Somethin's chanting out past the rocks. Find the Caster and put it down before the rite finishes." },
  { s: 'spotter', e: 'rite-breaking', n: 1, t: "That's it — the chant's done. Now clean up." },
  { s: 'spotter', e: 'rite-lose', n: 1, t: "Too late. It's through. Pull back!" },
  { s: 'spotter', e: 'hold-deploy', n: 1, t: "We just have to hold the cut till the relief comes. Dig in." },
  { s: 'spotter', e: 'hold-won', n: 1, t: "That's the relief horn — we held. Good work." },
  { s: 'handler', e: 'sector-cleared', n: 1, t: "All hostiles down. Clean work, team.", sample: true },
  { s: 'handler', e: 'squad-wiped', n: 1, t: "Squad's gone... fall back." },

  // §5 Meta
  { s: 'spotter', e: 'promote-human', n: 1, t: "Earned it. Good." },
  { s: 'spotter', e: 'promote-graft', n: 1, t: "...you sure about carryin' that inside you?" },
  { s: 'tom',  e: 'cairn', n: 1, t: "We'll set their stone on the ridge. Say the name." },
  { s: 'spotter', e: 'cairn', n: 1, t: "Another one for the Cairn." },
  { s: 'handler', e: 'frontier', n: 1, t: "Back to the line. Patch up, decide what we build." },
  { s: 'spotter', e: 'blight', n: 1, t: "Ground's wrong here. Don't drink the water, don't listen too long." },
];

const fileFor = (l) => `${l.s}-${l.e}-${l.n}.mp3`;

async function tts(line, key) {
  const cast = VOICES[line.s];
  if (!cast) throw new Error(`no voice cast for speaker '${line.s}'`);
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${cast.voiceId}`, {
    method: 'POST',
    headers: { 'xi-api-key': key, 'Content-Type': 'application/json', accept: 'audio/mpeg' },
    body: JSON.stringify({ text: line.t, model_id: MODEL, voice_settings: cast.settings }),
  });
  if (!res.ok) {
    const d = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}${d ? ' — ' + d.slice(0, 220) : ''}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(join(OUT_DIR, fileFor(line)), buf);
  return buf.length;
}

async function main() {
  const only = arg('only');
  const sample = has('sample');

  // --retry <dir>: re-roll exactly the lines whose .mp3 files sit in <dir> (the no-pass folder).
  // Defaults to ~/Desktop/ringward-vo/no-pass if no dir given. Always forces a fresh take.
  const retry = has('retry') ? (arg('retry') === true ? join(process.env.HOME, 'Desktop', 'ringward-vo', 'no-pass') : arg('retry')) : null;

  let plan = LINES;
  if (retry) {
    const want = new Set(existsSync(retry) ? readdirSync(retry).filter((f) => f.endsWith('.mp3')) : []);
    plan = plan.filter((l) => want.has(fileFor(l)));
    console.log(`retry: ${plan.length} line(s) matched from ${retry}`);
  }
  if (sample) plan = plan.filter((l) => l.sample);
  if (typeof only === 'string') plan = plan.filter((l) => l.s === only || `${l.s}-${l.e}` === only);
  const force = has('force') || !!retry; // a retry always re-rolls a fresh take

  if (has('list')) {
    plan.forEach((l) => console.log(`${fileFor(l).padEnd(28)} (${l.s}) "${l.t}"`));
    console.log(`\n${plan.length} lines planned.`);
    return;
  }

  const key = loadKey();
  if (!key) { console.error('✗ no key — paste ELEVENLABS_API_KEY into scripts/audio/.env'); process.exit(1); }
  mkdirSync(OUT_DIR, { recursive: true });

  console.log(`✓ key found. Generating ${plan.length} line(s) into ${OUT_DIR}\n`);
  let made = 0, skipped = 0, failed = 0;
  for (const l of plan) {
    const dest = join(OUT_DIR, fileFor(l));
    if (existsSync(dest) && !force) { console.log(`· skip ${fileFor(l)}`); skipped++; continue; }
    process.stdout.write(`→ ${fileFor(l)} … `);
    try { const b = await tts(l, key); console.log(`ok (${(b / 1024).toFixed(0)} KB)`); made++; }
    catch (e) { console.log(`FAILED: ${e.message}`); failed++; }
  }
  console.log(`\nDone — ${made} generated, ${skipped} skipped, ${failed} failed.`);
  if (failed) process.exit(1);
}
main().catch((e) => { console.error(e); process.exit(1); });

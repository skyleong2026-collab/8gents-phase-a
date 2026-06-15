// generate-sfx.mjs — generate Ringward's sound effects with the ElevenLabs Sound Effects API
// and drop them straight into public/audio/sfx/ with the exact filenames the game expects.
//
// SETUP: copy scripts/audio/.env.example → scripts/audio/.env and paste your ElevenLabs key.
//   The .env is gitignored — never committed, never shipped to the browser (build-time only).
//
// USAGE:
//   node scripts/audio/generate-sfx.mjs            # generate only the files that don't exist yet
//   node scripts/audio/generate-sfx.mjs --force    # regenerate everything (overwrites)
//   node scripts/audio/generate-sfx.mjs --only payoff-hit,heal   # just these
//   node scripts/audio/generate-sfx.mjs --list     # print the plan, generate nothing
//
// The prompts here mirror docs/AUDIO-PROMPT-PACK.md. Tune a prompt, re-run with --force --only <name>.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(HERE, '..', '..', 'public', 'audio', 'sfx');
const API_URL = 'https://api.elevenlabs.io/v1/sound-generation';

// ── env ──────────────────────────────────────────────────────────────────────
// Looks in process.env, then scripts/audio/.env, then ~/.openclaw/.env (where Sky keeps
// other keys). Mirrors the PixelLab loader.
function loadKey() {
  if (process.env.ELEVENLABS_API_KEY) return process.env.ELEVENLABS_API_KEY.trim();
  const candidates = [join(HERE, '.env'), join(process.env.HOME || '', '.openclaw', '.env')];
  for (const p of candidates) {
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, 'utf8').split('\n')) {
      const m = line.match(/^\s*ELEVENLABS_API_KEY\s*=\s*(.+?)\s*$/);
      if (m) return m[1].replace(/^["']|["']$/g, '').trim();
    }
  }
  return null;
}

const arg = (name) => { const i = process.argv.indexOf(`--${name}`); return i >= 0 ? (process.argv[i + 1] || true) : null; };
const has = (name) => process.argv.includes(`--${name}`);

// ── the SFX plan: filename → { prompt, duration?, influence? } ─────────────────
// Filenames MUST match src/audio/manifest.js. duration in seconds (ElevenLabs picks if null,
// capped ~22s). prompt_influence 0..1 — higher hugs the prompt, lower is more "creative".
const SFX = {
  // Combat
  'charge-up':       { prompt: 'short rising magical charge-up chirp, energy gathering, clean and bright', duration: 0.6 },
  'payoff-hit':      { prompt: 'deep heavy impact, powerful thud with a sharp transient crack, weighty melee payoff', duration: 1 },
  'wildcard':        { prompt: 'punchy mid-range whoosh-thud, dynamic magic strike with a downward pitch sweep', duration: 0.8 },
  'shield-block':    { prompt: 'hollow resonant clunk, a blow absorbed by a shield, dull metallic', duration: 0.7 },
  'heal':            { prompt: 'warm ascending chime, gentle restorative shimmer, hopeful', duration: 1 },
  'regen-tick':      { prompt: 'soft quiet healing tick, small bright chime, subtle', duration: 0.5 },
  'burn-tick':       { prompt: 'short sharp fizzing crackle, small flame burst', duration: 0.5 },
  'dot-tick':        { prompt: 'dull toxic fizz, a tick of poison and decay damage, muffled and sickly', duration: 0.5 },
  'amp-buff':        { prompt: 'rising electric buzz, power loading into an ally, energizing', duration: 0.6 },
  // Run / UI
  'upgrade-pick':    { prompt: 'clean satisfying double-chirp UI confirm, an upgrade chosen', duration: 0.5 },
  'forge-buy':       { prompt: 'short metallic two-tap, a forge purchase, anvil-like', duration: 0.5 },
  'wave-clear':      { prompt: 'brief triumphant three-note chime arpeggio, a wave cleared', duration: 1.2 },
  // Wayside-node stingers
  'merchant-bell':   { prompt: 'bright warm shop bell ding, a merchant appears', duration: 1 },
  'treasure-chime':  { prompt: 'ascending magical sparkle, treasure discovered', duration: 1.2 },
  'elite-growl':     { prompt: 'low menacing creature growl with a downward snarl, danger ahead', duration: 1.2 },
  // Outcomes
  'ring-taken':      { prompt: 'ascending four-note fanfare with a warm chord bloom, a victory', duration: 2 },
  'squad-down':      { prompt: 'three descending minor tones, a somber defeat, final', duration: 1.5 },
  'creature-caught': { prompt: 'rising five-note triumphant fanfare with a high sparkle, a creature captured', duration: 1.5 },
  // Story spine
  'ring-threshold':  { prompt: 'low atmospheric swell crossing into a new area, deep and cavernous', duration: 1.8 },
  'the-drop':        { prompt: 'warm resolving chord bloom, an emotional arrival, cinematic, slight reverb', duration: 5 },
  'scene-turn':      { prompt: 'soft low woody knock, a storybook page turning', duration: 0.5 },
};

async function generateOne(name, spec, key) {
  const body = { text: spec.prompt, prompt_influence: spec.influence ?? 0.4 };
  if (spec.duration) body.duration_seconds = spec.duration;
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'xi-api-key': key, 'Content-Type': 'application/json', accept: 'audio/mpeg' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText}${detail ? ' — ' + detail.slice(0, 240) : ''}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(join(OUT_DIR, `${name}.mp3`), buf);
  return buf.length;
}

async function main() {
  const only = arg('only');
  const onlySet = typeof only === 'string' ? new Set(only.split(',').map((s) => s.trim())) : null;
  const force = has('force');

  const plan = Object.entries(SFX).filter(([name]) => !onlySet || onlySet.has(name));
  if (has('list')) {
    plan.forEach(([name, s]) => console.log(`${name.padEnd(16)} ${s.duration ?? 'auto'}s  "${s.prompt}"`));
    console.log(`\n${plan.length} effects planned. Run without --list to generate.`);
    return;
  }

  const key = loadKey();
  if (!key) {
    console.error('✗ no key — paste ELEVENLABS_API_KEY into scripts/audio/.env (see .env.example)');
    process.exit(1);
  }
  mkdirSync(OUT_DIR, { recursive: true });

  console.log(`✓ key found. Generating into ${OUT_DIR}\n`);
  let made = 0, skipped = 0, failed = 0;
  for (const [name, spec] of plan) {
    const dest = join(OUT_DIR, `${name}.mp3`);
    if (existsSync(dest) && !force) { console.log(`· skip ${name} (exists — use --force to redo)`); skipped++; continue; }
    process.stdout.write(`→ ${name} … `);
    try {
      const bytes = await generateOne(name, spec, key);
      console.log(`ok (${(bytes / 1024).toFixed(0)} KB)`);
      made++;
    } catch (e) {
      console.log(`FAILED: ${e.message}`);
      failed++;
    }
  }
  console.log(`\nDone — ${made} generated, ${skipped} skipped, ${failed} failed.`);
  if (failed) process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(1); });

// ─── Golden: deterministic AI-vs-AI fight (§26.4(2)) ────────────────────────────
// Replaces the retired auto-resolve goldens. A fixed seed + fixed squads must
// produce the EXACT same transcript every run. Any change that alters this is a
// real combat change and should be caught here.
//
// Run:  node src/engine/combat/golden.test.mjs
//       node src/engine/combat/golden.test.mjs --print   (dump transcript + signature)
//
// No test framework (this app has none); plain node, exits non-zero on failure.

import { simulateAIvsAI } from './index.js';
import { makeUnitDef } from './roster.js';

const SEED = 1337;

// Balanced squad (pops Overload at 4) vs a Greedy squad (holds for 6) — exercises
// the temperament threshold, Burn ×2 windows, and a multi-creature block.
const squadA = [makeUnitDef('fizzwick', 'Balanced'), makeUnitDef('emberkit', 'Balanced')];
const squadB = [makeUnitDef('sparkjaw', 'Greedy'), makeUnitDef('emberkit', 'Greedy')];

// A compact, stable signature of the whole fight.
function signature(result) {
  let checksum = 0;
  for (const e of result.log) {
    const s = JSON.stringify(e);
    for (let i = 0; i < s.length; i++) checksum = (checksum * 31 + s.charCodeAt(i)) >>> 0;
  }
  return { winner: result.winner, rounds: result.rounds, events: result.log.length, checksum };
}

// EXPECTED — baked from a known-good run. Update deliberately when combat changes.
const EXPECTED = { winner: 'A', rounds: 6, events: 34, checksum: 1793265616 };

function fail(msg) {
  console.error(`❌ GOLDEN FAILED: ${msg}`);
  process.exit(1);
}

const r1 = await simulateAIvsAI(squadA, squadB, SEED);
const r2 = await simulateAIvsAI(squadA, squadB, SEED);

if (process.argv.includes('--print')) {
  for (const e of r1.log) console.log(JSON.stringify(e));
  console.log('SIGNATURE:', JSON.stringify(signature(r1)));
  process.exit(0);
}

// 1) Determinism: same seed + same squads ⇒ byte-identical transcript.
if (JSON.stringify(r1.log) !== JSON.stringify(r2.log)) {
  fail('non-deterministic — two runs at the same seed diverged');
}

// 2) Snapshot: matches the baked-in golden signature.
const sig = signature(r1);
for (const k of ['winner', 'rounds', 'events', 'checksum']) {
  if (sig[k] !== EXPECTED[k]) {
    fail(`signature.${k} = ${sig[k]}, expected ${EXPECTED[k]}\n  actual: ${JSON.stringify(sig)}\n  (re-run with --print to inspect; update EXPECTED only if the change is intended)`);
  }
}

console.log(`✅ GOLDEN PASSED — ${sig.winner} wins in ${sig.rounds} rounds (${sig.events} events, checksum ${sig.checksum})`);

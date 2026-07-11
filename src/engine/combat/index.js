// ─── Manual combat engine — public surface (§23/§24/§26) ────────────────────────
// The one interface, two swappable drivers. Import from here, not the inner files.
export { createBattleState, livingOnSide, enemiesOf, alliesOf, unitByUid, battleOver } from './state.js';
export { runBattle } from './engine.js';
export { createHumanDriver, createAIDriver } from './drivers.js';
export { SKILLS, getSkill, legalSkills } from './skills/index.js';
export { applyTemperament } from './doctrines.js';
export { COMBAT_CREATURES, makeUnitDef } from './roster.js';

import { createBattleState } from './state.js';
import { runBattle } from './engine.js';
import { createAIDriver } from './drivers.js';

// ─── simulateAIvsAI — the deterministic regression net (§26.4(2)) ───────────────
// Both sides AI-driven → every await resolves instantly → the whole fight is a pure
// function of (squads, seed). Same snapshot + same seed = same transcript, every
// run. This is the golden that replaces the retired auto-resolve goldens.
export async function simulateAIvsAI(squadA, squadB, seed) {
  const state = createBattleState(squadA, squadB, seed);
  const drivers = { A: createAIDriver(), B: createAIDriver() };
  return runBattle(state, drivers);
}

import { TEMPERAMENT_THRESHOLD } from './dials.js';
import {
  always,
  and,
  chargeAtLeast,
  anyEnemyHasStatus,
  lowestHpEnemy,
  lowestHpBurningEnemy,
} from './vocab.js';

// ─── Default doctrines (§24.1) ──────────────────────────────────────────────────
// A doctrine is an ORDERED ladder of rules. The AI walks top-down and fires the
// first rule whose condition is true (§24.0, gambit-style). The bottom rule's
// condition is `always` (the builder) so it never falls through.
//
//   rule = { condition(actor,state), skillId, select(actor,state,rng) -> [uids] }

// Reactor (§24.1):
//   1. charge ≥ threshold AND a Burning enemy exists → Overload it (the ×2 window)
//   2. charge ≥ threshold                            → Overload lowest-HP enemy
//   3. else                                          → Charge Up lowest-HP enemy
function reactorDoctrine(threshold) {
  return [
    {
      condition: and(chargeAtLeast(threshold), anyEnemyHasStatus('burn')),
      skillId: 'overload',
      select: lowestHpBurningEnemy,
    },
    {
      condition: chargeAtLeast(threshold),
      skillId: 'overload',
      select: lowestHpEnemy,
    },
    {
      condition: always,
      skillId: 'chargeUp',
      select: lowestHpEnemy,
    },
  ];
}

const DOCTRINE_BUILDERS = {
  Reactor: reactorDoctrine,
};

// §24.2 — temperament shifts the doctrine as a bundle. v1 surface = one knob per
// creature (Greedy / Balanced / Cautious), expressed here as the payoff threshold.
// The full reorderable gambit list is beta-depth, NOT v1.
export function applyTemperament(type, temperament) {
  const builder = DOCTRINE_BUILDERS[type];
  if (!builder) throw new Error(`No doctrine for Type: ${type}`);
  const threshold = TEMPERAMENT_THRESHOLD[temperament] ?? TEMPERAMENT_THRESHOLD.Balanced;
  return builder(threshold);
}

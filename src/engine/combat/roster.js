import { MAX_CHARGE } from './dials.js';

// ─── Combat roster (manual-combat pivot) ────────────────────────────────────────
// Fresh creature defs for the new Type system (§23.3) — Reactor only for now. These
// are deliberately separate from the legacy CREATURES (old Guardian/Echo/Swift/Spark
// archetypes the auto-resolve engine reads); the pivot lives in parallel until the
// review gate (§26.5). Stats are placeholder dials.
const REACTOR_KIT = ['chargeUp', 'overload', 'backdraft'];

export const COMBAT_CREATURES = [
  { id: 'fizzwick', name: 'Fizzwick', type: 'Reactor', hp: 220, atk: 30, speed: 5, maxCharge: MAX_CHARGE, skillIds: REACTOR_KIT },
  { id: 'emberkit', name: 'Emberkit', type: 'Reactor', hp: 240, atk: 26, speed: 4, maxCharge: MAX_CHARGE, skillIds: REACTOR_KIT },
  { id: 'sparkjaw', name: 'Sparkjaw', type: 'Reactor', hp: 200, atk: 34, speed: 6, maxCharge: MAX_CHARGE, skillIds: REACTOR_KIT },
];

export const COMBAT_CREATURES_BY_ID = Object.fromEntries(
  COMBAT_CREATURES.map((c) => [c.id, c])
);

// Build a squad entry from a roster id, stamping the AI temperament (§24.2) the
// defender side will run. Ignored by the human side.
export function makeUnitDef(id, temperament = 'Balanced') {
  const base = COMBAT_CREATURES_BY_ID[id];
  if (!base) throw new Error(`Unknown combat creature: ${id}`);
  return { ...base, temperament };
}

// ─── Combat dials (§23: "all numbers are placeholder dials — the Lab tunes them") ───
// The STRUCTURE is the point. Every number here is meant to be moved in the Lab.
// Keep balance values in this one file so tuning never means hunting through logic.

export const ROUND_CAP = 12; // §23.1 hard cap so stall can't win
export const ROUND_FLOOR = 5; // design target; not enforced, drives HP tuning

// Charge is the spine (§23.1). One pool per creature, built by acting.
export const MAX_CHARGE = 6;

// ── Burn: a damage-over-time status Reactors light and feed ──
export const BURN = {
  tickDmg: 12, // flat damage per stack at end of round
  decayPerRound: 1, // stacks lost each round after ticking
  maxStacks: 4,
};

// ── Reactor kit (§23.5) — Charge Up / Overload / Backdraft ──
export const REACTOR = {
  chargeUp: {
    chargeGain: 2, // +2 charge (§23.5)
    chipMult: 0.5, // builder still does something NOW (atk * mult)
    burnApply: 1, // drips a little Burn
  },
  overload: {
    minCharge: 2, // gate: "fire weak at 2 or hold for the bomb at 4+"
    base: 0.8, // atk multiplier floor
    perCharge: 0.6, // + per point of charge spent
    burningBonus: 2.0, // ×2 if the target is Burning (§23.5)
    // spends ALL charge
  },
  backdraft: {
    minCharge: 2,
    perCharge: 0.5, // line damage = atk * perCharge * charge vented
    burnApply: 1, // spreads Burn across the line
    // vents HALF the current charge
  },
};

// ── Temperament → payoff threshold (§24.2). One knob, three real defenses. ──
export const TEMPERAMENT_THRESHOLD = {
  Greedy: 6, // holds for the bomb, dies to rushdown
  Balanced: 4,
  Cautious: 2, // chips safely, never threatens the one-shot
};

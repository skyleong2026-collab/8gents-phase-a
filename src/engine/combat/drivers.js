import { legalSkills } from './skills/index.js';
import { applyTemperament } from './doctrines.js';

// ─── The driver seam (§26.0) ────────────────────────────────────────────────────
// The engine talks to ONE interface and NEVER branches on human-vs-AI:
//
//   driver.chooseNextActor(pool, state) -> creature   (ordering)
//   driver.decide(actor, state)         -> { skillId, targetIds }   (the move)
//
// A driver belongs to a SIDE, not a creature. Swap the side's driver and the same
// engine becomes PvE / Farm / Rivals / PvP (§26.0). Both methods may return a value
// OR a Promise — the engine awaits either, so the human's "await the tap" and the
// AI's instant decision flow through identical code.

// ── AI driver — a pure function of (state, doctrine, seed) ──────────────────────
// Guardrail §26.4(1): no wall-clock, no unseeded RNG. All randomness comes from
// state.rng (seeded in createBattleState), so a Rival/PvP defense replays exactly.
export function createAIDriver() {
  return {
    // §26.5: act in slot order unless a rule says otherwise. `pool` arrives in slot
    // order, so the front-most living creature acts next.
    chooseNextActor(pool /* , state */) {
      return pool[0];
    },

    decide(actor, state) {
      const doctrine = applyTemperament(actor.type, actor.temperament);
      for (const rule of doctrine) {
        if (rule.condition(actor, state)) {
          return { skillId: rule.skillId, targetIds: rule.select(actor, state, state.rng) };
        }
      }
      // The ladder's last rule is `always`, so this is unreachable in practice.
      throw new Error(`Doctrine for ${actor.type} fell through with no fallback rule`);
    },
  };
}

// ── Human driver — awaits a UI pick ─────────────────────────────────────────────
// The UI supplies two async resolvers. The engine doesn't know or care that these
// suspend on a player tap; it just awaits the returned Promise (§26.1).
//   requestActor(pool, state)            -> Promise<creature>
//   requestDecision(actor, legal, state) -> Promise<{ skillId, targetIds }>
export function createHumanDriver({ requestActor, requestDecision }) {
  return {
    chooseNextActor(pool, state) {
      // Only one creature left to act → no choice to make, act it automatically.
      if (pool.length === 1) return pool[0];
      return requestActor(pool, state);
    },

    decide(actor, state) {
      const legal = legalSkills(actor, state); // charge/cooldown-gated options
      return requestDecision(actor, legal, state);
    },
  };
}

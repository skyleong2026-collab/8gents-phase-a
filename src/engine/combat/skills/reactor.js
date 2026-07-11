import { REACTOR, BURN } from '../dials.js';
import { enemiesOf } from '../state.js';

// ─── Shared combat math ────────────────────────────────────────────────────────
// Skills are the *content* of applyDecision (§26.2: the one place combat math lives).
// Each skill's apply() mutates the state and returns a plain result object that the
// engine turns into one log/UI event — so the transcript is pure data.

function dealDamage(target, amount) {
  const dmg = Math.max(0, Math.round(amount));
  const before = target.hp;
  target.hp = Math.max(0, target.hp - dmg);
  const killed = before > 0 && target.hp === 0;
  if (killed) target.alive = false;
  return { uid: target.uid, name: target.name, dmg, killed, hpAfter: target.hp };
}

function applyBurn(target, stacks) {
  target.statuses.burn = Math.min(BURN.maxStacks, target.statuses.burn + stacks);
}

const isBurning = (u) => u.statuses.burn > 0;

// ─── Reactor (Fizzpop) — "hold or spend, tall or wide" (§23.5) ──────────────────
// Builder + charge-gated Payoff + Wildcard. Charge is the spine; the builder always
// also does something NOW so charging is never a dead turn (§23.1).

export const REACTOR_SKILLS = {
  // Builder — always usable, builds charge AND drips Burn + a chip right now.
  chargeUp: {
    id: 'chargeUp',
    name: 'Charge Up',
    kind: 'builder',
    blurb: '+2 charge, drip Burn + a chip on the target. Charging lights the fuse.',
    targetMode: 'enemy', // one enemy
    canUse: () => true,
    apply(actor, [target]) {
      if (!target) return { hits: [], note: 'no target' };
      const gain = REACTOR.chargeUp.chargeGain;
      actor.charge = Math.min(actor.maxCharge, actor.charge + gain);
      applyBurn(target, REACTOR.chargeUp.burnApply);
      const hit = dealDamage(target, actor.atk * REACTOR.chargeUp.chipMult);
      return { hits: [hit], chargeGained: gain, burned: [target.uid] };
    },
  },

  // Payoff — charge-gated big hit, ×2 vs a Burning target. Spends ALL charge.
  overload: {
    id: 'overload',
    name: 'Overload',
    kind: 'payoff',
    blurb: 'Spend all charge for a big hit. ×2 if the target is Burning.',
    targetMode: 'enemy',
    canUse: (actor) => actor.charge >= REACTOR.overload.minCharge,
    apply(actor, [target]) {
      if (!target) return { hits: [], note: 'no target' };
      const spent = actor.charge;
      let mult = REACTOR.overload.base + REACTOR.overload.perCharge * spent;
      if (isBurning(target)) mult *= REACTOR.overload.burningBonus;
      actor.charge = 0;
      const hit = dealDamage(target, actor.atk * mult);
      return { hits: [hit], chargeSpent: spent, amplifiedByBurn: isBurning(target) };
    },
  },

  // Wildcard — vent HALF the charge to hit the whole enemy line + spread Burn.
  backdraft: {
    id: 'backdraft',
    name: 'Backdraft',
    kind: 'wildcard',
    blurb: 'Vent half your charge to hit the whole enemy line and spread Burn.',
    targetMode: 'allEnemies',
    canUse: (actor) => actor.charge >= REACTOR.backdraft.minCharge,
    apply(actor, _targets, state) {
      const vented = Math.floor(actor.charge / 2);
      actor.charge -= vented;
      const line = enemiesOf(state, actor);
      const hits = line.map((e) => {
        applyBurn(e, REACTOR.backdraft.burnApply);
        return dealDamage(e, actor.atk * REACTOR.backdraft.perCharge * vented);
      });
      return { hits, chargeSpent: vented, burned: line.map((e) => e.uid) };
    },
  },
};

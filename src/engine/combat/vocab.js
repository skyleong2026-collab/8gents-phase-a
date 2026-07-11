import { enemiesOf, alliesOf } from './state.js';

// ─── AI vocabularies (§26.3) ────────────────────────────────────────────────────
// Tiny, shared with the trigger language. Conditions are predicates of (actor,
// state); selectors pick target unit(s) using state.rng for deterministic ties.
// Keep this list small — it IS the language a defender will eventually tune, and
// the puzzle the attacker reads (§24.0 "legible, not a black box").

// ── Conditions ──
export const always = () => true;
export const chargeAtLeast = (n) => (actor) => actor.charge >= n;
export const selfBelowPct = (x) => (actor) => actor.hp / actor.maxHp < x;
export const enemyBelowPct = (x) => (actor, state) =>
  enemiesOf(state, actor).some((e) => e.hp / e.maxHp < x);
export const allyBelowPct = (x) => (actor, state) =>
  alliesOf(state, actor).some((a) => a.hp / a.maxHp < x);
export const isFirstAction = () => (actor, state) => !state.firstActionDone;
export const anyEnemyHasStatus = (status) => (actor, state) =>
  enemiesOf(state, actor).some((e) => (e.statuses[status] || 0) > 0);

// Combine conditions (top-down ladder rules, §24.0).
export const and =
  (...conds) =>
  (actor, state) =>
    conds.every((c) => c(actor, state));

// ── Target selectors → always return an ARRAY of uids (§26.1 returns targetIds) ──
// rng is passed in so ties are seed-deterministic.
function pickTied(pool, score, rng, prefer = 'min') {
  if (pool.length === 0) return [];
  const vals = pool.map(score);
  const best = prefer === 'min' ? Math.min(...vals) : Math.max(...vals);
  const tied = pool.filter((u, i) => vals[i] === best);
  return [tied[Math.floor(rng() * tied.length)]];
}

export const lowestHpEnemy = (actor, state, rng) =>
  pickTied(enemiesOf(state, actor), (u) => u.hp, rng, 'min').map((u) => u.uid);

export const biggestThreatEnemy = (actor, state, rng) =>
  pickTied(enemiesOf(state, actor), (u) => u.atk, rng, 'max').map((u) => u.uid);

// Lowest-HP enemy that is currently burning (Reactor wants the ×2 Overload, §23.5).
export const lowestHpBurningEnemy = (actor, state, rng) => {
  const burning = enemiesOf(state, actor).filter((e) => (e.statuses.burn || 0) > 0);
  return pickTied(burning, (u) => u.hp, rng, 'min').map((u) => u.uid);
};

export const lowestHpAlly = (actor, state, rng) =>
  pickTied(alliesOf(state, actor), (u) => u.hp, rng, 'min').map((u) => u.uid);

export const highestChargeAlly = (actor, state, rng) =>
  pickTied(alliesOf(state, actor), (u) => u.charge, rng, 'max').map((u) => u.uid);

export const selfTarget = (actor) => [actor.uid];
export const allEnemies = (actor, state) => enemiesOf(state, actor).map((u) => u.uid);

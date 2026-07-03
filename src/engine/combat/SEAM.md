# SEAM.md — the §26 Engine Seam (the Driver Interface)

> The combat engine talks to **one** interface and never branches on
> human-vs-AI. This is the keystone seam from GDD **§26 — Engine Seam Spec**.
> Build new combat behaviour *behind* this interface, never around it.

This module (`src/engine/combat/`) is the **additive** manual-combat engine. It
lives entirely beside the original auto-resolve engine
(`src/engine/battleStepEngine.js` / the `resolveBattle` path) and shares no code
with it. Nothing in `battleStepEngine.js` imports this module and nothing here
imports it — the two engines are fully independent.

---

## The interface (§26.0–26.1)

The engine speaks to **one** object shape, a `Driver`. A driver answers two
questions per turn and nothing else:

```javascript
Driver.chooseNextActor(pool, state)  -> creature              // action ORDER
Driver.decide(actor, state)          -> { skillId, targetIds } // the move
```

Both methods are **async** so a human driver can `await` a tap while an AI
driver resolves instantly. The engine `await`s both identically and never knows
which is which.

A **driver belongs to a SIDE, not a creature.** Your whole squad shares one
driver; the enemy squad shares another. That side-level swap point is the entire
point of the seam:

| Mode | Side A driver | Side B driver |
|------|---------------|---------------|
| PvE (manual play) | `HumanDriver` | `AIDriver` |
| Farm (cleared content) | `AIDriver` (your taught doctrines) | `AIDriver` |
| PvP / Rival | `HumanDriver` (you) | `AIDriver` (their build) |
| Golden / sim | `AIDriver` | `AIDriver` |

### The two drivers — [`drivers.js`](drivers.js)

- **`createAIDriver()`** — `chooseNextActor` returns slot order; `decide` walks
  the actor's temperament-adjusted doctrine ladder, first legal match wins,
  falling back to the always-legal builder. Pure function of `(state, doctrine,
  seed)` (see guardrail 1).
- **`createHumanDriver({ requestActor, requestDecision })`** — both methods just
  return the UI's promises. The screen supplies the two callbacks; the engine
  awaits them exactly like it awaits the AI's instant answer.

### The fixed-round loop (§26.2) — [`engine.js`](engine.js)

`runRound` resolves the side that wins initiative as a **whole block**, then the
other side's block — not interleaved by individual speed. Within a block the
side's driver picks which living creature acts next, one at a time, so you can
react inside your own turn (watch Amplify land, then send the Reactor).

`applyDecision` is the **only** function that touches combat math, and it is
identical for both drivers. The seam routes *who chooses*, never *what a skill
does* → exactly one set of skill logic.

### AI vocabulary (§26.3) — [`vocab.js`](vocab.js) + [`doctrines.js`](doctrines.js)

A doctrine ladder is written in a tiny set of **conditions**
(`chargeAtLeast`, `enemyBelowPct`, `allyBelowPct`, `isFirstAction`,
`selfBelowPct`, `anyEnemyHasStatus`, `always`, …) and **target selectors**
(`lowestHpEnemy`, `biggestThreatEnemy`, `lowestHpAlly`, `highestChargeAlly`,
`selfTarget`, `allEnemies`, …). `applyTemperament` shifts payoff thresholds
across Greedy / Balanced / Cautious.

### Guardrails (§26.4)

1. **`AIDriver` is a pure function of `(state, doctrine, seed)`.** No wall-clock,
   no unseeded RNG — every tie-break and selector draws from `state.rng`
   ([`state.js`](state.js)), seeded once at battle start. Same snapshot + same
   seed ⇒ same defence, every replay.
2. **The golden is a fixed-seed AI-vs-AI fight.** `simulateAIvsAI(a, b, seed)`
   ([`index.js`](index.js)) drives both sides with `AIDriver`, so every `await`
   resolves synchronously and the transcript is reproducible byte-for-byte. The
   regression net is [`scripts/manual-golden.mjs`](../../../scripts/manual-golden.mjs)
   (+ the per-Type `manual-golden-*.mjs` fixtures). These goldens are sacred:
   any change that alters an AI-vs-AI outcome at a fixed seed is a real combat
   change and must be caught.

---

## The three constraints (locked monetization decision, GDD §30, 2026-06-10)

These are **permanent** rules the seam upholds. They are not implemented *by* the
seam — they are properties the seam must never violate. Each was verified against
the code in `src/engine/combat/`.

### 1. Store-agnostic — placeholder interface only

No store exists now and none is built until retention (run-#2 / run-#20)
validation. **But the seam must not assume a store *never* exists either.**

How the seam honours it: the Driver interface is a pure **combat** seam — it has
**no store logic, no SKU types, and no payment plumbing**, so there is nothing to
remove if/when a store is built, and nothing that forecloses one. A future store
lives in its own module and never reaches through this interface. *Do not* add
SKU/price/checkout fields to `Driver`, `state`, or a unit def.

### 2. Slag is unpurchasable, permanently

**No code path may grant slag from anything other than gameplay.** The seam never
touches slag at all: the combat engine only mutates HP / charge / statuses and
emits events. Slag is awarded by the **run/reward layer** outside this module,
from cleared content only. *Do not* add a slag (or any currency) grant inside the
combat module, and never wire a money/IAP path to one.

### 3. Type-accent colour is gameplay signal — never cosmetic

A creature's **Type** (`Reactor` / `Bulwark` / `Mender` / `Striker` / `Assassin`
/ `Booster` / …) is a gameplay field on the unit — it selects the doctrine ladder
and support passives. Its **accent colour** is a combat-legibility signal derived
from Type in the UI; the seam never stores or reads colour as a field, and
nothing here treats accent colour as a customizable or cosmetic property. The
only UI-only field on a unit, `spriteId`, is explicitly documented as
"never read by combat math" ([`state.js`](state.js)). *Do not* add a per-unit
`color` / `accent` / `skin` field that combat reads, and never make accent colour
sellable — cosmetics are restricted to zero-combat-information channels.

---

*If a future §26 change would conflict with any of the three constraints above,
stop and surface it — these are locked in §30 and are not a build-time call.*

# R3 — Recipe Seasoning: sweep findings (branch `r3-recipe-seasoning`)
*2026-06-11, Opus. Built on a branch (NOT merged) because the vF-CF gate says don't perturb the
ring ladder before Sky's manual R3 playtest, and the sweep below shows two seasonings need his
tuning call. Implementation is complete + goldens byte-identical; the VALUES are the open question.*

## What shipped on the branch
Each of the 11 Team Recipes now carries a `season.apply(m)` (in `src/data/recipes.js`). When the
fielded squad cooks a recipe, `applySeasoning` folds ONE seasoning (first lit in book order) into
the run's squad mods — wired in the game (`perkBaseMods` chain, 3 run-start sites) and mirrored in
the sim (`run-sim-tier2.mjs`, same `recipes.js`, so they can't drift). The squad-pick chip names
the live seasoning on the one recipe that fires (`✦ <label>`), folk-honestly.

Engine: 9 seasonings reuse existing run-mods; 3 tiny opt-in reads added (`thornsBonus` in
combatMath, `vulnBonus` ×3 in hexer, `blitzFirstBonus` in striker) — all default-0, so **all six
golden checksums are byte-identical** (goldens never cook a recipe / never touch `playerDef`).

## The sweep — PRUNS=200 GEAR=1 --depths, before (main) vs after (branch)
Only the 4 recipe-cooking sweep squads move; the other 6 are unchanged (clean isolation). The
ladder still descends R1→R8 (no ring jumps rank), but the magnitudes split sharply:

| recipe (squad) | lever | max win-rate swing | verdict |
|---|---|---|---|
| **THE FIRST POUNCE** (Striker Rush) | `blitzFirstBonus +0.15` (one first-strike mult) | **+5pp** | ✅ in-lane, mild — the target |
| **THE PYRE PACK** (Live Anchor) | `burnBonus +1` (a burn stack EVERY round) | **+33pp** (R5 .23→.56) | ❌ too strong |
| **THE PYRE PACK** (Mono Reactor) | `burnBonus +1` | +18pp | ❌ strong |
| **THE WIDOWING** (Hex Synergy) | `vulnBonus +1` (a vuln stack on EVERY hit) | **+22pp** (R2 .35→.57) | ❌ too strong |

colMean by ring (before → after): R2 .75→.81 · R3 .76→.82 · R4 .67→.70 · R5 .37→.44 · R6 .41→.47
· R7 .23→.25. R1/R8 unchanged (ceiling/floor).

## The finding (the real lesson)
A flat **+1 on a recurring or team-wide lever compounds**: an extra burn stack ticks every round;
an extra vuln stack multiplies every squadmate's hit on that target. So `burnBonus +1` and
`vulnBonus +1` are 3–6× too hot — they make the seasoning the *reason* to field the recipe, which
the collection-engine doc explicitly forbids ("never let the label become the reward"). One-shot
levers (`blitzFirstBonus`, `extraHits`, `executeWindow`, `chargeStart`) land in the right ~+5pp
band because they fire once, not every round.

## Recommendation (Sky's call — the gate reserves this)
1. **Keep** the one-shot seasonings as-is (FIRST POUNCE / STORMCOURT / PATIENT KNIFE / BELLOWS).
2. **Soften the recurring/multiplicative ones.** Integer mods can't do "+0.5 a stack", so either:
   - (a) make `burnBonus`/`vulnBonus` *fractional damage* riders instead of stack counts (small
     engine change — a `burnMult`/`vulnMult` read), tuned to ~+5pp; or
   - (b) re-lever those recipes onto a one-shot bonus (e.g. PYRE PACK → `extraHits`-style or a
     small `dmgMult` only-vs-burning; WIDOWING → a one-time vuln burst, not a per-hit +1).
3. Re-run this sweep after picking values; merge when every recipe lands in the ~+5–10pp band and
   the ladder still descends.

Baseline + after JSON: `/tmp/r3_baseline.json`, `/tmp/r3_after.json` (regenerate with the command
above). Goldens green, lint/build clean. Nothing merged to main.

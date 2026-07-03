# Ringward Tactics — Skill Tree Spec (6 launch classes)

Replaces the 2-rank placeholder `TREES` in `ringward-tactics.html` with a deeper, on-doctrine
design. **Draft for Sky / a Fable pass** — trees are a long-shadow balance decision.

## Design principles
1. **Certainty, not percentages.** Per the plan's north star — XCOM sells *engineered certainty*.
   Picks should change a *decision* (a guaranteed hit, a reveal, a free action, a save), not just
   nudge a number. Flat `+aim/+HP` is fine for early/identity ranks, but every tree must culminate
   in real *tools*.
2. **The Humanity fork is the spine.** Each rank is pick-1-of-2; from Rank 2 on, the **B side is a
   monster-graft** — stronger, costs Taint↑ / Humanity↓. Grafts escalate down the tree. This IS the
   game's identity (becoming the thing you fight).
3. **Graft picks should advance the sprite.** The `<class>-taint1/-taint2` art already exists — a
   first graft → taint1 sprite, a second → taint2. Free, huge visual payoff. (Wire later.)
4. **Levers** are tagged **[exists]** (engine already supports the field) or **[NEW]** (needs a small
   engine read — listed in §Implementation). Promotion is currently per-kill in-mission.

---

## Sharpshooter — *the long shot* (ranged deletion, high ground, overwatch)
| Rank | A (human-lean) | B |
|---|---|---|
| **1** | **Deadeye** [exists] — crit climbs the farther the shot lands | **Steady Hands** [exists] — +1 guaranteed hit / mission |
| **2 · fork** | **Field Scope** [exists] · +2 sight, +5 aim (kill from the dark) | **Shard Eye** [graft T+22 H−16] [exists] · see through fog & walls |
| **3 · fork** | **Killzone** [NEW] · Overwatch fires at *every* enemy that moves in LOS this turn, not just the first | **The Lance** [graft T+28 H−20] [NEW] · once/mission a shot that **cannot miss and ignores cover** — a guaranteed delete |

## Ironclad — *the wall* (frontline soak, hold a lane)
| Rank | A | B |
|---|---|---|
| **1** | **Bulwark** [exists] — +4 HP | **Close Quarters** [exists] — +8 aim at point-blank (scattergun) |
| **2 · fork** | **Trench Plate** [exists] · +6 HP | **Monster-Hide** [graft T+24 H−18] [exists] · +12 HP, regrow 2/turn |
| **3 · fork** | **Anchor** [NEW] · while Hunkered, adjacent allies are harder to hit (a *guard* — team positioning certainty) | **Stone Carapace** [graft T+28 H−22] [NEW] · the **first hit each mission is fully negated** (guaranteed save) |

## Bombardier — *the boom* (AoE, cover-breaking, area denial)
| Rank | A | B |
|---|---|---|
| **1** | **Heavy Ordnance** [exists] — +1 grenade | **Shrapnel** [exists] — +2 grenade damage |
| **2 · fork** | **Sapper** [exists+] · +1 grenade; grenades **guarantee-strip cover** in the blast | **Blight Charges** [graft T+20 H−14] [exists] · +4 grenade damage |
| **3 · fork** | **Bombardment** [NEW] · once/mission, a lob with **+1 blast radius** | **Living Ordnance** [graft T+28 H−20] [NEW] · grenade leaves a **blight zone** that denies the tiles for 2 turns (area control) |

## Sawbones — *the mender* (sustain, the grief/anti-permadeath anchor)
| Rank | A | B |
|---|---|---|
| **1** | **Triage** [exists] — +1 heal charge | **Stimulants** [exists] — +3 healing |
| **2 · fork** | **Surgeon** [exists+] · +1 heal; a heal also **clears a wound** | **Grafted Organs** [graft T+22 H−16] [exists] · +3 healing, +4 own HP |
| **3 · fork** | **Field Hospital** [NEW] · once/mission **revive a soldier downed this turn** — the anti-permadeath tool (ties to the grief system) | **Blood Transfusion** [graft T+28 H−22] [NEW] · a heal also gives the target a **guaranteed next shot** (offensive medic) |

## Outrider — *the scout* (mobility, recon, flank-maker, flyer-counter)
| Rank | A | B |
|---|---|---|
| **1** | **Pathfinder** [exists] — +1 mobility | **Hunter's Eye** [exists] — +1 Mark |
| **2 · fork** | **Scout** [exists] · +2 sight, +1 mobility | **Wing-Graft** [graft T+24 H−18] [exists] · **FLY** (ignore terrain), +1 mobility |
| **3 · fork** | **Run & Gun** [NEW] · once/turn, **move and still shoot** (action-economy tool) | **Pounce** [graft T+28 H−22] [NEW] · a **guaranteed-hit leap** onto a target after moving (mobility kill) |

## Bannerman — *the heart* (morale, action economy, the team enabler / Humanity anchor)
| Rank | A | B |
|---|---|---|
| **1** | **Inspire** [exists] — +1 Rally | **Veteran** [exists] — +6 aim |
| **2 · fork** | **Officer** [exists] · +1 Rally | **Drop-Resonance** [graft T+20 H−14] [exists] · +1 Rally, +5 aim |
| **3 · fork** | **Standard Bearer** [NEW] · allies near the Bannerman **graft for less Taint / hold their Humanity** — the human anchor (fits the grief pillar) | **Dread Banner** [graft T+30 H−24] [NEW] · once/mission a battle-cry granting the **whole squad a free action** (the big team-combo — heavy Taint) |

---

## Implementation notes
- **[exists] levers** already in `makeUnit`/`applyPick`: aim, maxHp/hp, crit, critAtRange, mobility,
  sightBonus, dmgBonus, grenades, grenadeBonus, heals, healBonus, marks, rallies, sureMax/sureShots,
  regen, flying, seeAll, taint, humanity. The Rank-1/2 picks above are buildable today.
- **[NEW] (Rank-3 tools)** each need one small engine read, all opt-in (no golden unit carries them):
  overwatch-fires-multiple; first-hit-negate (per-mission shield flag); revive-downed-this-turn;
  cover-strip-on-grenade; blast-radius+1; blight-zone tiles; run-and-gun (move keeps 1 action);
  guaranteed-leap-melee; squad-wide free action; aura that reduces ally graft Taint.
- **Graft → sprite swap:** when a soldier takes their first/second graft, swap their sprite to
  `<class>-taint1.png` / `-taint2.png` (art exists). Pure visual; do alongside the graft picks.
- **Pacing:** 3 ranks ≈ 3 promotions. If that's too slow under per-kill promotion, gate Rank 3 behind
  "survived a mission" (the M1.5 note) rather than raw kills.
- **Cross-system hooks (deliberate):** Sawbones *Field Hospital* + Bannerman *Standard Bearer* both
  feed the grief/Humanity system — the medic fights permadeath, the heart slows the team's fall.

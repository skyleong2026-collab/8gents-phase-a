# The Hollow Span — prototype findings & direction notes
_For a step-back strategy conversation. Drafted 2026-06-13._

This started as the **Ringward "Hollow Span" v0 brief**: test whether 3 open-ended verbs
(Crest/Drift/Pressure) × one systemic world produce many distinct decisions, or collapse
into one memorized line. Over several iterations it evolved well past that. Here's what we
actually learned — the useful input for deciding Ringward's direction.

## What LANDED (keep these)
- **The explore-under-fog map feel.** Sky's strongest positive: "I love the new map feel."
  A world bigger than the screen + fog of war is the keeper.
- **Fog of war is the cure for the autopilot problem.** When the whole board was visible,
  every version collapsed into one optimal line (race the tide; go to the route with more
  alcoves). Hiding the global view forces *local* decisions and kills the exploit. Sky's own
  insight: "players always seek patterns — just give them lots of patterns."
- **Skill-dependent searching / conquering / achieving** is the loop that resonates.
- **Soft stakes.** "The sale, not the whole purse" — losing a run costs the run, never the
  meta-progress. No pervasive death/time pressure.

## What Sky REACTED AGAINST (avoid)
- **A whole world pressuring you / a rising-tide clock.** Frustrating. He wants something to
  *overcome*, not a constant countdown.
- **One-laned, terrain-only, abstract skills.** "Surge/Drift/Pressure/Crest all sound the
  same." Wants concrete names (Jab/Dash/Shove/Rise), distinct graphics, and real impact/juice.
- **Anticlimactic +1-charge upgrades.** Wants upgrades that transform how you play.

## Where it's HEADING (current direction)
- **Combat buildcraft** (Sky's pick) — skills as weapons, creatures as real enemies to fight.
- **An "ultimate build" to assemble across runs** (Sky's pick) — currently "The Tempest"
  (3 mod-pieces hunted across runs; each permanently transforms a skill; visible track).
- A→Z skill ladder proposed: Tool → +1 mod → stacked mods → identity keystone → signature
  move. Three archetype "Z"s imagined: **Storm** (started), **Mountain**, **Bladewraith**.

## THE central viability question for the strategy chat
This prototype is a **single-body, explore + real-time-combat + buildcraft ARPG**.
Ringward today (per the repo) is a **squad/auto-battler + manual-combat roguelite**.
They are different games wearing the same world. The real decision isn't a mechanic — it's:

> **Should Ringward pivot/expand toward this single-body explore-combat-buildcraft direction,
> or stay its current form — and is that pivot worth the time, given everything else on Sky's
> plate?**

Sub-questions worth bringing:
- Is this a *new* game, a *mode* inside Ringward, or a *replacement* for the current Ringward loop?
- Scope/effort vs. Sky's other commitments (NoteScreen, Pono Path, acquisition research).
- What's the win condition for Sky personally — shipping something, the craft of it, a business?
- The proven keepers (fog exploration, soft stakes, buildcraft) could fold into Ringward
  *without* a full pivot. Worth weighing the cheaper path.

## The prototype itself
`~/8gents/proto/hollow-span/index.html` — single throwaway file, runs in a browser.
Controller + keyboard, fog map, 4 combat skills, enemies, the Tempest ultimate-build track,
extract-and-bank with persistent upgrades. Programmer art. Disposable on purpose.

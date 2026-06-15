# Ringward Tactics — TODO / backlog

Running list for the Tactics game (`public/ringward-tactics.html`). The *design* canon is
`~/.claude/plans/foamy-enchanting-seahorse.md`; this is the work queue. Newest asks at top.

## ★ NEW — Bereavement / grief + voice vignettes (Sky, 2026-06-14)
Sky is having **voice vignettes** made — character **faces + lines shown on screen** when a unit
speaks. Build the system around them:
- **Portrait-vignette UI:** when a soldier's VO/bark fires, show their face + line on screen
  (ties into the existing `bark()`/VO hook). Drop-in once the vignette art lands.
- **Grief on permadeath:** when a teammate is lost (Ironman, or a gravely-wounded death),
  surviving soldiers — *especially those who served alongside them* — react with a **sad portrait
  vignette + a grief VO line**.
- **Grief as a recoverable stat:** model the loss as a **Morale / grief hit** (a new stat, or a
  Humanity dip) that **takes time to heal** — rest at the Frontier (Hall / a mourning period across
  missions). This is Sky's "characters need time to heal from a stat" note.
- **Why it fits:** reinforces the existing **Humanity↓**, the **Cairn** memorial, and the
  Infirmary/Hall rest loop — cost lands through the people, not just the numbers. Strongly on-theme.

## ★ DESIGN-OPEN — Pairing / bonds + team combo moves (Sky asked, 2026-06-14)
> "Do we want pairing-up + team combo bonus moves like XCOM, or is that too much in the same direction?"
- **Recommendation: don't add straight XCOM-2 combos.** The plan explicitly warns *"the danger from
  here is adding too much XCOM"* — bonds/combo-actions are the single most XCOM-derivative feature,
  and the differentiators (Humanity/Taint, hybridization, rings, the Forge) are where energy should go.
- **BUT** there's a Ringward-native version: tie **bonds to the grief/Humanity pillar** — soldiers
  who fight side by side form bonds; **losing a bonded partner is the *big* grief/Humanity hit**
  (raising permadeath's emotional stakes), and any shared combo move is a *secondary* perk. In that
  framing, bonds **reinforce the grief/vignette direction above** instead of competing with it.
- **Verdict:** defer to post-launch; if pursued, make it serve grief/Humanity, not just tactics.
  (Fable-tier design call.)

## Game-side (me — the game-file instance)
- [ ] Wire portrait vignettes into `bark()`/VO when the art lands (above).
- [ ] Grief / Morale stat + recovery loop (above).
- [ ] Commit the uncommitted **camera batch** (enemy-turn follow + camera-on-select + pan-to-target) when Sky says.
- [ ] Ground full polish: move from per-tile textures to one large painted ground per map (kills seams/repetition) — needs an art asset; current dark-wash is a stopgap.

## Audio instance
- [ ] Finish the remaining ~46 VO lines (only ~9 of ~55 rendered) — render to `docs/ringward-tactics-vo-manifest.json` filenames.
- [ ] Re-render the **Spotter** with a less-robotic voice (manifest `quality_note`: expressive voice, lower stability).
- [ ] Render the **tutorial as 12 separate clips** (`spotter-tut-01..12`), not one combined clip.
- [ ] A dedicated **tense battle track** for combat (the epic one is correctly the menu theme).
- [ ] New **SFX** with no source yet: gunshot, grenade blast, melee, move-step, UI click.

## Recently shipped (for context)
Reskin merged · 16×11 map + slide/zoom/follow camera · env-art wired (FOW-aware) · audio engine +
settings panel · spoken tutorial · animated route line (real path) + cover-edge indicator ·
stealth/surprise (wake on approach/fire, not sight) + slower/paced movement · camera follows the
action on both turns.

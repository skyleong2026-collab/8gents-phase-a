# Ringward Tactics — TODO / backlog

Running list for the Tactics game (`public/ringward-tactics.html`). The *design* canon is
`~/.claude/plans/foamy-enchanting-seahorse.md`; this is the work queue. Newest asks at top.

## ★ OVERNIGHT 2026-06-15 — iPad controls + mobile + screen polish (SHIPPED)
- **iPad/touch:** added the missing `<meta viewport>` (was absent → iPad rendered at desktop width and
  shrank everything); **two-finger pan + pinch-zoom** on the board (one finger = tap-to-select / page
  scroll); `touch-action:pan-x pan-y` on `#boardvp`. Verified via synthetic TouchEvents (pan+zoom) and
  tap-still-selects.
- **Responsive layout:** combat stacks board-over-panel < 1100px; town grid reflows to 2-up on phones;
  meta/panel go full-width; verified at 820px (iPad) and 390px (phone), no horizontal overflow.
- **Frame polish (in code):** framed wanted-poster intro story panel + "By order of the Frontier
  Company" footer; faint timber seams behind town tiles; skill-tree **Human path / Graft path** column
  headers; ↺ Story button in town to replay the intro.
- **⚠ Claude Design handoff BLOCKED (could not complete autonomously):** opened the Ringward Tactics
  Claude Design project in Sky's Chrome and started a fresh chat, but **could not get the current file
  in**. Three paths all blocked by browser security: (1) "Attach file" opens a native OS file picker —
  not drivable (browser is read-tier in automation); (2) cross-origin fetch from a local CORS server is
  blocked by Chrome's HTTPS→localhost private-network policy; (3) hand-pasting 170KB base64 is
  impractical. **For Sky:** it's a 10-second manual step — in the open Claude Design project, click + →
  Attach file → pick `~/8gents/public/ringward-tactics.html`, then ask it to restyle the intro/town/
  skill-tree screens in the Wanted Poster direction. (The project tab is left open.) Did the design
  polish in code instead — safer than a blind full-file merge anyway.

## ★ NEW — Game frame: intro + visual town + skill-tree map (Sky, 2026-06-15)
Sky's asks after first playing the deployed build:
- **Intro / story upfront** — an opening screen that introduces the world (the Drop, the frontier
  militia, becoming-monster) before the player lands in the base. **Needs an intro picture.**
- **Visual town** — replace the text Frontier with a **clickable town**: buildings you click into to
  work on different aspects (War Table=deploy, Forge, Infirmary, Watchtower, Hall, Cairn, Skill Trees,
  Company). Built on the canonical plan Frontier (4 buildings + Cairn). **Needs town/building art.**
- **Skill-tree map screen** — a dedicated section showing each class's tree on an **artistic
  background**. Built from `TREES` (viewer; picks still happen on rank-up in combat). **Needs a
  skill-tree background image.**
- STATUS: structural build (intro screen + visual town + tree-map screen) SHIPPED with styled
  placeholders; the 3 art pieces above are the open art asks → see art brief.
- Deployed as its own public project: **ringward-tactics.vercel.app** (separate from the collection
  game's 8gents project). Redeploy after each change with the `/tmp/ringward-tactics` static deploy.

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

## Skill trees (spec'd — `docs/RINGWARD-TACTICS-SKILL-TREES.md`)
- [ ] Implement the deeper 3-rank trees per the spec (R1/R2 buildable on existing levers; R3 "certainty tool" picks need small opt-in engine reads). Graft picks should swap the unit to its `-taint1/-taint2` sprite. Awaiting Sky/Fable sign-off on the spec.

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

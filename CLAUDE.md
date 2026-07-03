# Ringward (~/8gents) — build rules for Claude Code

React/Vite roguelite. Production: https://8gents.vercel.app (team jon-leong-s-projects, `--archive=tgz`).
Live docs: `docs/RINGWARD-COLLECTION-DESIGN.md` (current lane), `docs/RINGWARD-DEPTH-LADDER.md`,
`docs/RINGWARD-LORE-BIBLE.md`, `docs/BUILD-QUEUE.md` (the work queue for unattended runs).

## Model tiering — match the model to the work, and SAY SO
At the start of any task, classify it. **If the work's tier doesn't match the model you're running
on, tell Sky before starting** ("this is Sonnet-tier work — want to switch and save the window?" /
"this is a one-shot design call — worth Fable"). In unattended queue runs, the item's MODEL tag governs.
- **Fable** — one-shot design decisions with long shadows: new systems, balance philosophy,
  economy rules, anything that everything downstream implements. Wrong answers cost weeks.
- **Opus** — engine-adjacent implementation (anything near `src/engine/`), balance tuning with
  sims, refactors with drift risk (game↔sim mirrors), multi-file work needing judgment calls.
- **Sonnet** — fully-spec'd UI slices, copy/role lines, mechanical refactors, doc updates,
  running existing scripts. If the spec answers every question, it's Sonnet work.

## Non-negotiables
- **Goldens are sacred.** `npm test` must stay green; golden transcripts byte-identical unless a
  task EXPLICITLY re-anchors them (then tag the EXPECTED edit with why). New behavior must be
  opt-in via mods/statuses no golden unit carries. Innates etc. live at the RUN layer
  (`playerDef` / waves.js), never on `COMBAT_CREATURES` defs.
- **Sim-first tuning.** `PRUNS=200 GEAR=1 node scripts/sim/run-sim-tier2.mjs --depths` before/after
  any balance-touching change; record ladders in `docs/RINGWARD-DEPTH-LADDER.md`.
- **Shared working tree.** An art instance owns `src/App.jsx`, `src/screens/{Bestiary,BossArena,
  Cinema,Director}.jsx`, `public/art/**`, `scripts/pixellab/**`. Never commit or revert those from
  a build session. Commit ONLY files you changed for your slice.
- **Verify before reporting.** Lint changed files (`npx eslint <file>` — repo-wide lint has
  pre-existing art-instance errors), `npm run build`, `npm test`, and a live Playwright check for
  UI changes (pattern: `/tmp/rw_*.py`, headless Chrome, seed localStorage, assert text).
- **Secrets:** PixelLab key lives in `scripts/pixellab/.env` (gitignored). Never in game code —
  Vite ships it to the browser. Never commit it.
- **Version cuts** (vF-XX) only when Sky says cut, or at the end of a verified unattended slice.
  Don't bump the on-screen VERSION (lives in App.jsx — art instance's file).
- Commits end with: `Co-Authored-By: Claude <the model that did the work>`.

## Current gates (2026-06-10)
- vF-CF (manual first-clears, keystone oaths, mirror elites) awaits Sky's R3 manual playtest.
  **Don't re-tune carriers or the R3 ladder until that look happens.**
- R3 cognitive-load watch: if Sky reports overload, the planned fix is moving the first mirror
  carrier to R4 — not softening any single system.

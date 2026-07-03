# Sonnet handoff — PixelLab production work for Ringward

Paste the section below into a fresh Sonnet session. Everything it needs is on disk.

---

You're continuing **PixelLab (PL) art-pipeline work** for **Ringward**, a 2D creature
roguelite at `~/8gents` (React/Vite). The goal: turn each creature's one locked painted
sprite into animated, in-game state frames (idle/attack/hurt/death) and decide the final
art look. An Opus session already built and validated the pipeline; you're taking over the
**production grind + iterative tuning**.

## STEP 0 — read these first (do not skip)
1. `scripts/pixellab/PIXELLAB-NOTES.md` — the single source of truth: endpoints, caps,
   costs, every request gotcha, the look-vs-endpoint map. **Read fully before spending.**
2. `scripts/pixellab/README.md` — quickstart + lessons.
3. The CLI + helpers: `scripts/pixellab/pixellab.mjs` (exported `loadKey/imageObject/awaitJob/
   saveAssets/authHeaders/BASE`). Drivers: `batch-test.mjs`, `content-batch.mjs`.

## HARD RULES (each was paid for in debugging)
- **Money is real.** Account = Tier 1 (Pixel Apprentice), ~1,980 of 2,000 images/month left.
  `node scripts/pixellab/pixellab.mjs --check` is FREE and shows balance. ALWAYS dry-run a
  driver (no `--go`) before arming it with `--go`.
- **Key safety:** lives in gitignored `scripts/pixellab/.env`. NEVER put it in `src/` (Vite
  ships to browsers). Run with `unset PIXELLAB_API_KEY` first — a stale shell env var can
  shadow the file.
- **Look ↔ endpoint:** `animate-with-text-v3` = adds motion, KEEPS the painterly look at any
  size (NOT pixel art). `create-image-pixflux` (+`init_image`) = REDRAWS as pixel art. You
  cannot make pixel art by downscaling a painting — that just looks blurry.
- **Request format:** images are RAW base64, never a `data:` URI (→ 500). `imageObject(path,
  size)` handles this + resizes via sips.
- **Caps are hard 422s (free):** animate-with-text=64px, v3=256px, pixflux area≤400px,
  `init_image_strength` integer 1–999, v3 `frame_count` ≥4. Probe unknown ranges by sending
  an out-of-bounds value and reading the 422.
- **pixflux is SLOW:** text-only ~73s, with `init_image` >180s on Tier 1. Use a ≥300s client
  timeout, run it backgrounded; it's slow, not hung. Returns `{image:{base64}}` (singular).
- **v3 is async:** POST returns `{background_job_id}`; poll `GET /background-jobs/{id}` →
  `last_response.images[]`. On timeout, RE-POLL the id — never resubmit (double charge).
- **cwd trap:** backgrounded `node -e` tasks sometimes start from `~` not `~/8gents`. Use
  ABSOLUTE import paths (`await import("/Users/sky/8gents/scripts/pixellab/pixellab.mjs")`)
  and `2>&1` so errors aren't swallowed.
- **Output is untracked by git** at `public/art/creatures/<creature>/<action>_<variant>/
  frame_NN.png`. Commit/back up kits you want to keep.

## WHAT'S DONE (validated)
- v3 faithful animation generalizes across silhouettes: **Cinderpaw** (idle/attack/hurt/
  death), **Hexmoth** (idle/attack), **Frostwarden** (idle/attack) — all on-model with real
  motion. GIFs in `public/art/creatures/_previews/`.
- pixflux confirmed working (text-only + init_image). Native pixelization of Cinderpaw at
  `init_image_strength 850` keeps identity but is still **semi-painterly, not crisp**.

## PENDING TASKS (in priority order)
1. **Nail the crisp-pixel look.** Sky felt downscaled pixelation looks "blurry." Tune pixflux:
   try `init_image_strength` ~300–600 (lets it redraw more), test a forced/target palette,
   and check for a dedicated `image-to-pixel-art` endpoint. Produce a side-by-side so Sky can
   pick. **This is the key open art-direction decision: painterly-animated vs crisp-pixel.**
2. **Evolution mechanic** (Sky's Charmander→Charizard idea): pixflux with `init_image` + a
   "bigger/fiercer evolved form" description, dialing `init_image_strength`. FINDING: strength
   400 stayed nearly identical to the base (too faithful). For real divergence sweep LOW —
   try **~120/180/250** — so the description's "much larger/fiercer" actually takes over.
   Test in `cinderpaw/evolved/s400/` shows the too-faithful baseline. Confirm PL can make a
   genuinely related-but-evolved creature, then judge with Sky.
3. **After the look is chosen:** generate full kits for the roster (~16 images/creature,
   ~272 for all 17). Keep each creature's states generated from the SAME source frame for
   consistency.
4. **Wire frames into the game** so creatures animate in a real fight — the `#spritelab`
   state machine (`src/screens/SpriteLab.jsx`) is the shape to follow.
5. **Back up** the generated frames (commit them).

## SAFETY / WORKFLOW
- PL is iterate-and-cherry-pick: generate a few, keep the best, re-roll the ~20% that miss.
- Always show Sky visual results (PNG stills + animated GIFs); don't just report "done."
- Verify before claiming success — show the actual frame/output.
- Escalate back to Opus only for genuinely novel debugging; routine generation is yours.

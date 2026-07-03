# PixelLab (PL) — interaction notes for any instance

Single source of truth for working with the PixelLab API on Ringward. Read this before
spending generations. Companion files: `README.md` (quickstart), `pixellab.mjs` (CLI +
exported helpers), `batch-test.mjs` / `content-batch.mjs` (multi-job drivers).

Last validated: 2026-06-08. Account: **Tier 1 (Pixel Apprentice), 2,000 images/month.**

---

## 1. The single most important thing: which endpoint makes which LOOK

PL has two families, and they are NOT interchangeable:

| Goal | Endpoint family | What it does | Look |
|---|---|---|---|
| **Animate, keep the art** | `animate-with-text-v3` | Adds motion to your image, frame-to-frame | **Painterly** — preserves the source style at ANY size |
| **Make crisp pixel art** | `create-image-pixflux` / `bitforge` / `image-to-pixel-art` | REDRAWS the creature with hard pixel edges + tight palette | **True pixel art** |

**Hard-won lesson (the "blurry" trap):** you CANNOT get pixel art by downscaling a painted
image (ImageMagick `-resize` + `-colors`). A shrunk painting keeps its soft anti-aliased
edges → it just looks **blurry/muddy**, not pixelated. Likewise `animate-with-text-v3` at a
small size stays painterly. Crisp pixels require a **redraw** endpoint (pixflux et al.) that
conditions on the source via `init_image`. Decide the LOOK first, then pick the family.

---

## 2. Auth + the two metering systems

- **Key:** Bearer token in `Authorization` header. Stored in gitignored `scripts/pixellab/.env`
  as `PIXELLAB_API_KEY=...` (no `sk_` prefix — PL keys don't use it). `loadKey()` reads env first, then the file.
- **Trial** meters in **"fast generations"** (40), counted **per output frame/image**.
- **Subscription** meters in **images per month**: Tier 1 $12 = **2,000** @≤320px; Tier 2 $24 = 5,000 @≤512px + priority queue/10 concurrent; Tier 3 $50 = 10,000 @≤512px/20 concurrent.
- Ignore third-party "40 credits per request" claims — not how the subscription bills. `--check` (GET /balance) is FREE and shows live balance/plan.
- **Cost rule of thumb:** 1 generated frame/image = 1 unit. A v3 action (`frame_count` 4) = 4 images. A full 4-state kit ≈ 16 images. Whole 17-creature roster ≈ 272 (~380 with re-rolls) = under 20% of one Tier-1 month.

---

## 3. Endpoint cheat-sheet (validated fields, caps, sync/async)

**`POST /animate-with-text-v3`** — faithful animation (our main tool). Async.
- Body: `{ first_frame: <imageObject>, action: "attack", frame_count: 4 }`
- `frame_count` **min 4 AND must be EVEN** (4,6,8,10,12,14,16 — odd values 422; learned 2026-06-12 on a `--frames 5` release). first_frame **max 256px** (422 above). Returns first_frame + N. The CLI now auto-bumps odd counts up to even.
- Returns `{ background_job_id }` → poll `GET /background-jobs/{id}` → `last_response.images[]`.

**`POST /create-image-pixflux`** — redraw to pixel art / evolution. Sync but **SLOW**.
- Body: `{ description, image_size:{width,height}, init_image:<imageObject>, init_image_strength }`
- `init_image_strength` **integer 1–999** (NOT a 0–1 float — 422). Higher = closer to source. ~750–900 = faithful pixelization; ~250–500 = looser "evolution".
- Size **area 32×32 … 400×400**. `init_image` optional (omit = pure text-to-pixel).
- **Response shape:** sync, returns `{ usage:{generations:N}, image:{type:'base64', base64:'data:...'} }` — note `image` is **singular** (one image), NOT an `images[]` array. Costs ~1 generation/call.
- **TIMING (Tier 1, no priority lane):** text-only ≈ **73s**; with `init_image` **>180s** (use a ≥300s client timeout — it's slow, not hung). Don't abort early or you waste the wait. Background it.
- **Strength behaviour (measured):** at **850** init the output stays semi-painterly + faithful (good for "keep this creature"); at **400** an "evolved" prompt barely diverged from the base. For crisp redraw OR real evolution, go LOWER (~120–500) so the description drives more. Tune per goal.

**`POST /animate-with-text`** (v1) — AVOID for our creatures. Sync, **hard-locked 64×64**, reimagines from a word → mush on detailed art.

**Other (not yet wired):** `bitforge` (style_image, ≤200px), `generate-image-v2` (subject_images, Pro), `generate-with-style-v2` (style_images, 16–512px), `create-character-v3` (reference_image south-facing ≤256 → persistent 8-rotation character, shows in web account), `generate-8-rotations-v3` (PL flags rotations as unreliable for view-changes).

---

## 4. Request gotchas (each cost us a debug cycle)

1. **`init_image`/`first_frame` = RAW base64, NOT a `data:` URI.** A `data:image/...;base64,` prefix gets decoded with the bytes → 500 "cannot identify image file". Responses echo data: URIs; requests want raw.
2. **Size must match where required.** v1 needs reference == image_size; we resize the source with `sips` to the target before sending (`imageObject(path, size)`).
3. **Caps are hard 422s** (free, but waste a round-trip): v1=64, v3=256, pixflux area≤400.
4. **Async jobs share a slow queue** (seen positions 40–68 on Tier 1). Poll patiently (~12min); on timeout **re-poll the job id — never resubmit** (double charge). `awaitJob` handles this.
5. **Probe unknown numeric ranges for free:** send an out-of-bounds value; the 422 reveals min/max (that's how we found `init_image_strength` 1–999 and `frame_count` ≥4).
6. **Capture stderr** in background node one-liners (`2>&1`) or failures show as an empty log.

---

## 5. Workflow + housekeeping

- PL is an **iterate-and-cherry-pick** tool (per PL docs): generate a few frames, multiple
  times, keep the good ones, reorder, optionally feed fixed frames back as init images with
  inpainting. Don't expect a perfect kit in one shot — budget re-rolls.
- **Reference facing should match the action** (PL docs); front-facing suits idle/hurt/charge,
  less so a lunging side-attack.
- **Output lives in `public/art/creatures/<creature>/<action>_<variant>/frame_NN.png`** and is
  **untracked by git** — commit or back up kits you want to keep so a clean/checkout can't lose them.
- API generations do **not** reliably appear in the PL **web** character gallery (API≠web library); the files on disk are the source of truth. `create-character-v3` is the exception (persists to account).
- Make motion visible for review with an animated GIF: `magick -delay 12 -loop 0 frame_00..04..01 -layers optimize out.gif` (ping-pong reads smoother).

---

## 6. Quick commands

```
node scripts/pixellab/pixellab.mjs --check                                   # free balance
node scripts/pixellab/pixellab.mjs --faithful --image <p> --action attack --creature x --go
node scripts/pixellab/content-batch.mjs --go                                 # multi-test batch
```

---

## 7. FULL CAPABILITY MAP — what we're NOT using yet (researched 2026-06-08)

PixelLab is a whole game-art suite (~50 endpoints). We use 3. Authoritative source:
`https://api.pixellab.ai/v2/openapi.json` and `https://api.pixellab.ai/v2/llms.txt`. Pull
the OpenAPI and parse `paths` for the complete, current list. Many endpoints are async (poll
`/background-jobs/{id}`). "(Pro)" endpoints may need Tier 2+; the high-value ones below are NOT Pro.

### The control params we were ignoring on pixflux/bitforge (THE crisp-pixel fix)
We sent none of these, so output defaulted soft/painterly. For a crisp pixel look set:
- `outline`: **single color black outline** | single color outline | selective outline | lineless
- `shading`: **flat shading** | basic shading | medium | detailed | highly detailed shading
- `detail`: **low detail** | medium detail | highly detailed
- `no_background: true`, plus `view` (side | low top-down | high top-down) and `direction` (8 compass).
Also a DEDICATED converter: **`POST /image-to-pixelart`** `{ image, image_size(src ≤1280), output_size(16–320) }` — purpose-built to turn a painted sprite into clean pixel art. (`-pro` variant adds a description.)

> **VERIFIED 2026-06-08 — this solves the "blurry" problem.** Tested on Cinderpaw: a plain
> downscale = blurry; pixflux even WITH `outline`/`shading`/`detail` stays painterly (high
> init_image_strength overrides the style knobs); **`image-to-pixelart` (256px src → 96px
> output, ~43s, Tier 1, ~1 gen) produced genuinely CRISP pixel art with identity intact.**
> This is the crisp-look pipeline. Output in `cinderpaw/crisp_test/img2px/`. `no_background:true`
> on pixflux does cleanly cut the backdrop. Recipe lives in `/tmp/crisp-test.mjs` (move into repo if kept).

### Persistent Character system (the "proper" workflow — and the web-gallery visibility Sky wanted)
Instead of one-off animate calls: `create-character-v3` (reference_image ≤256 → persistent 8-rotation
character, STORED IN ACCOUNT) → `POST /characters/animations` (named animations) → `POST
/create-character-state` (`character_id` + `edit_description` + `use_color_palette_from_reference`
— **this is the evolution / power-up / damage mechanic**, Charmander→Charizard) → `GET
/characters/{id}/zip` (export). Also `list/get/delete/tags`. Mirrors for props: `create-8-direction-object`, `objects/animations`, `objects/states`.

### Directions / travel angles (Sky's "see them from behind" idea)
`create-character-with-4-directions` / `-8-directions`, `generate-8-rotations-v3` (just `first_frame`),
`rotate` (`from_view`/`to_view` + `from_direction`/`to_direction`).

### Better animation control we leave on the table
- `animate-with-text-v3` has a **`last_frame`** param — we only pass `first_frame`. Pass both to bookend the motion. Also `frame_count` 4–16 and `enhance_prompt`.
- `interpolation-v2` (Pro) tweens between two keyframes. `animate-with-skeleton` = pose-driven (skeleton_keypoints). `transfer-outfit-v2` / `edit-animation-v2` = variants/edits of an existing animation.

### ★ ENVIRONMENT DOCTRINE — generate STAGE COMPONENTS, not finished scenes (LOCKED 2026-06-08, review)
The danger with PixelLab isn't ugly art — it's beautiful *postcards* when Ringward needs *film sets*.
One-sentence rule to obey on every env prompt:
> "Generate STAGE COMPONENTS, not finished scenes. Prioritize reusable LAYERED environments with FLAT
> ground planes, open horizons, FOREGROUND OCCLUDERS, and OFF-SCREEN CONTINUATION. Avoid self-contained
> postcard compositions. Creature consistency > per-ring lighting variants — apply environmental
> lighting at RUNTIME, never regenerate sprite sets per ring."
- **Layers, not backgrounds:** Sky (horizon/spires) · Ground (flat battle floor + standing zone) ·
  Foreground (grass/rocks/roots/chains). The Director composes shots from these.
- **Flat + off-screen:** flat level ground & a STRAIGHT horizon that run off both edges (the world
  continues past the frame). Fight the curved/bowl/centered look HARD in the prompt — it reads as
  "battle pasted on a mural." "Never show the full composition; the frame is a window into a larger world."
- **Foreground occlusion is gold:** silhouetted grass/rocks/roots entering from bottom + side edges, IN
  FRONT of characters → instant depth/scale/atmosphere with zero camera movement. Underused; PixelLab does it reliably.
- **Per-ring look = RUNTIME lighting, not new sprites:** keep ONE canonical creature set; tint/grade/rim
  per environment in-engine (CSS filter / overlay). Regenerating Cinderpaw per ring → style drift (worse
  than a lighting mismatch).
- **Boss arena = SAME place, staged differently** (not a different place): giant foreground rocks, tighter
  comp, taller spires, less visible sky. Same asset family, different emotional weight. Keeps art in check.
- **Generate for REUSE, not screenshots:** every stage must support wide/hero/reaction/boss/OTS/travel
  shots. If it can't, regenerate. Prompt template: "Pixel-art combat stage. Wide flat ground plane lower
  ~40%. Open straight horizon. Distant spires extending beyond frame. Foreground elements entering from
  screen edges. Side-view RPG battle staging. Not a centered postcard."

### World / environment art (unused — for ring backgrounds, arena floors, props)
`create-tileset` (top-down Wang tilesets w/ terrain transitions), `tilesets-sidescroller`,
`create-isometric-tile`, `map-objects` (trees/rocks/props). Guide: pixellab.ai/docs/guides/map-tiles.

### Editing / cleanup / consistency
`inpaint` (fix a bad frame — the iterate workflow), `remove-background`, `resize` (smart pixel resize),
`edit-image`. Style consistency across the roster: `bitforge` (`style_image` + `style_strength` 0–100)
and `generate-with-style-v2`. UI art: `generate-ui-v2`.

### Models & helpers
Three base models — `pixflux` (used), `pixen` (has `enhance_prompt`), `bitforge` (most controllable:
style_image, skeleton). Prompt helpers: `enhance-character-v3-prompt`, `enhance-animation-v3-prompt`.

### Official tooling (could replace our hand-rolled .mjs)
JS SDK `pixellab-js`, Python SDK `pixellab-python`, and an **MCP server** `pixellab-code/pixellab-mcp`
(handles auth/polling/response shapes). Consider adopting instead of maintaining custom scripts.

### Highest-value next steps for Ringward
1. Crisp-pixel: re-test with `outline`/`shading`/`detail`/`no_background` + `image-to-pixelart` (Tier 1, cheap) — likely unblocks the look decision.
2. Adopt the persistent Character workflow (`create-character-v3` → states → animations) for the roster.
3. Prototype `create-tileset` for native arena/ring terrain vs painted backgrounds.

### ★ VERIFIED CHARACTER PIPELINE (2026-06-08) — the crisp-pixel answer to everything
End-to-end proven on Cinderpaw. This ONE pipeline gives crisp pixels + 8 directions +
consistent animation + evolution + account/web-gallery storage:

1. **`POST /create-character-v3`** `{ description, reference_image(≤256, south-facing), view:"side",
   name, no_background:true, outline:"single color black outline", detail:"low detail" }`
   → returns `character_id` immediately + async rotations. ⚠ `enhance_prompt` ONLY works WITHOUT a
   reference_image (422 otherwise). Poll `GET /characters/{id}` → `rotation_urls` (8 dirs:
   south/SE/E/NE/N/NW/W/SW, 256px). Result: crisp, consistent, identity intact. (Cinderpaw char_id
   `2f02d18a-9632-4d02-b897-da5da29fbdc7`, rotations in `cinderpaw/character_v3/`.)
2. **`POST /animate-character`** `{ character_id, action_description:"attack: lunge and swipe",
   frame_count:4 }` → `background_job_ids` (one per direction). Frames land in the character's
   `animations` (poll `GET /characters/{id}`). Result: crisp pixel animation that's CONSISTENT
   frame-to-frame (no flicker — unlike per-frame `image-to-pixelart` on painterly frames, which
   flickers). Saved in `cinderpaw/attack_charv3/`.
3. **`POST /create-character-state`** `{ character_id, edit_description:"much larger, fiercer
   evolved form, bigger horns, heavier armor, blazing glow", use_color_palette_from_reference:true }`
   → spawns a SIBLING character (the evolved form), full 8 directions. Verified textbook
   Charmander→Charizard: bigger/fiercer, same lineage + palette. (Evolved char_id
   `4e0fbce5-...`, in `cinderpaw/evolved_charv3/`.)

**Gotchas:** rotation/animation URLs are Backblaze links that 404 briefly while files upload —
retry downloads (~5–30s). Tier 1 has a concurrency limit (429 if too many parallel jobs) — the
evolved state took a few min behind other queued jobs. Each character ≈ 8 rotations + animations =
more gens than painterly `animate-with-text-v3`, but Tier-1 2000/mo still covers the 17-roster.

**THE FORK (Sky's call):** painterly-animated (`animate-with-text-v3`, keeps Midjourney art) vs
crisp-pixel (this Character pipeline). Both are now fully working and demoed.

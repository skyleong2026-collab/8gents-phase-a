# Ringward Tactics — Environment Art Kit (brief for a parallel art instance)

You are a **second Claude Code instance** running in parallel. Your job is the **Rim environment
art kit** — ground tiles, cover/props, buildings, and a couple of Drop/blight pieces. One kit that
makes the tactical board look like a *place* and generates many different-looking maps from layout
alone. You produce PNGs and hand them off — you do **not** touch game code.

## Why this exists
Launch ships only **the Rim** (per the plan), so we don't need many biomes — we need ONE strong Rim
kit. Variety comes from layout + props + lighting, not from new tilesets (XCOM's trick). A code
instance is, in parallel, doing a visual reskin and a bigger-map + zoom camera on the game file —
which is why you must stay out of that file.

## Context / where things live
- Game (DON'T EDIT): `~/8gents/public/ringward-tactics.html` — XCOM-style 2.5D tactics, weird-West
  frontier vs a classic-fantasy bestiary at "the Drop." Objects render as pixel sprites standing
  upright on tiles (props/buildings render the exact same way units do).
- Match these (the look bar): `~/8gents/public/art/tactics/*.png` — the 11 unit sprites. Clean-
  stylized → pixel, bold shapes, dark outline, flat readable colors, muted dusty frontier palette,
  128px RGBA.
- Pipeline + key: `~/8gents/scripts/pixellab/` (`mj-to-pixel.mjs`, guarded `--go`; key in the
  gitignored `.env`). Canon: memory note `ringward-tactics-design` + plan
  `~/.claude/plans/foamy-enchanting-seahorse.md`.

## Art direction (match the squad exactly)
- Same register as the unit sprites: clean-stylized, **bold shapes, dark outline, flat readable
  colors, muted dusty frontier palette** (worn timber, iron, dust, brass, scrub-green), NOT
  over-detailed, not photoreal.
- Consistent scale: a **full-cover** object ≈ a crouched soldier's height; **half-cover** ≈ waist
  height. Keep terrain LOW — tall things look like cardboard under the 2.5D tilt.
- Draw each object **centered on a plain light-grey background** for a clean cutout.

## The asset list (~20 pieces)
**Cover / props** — cutout sprites, billboard like units, 128px, transparent bg → `env-<name>.png`:
boulder, dead-tree, crate, barrel, wagon, fence, low-wall, rubble, scrub, campfire.

**Buildings / landmarks** — cutout sprites, larger footprint → `env-<name>.png`:
cabin, well, watchtower, corral, ruin (a blighted wreck that hints at the Drop).

**Drop / blight weirdness** — cutout sprites → `env-<name>.png`:
shard-cluster, blight-patch. (Leave the glow subtle; the code instance can add an ember/violet
bloom via CSS.)

**Ground tiles** — **seamless / tileable** squares, 128px → `tile-<name>.png`:
dirt, scrub, rock (cracked), planks (road), mud (water edge).
- Generate ground tiles with **Midjourney's "Tiled image" option (`--tile`)** so they repeat with
  no visible seam.

*(Lighting / time-of-day tints are NOT art — they're CSS color overlays the code instance owns. Skip.)*

## Pipeline (same as the units)
1. **Midjourney** (in Sky's Chrome, the MJ gallery): one prompt per asset in the squad's register —
   reuse the working recipe: *"crisp pixel art … bold dark outline, muted dusty frontier palette,
   plain flat light-grey background, charming retro game object, not photorealistic."* For ground
   tiles add `--tile`. Submit in small batches.
2. **Sky hearts favorites** — this is the taste step; you cannot skip it. Surface each batch for him
   to pick. (Trigger him with a short message; don't guess his picks.)
3. **Pull** his hearted picks via Midjourney's own ⤓ download button (full-res PNG → `~/Downloads`;
   direct CDN curl is 403 and in-page fetch is CORS-blocked).
4. **Pixelate**: stage the picks, run `node scripts/pixellab/mj-to-pixel.mjs --src <dir>
   --out public/art/tactics/env --go`.
5. **Cut out** the objects (PixelLab `/remove-background`) so they sit cleanly on tiles. Ground
   tiles keep the full square (no cutout).
6. **Verify** each PNG loads (128px RGBA), name per the convention, drop in
   `public/art/tactics/env/`.

## Don't-touch rules
- You OWN: `public/art/tactics/**` and `scripts/pixellab/**`.
- **NEVER edit `ringward-tactics.html` or any game logic** — the reskin + camera instance owns it.
  Don't commit the game file.
- Don't wire assets into the game. Just produce + name + drop them in `env/`, then list what you
  made (and anything Sky still needs to heart). The code instance does the wiring.
- Secrets: the PixelLab key stays in the gitignored `.env`, never in committed code.

## Done =
~20 named PNGs in `public/art/tactics/env/`, each verified to load and matching the squad's look,
plus a short summary of what you generated and any batches still waiting on Sky's hearts.

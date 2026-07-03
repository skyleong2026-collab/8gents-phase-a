# Ringward Tactics — frame art brief (intro · town · skill trees)

For the art instance. The game frame (intro screen, visual town, skill-tree map) is **built and live** at
`ringward-tactics.vercel.app` with **styled placeholders**. Drop the 3 files below into
`public/art/tactics/` at the exact names and they auto-appear — no code change needed (each renderer
calls `bgUpgrade()` / an `Image()` preload and swaps the file in over the gradient fallback).

Style anchor = the locked **"Wanted Poster" Direction B**: warm timber & lamplight, weird-West frontier
meeting a classic-fantasy bestiary at the Drop. Palette in `ringward-tactics.html` `:root`
(ember `#e08a3a`, amber `#e0b257`, violet `#9a6ad0` for Taint/graft, steel `#7ec4e0`, deep browns).
Match the in-game pixel/painterly sprite look already in `art/tactics/`.

## 1. Intro picture — `art/tactics/intro.png`
- **Aspect 16:7**, wide hero banner (renders full-width, ~860px). Export ~1600×700.
- **Subject:** the Rim at the edge of the Drop — a frontier township's fences/lamplight in the
  foreground, the Drop (a vast opened chasm with a faint violet otherworldly glow rising from it) on
  the horizon. Dusk/night, lantern warmth vs the cold violet of the Drop. Establishes "humans holding a
  thin line against what crosses over." No characters required (silhouettes ok).
- Placeholder currently shows a radial violet glow + horizon line + "intro art lands here" caption; the
  caption and glow are auto-removed when the real file loads.

## 2. Town background — `art/tactics/town-bg.png`
- **Wide, ~1600×900**, sits *behind* the clickable building tiles (the tiles render on top, so keep the
  center/midground readable and not too busy — vignette/darken toward the middle is good; the code
  already overlays a 55–78% dark wash).
- **Subject:** the Frontier settlement on the rim of the Drop — a muddy main street / palisade camp
  (the War Table tent, a forge with a lit fire, an infirmary, a watchtower, a hall/saloon-chapel, a
  cairn of stones). Doesn't need literal 1:1 mapping to the tiles — it's atmosphere behind them.
- Placeholder = warm radial gradient + faint violet corner.

## 3. Skill-tree background — `art/tactics/skilltree-bg.png`
- **~1600×1000**, behind the tree-node map (nodes render on top with their own dark wash overlay).
- **Subject:** an artistic backdrop for "what a soldier can become" — the human↔graft fork made visual.
  Suggestion: a faint anatomical/ritual diagram or a frontier ledger page, with one side clean/steel
  (human) and the other side creeping with violet crystalline graft growth (Taint). Subtle, low-contrast
  — it's a background, not the focus.
- Placeholder = steel-tint top-left + violet bottom-right over deep brown.

## Notes
- All three are pure visual upgrades — gameplay/markup already final. Safe to iterate independently.
- Bonus (optional, later): per-building icon art to replace the emoji on the town tiles
  (`.bldg-tile .ico`) — would need a small markup tweak; flag me if you make them.

# Animation previews — review later (best via Quick Look on the Mac mini)

Animated GIFs don't render in the iPad/mobile Claude app. View these with Finder →
spacebar (Quick Look), or open in Preview, on the Mac mini directly.

Each is a ping-pong loop (~8fps) of the v3 frames. Raw frames live one level up in
`../<creature>/<action>_<variant>/frame_NN.png` if you want to re-time or re-export.

## Queue
- `cinderpaw_idle.gif` — idle (painterly-animated, 256px)
- `cinderpaw_attack.gif` — attack (256px)
- `cinderpaw_hurt.gif` — hurt / damage flinch (256px)
- `cinderpaw_death.gif` — death (256px) — completes Cinderpaw's full kit
- `cinderpaw_attack_128.gif` — attack at native 128px (note: STILL soft/painterly — v3 won't pixelate)
- `cinderpaw_attack_PIXEL.gif` — same frames post-processed to chunky 48px (the "blurry" look Sky flagged)
- `hexmoth_idle.gif`, `hexmoth_attack.gif` — winged moth (wings hold under motion)
- `frostwarden_idle.gif`, `frostwarden_attack.gif` — frost hulk

## What to judge
1. Does the painterly-animated look (v3) feel good enough as the house style, OR do we need crisp pixel art?
2. Motion quality per state — is 4 frames enough, or do some need more?
3. Which creatures/actions need re-rolls.

(Decision pending: painterly-animated vs crisp-pixel — see scripts/pixellab/SONNET-HANDOFF.md task #1.)

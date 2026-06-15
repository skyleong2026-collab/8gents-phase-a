# Ringward audio assets

Drop authored MP3s here and they take over automatically — no code change needed. The game
falls back to procedural synth (SFX) / an ambient pad (music) for any file that's missing,
so partial sets are fine.

Filenames are defined in `src/audio/manifest.js`. They must match exactly.

## music/  (looping beds, streamed)
- `title-theme.mp3`  — home / menu
- `rim-bed.mp3`      — rings 1–3
- `mid-bed.mp3`      — rings 4–6
- `deep-bed.mp3`     — rings 7–8
- `boss-battle.mp3`  — ring boss / elite (final wave)

## sfx/  (short one-shots, preloaded)
charge-up · payoff-hit · wildcard · shield-block · heal · regen-tick · burn-tick ·
dot-tick · amp-buff · upgrade-pick · forge-buy · wave-clear · merchant-bell ·
treasure-chime · elite-growl · ring-taken · squad-down · creature-caught ·
ring-threshold · the-drop · scene-turn  (all `.mp3`)

Generation prompts: `docs/AUDIO-PROMPT-PACK.md`.

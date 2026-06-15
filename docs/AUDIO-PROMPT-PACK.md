# Ringward — AI audio prompt pack

Copy-paste prompts to generate Ringward's music (Suno/Udio) and sound effects (ElevenLabs
Sound Effects). Pick the take you like, export as **MP3**, rename to the filename in the
left column, and drop it into `public/audio/{music,sfx}/`. The game picks it up on reload;
anything you skip stays on the procedural fallback.

**Tone anchor (read once):** weird-West folk mystery. Warm and earthen, a little haunted.
Acoustic bones — fingerpicked guitar, dulcimer/banjo, low strings, distant percussion, lonely
whistle/harmonica — with an uneasy edge that grows the deeper you climb. Not orchestral-epic,
not chiptune. Think a frontier ghost story.

---

## Music (Suno / Udio) — ~6 tracks, looping beds

Set each to **instrumental**, ~90–120s, and trim to a clean loop on export.

| File | Suno prompt |
|------|-------------|
| `title-theme.mp3` | Instrumental weird-West folk theme, fingerpicked acoustic guitar and dulcimer over a low warm drone, lonely harmonica melody, slow and inviting with a faint haunted edge, frontier campfire at dusk, spacious and unhurried, loopable |
| `rim-bed.mp3` | Sparse instrumental folk ambient bed, soft fingerpicked guitar, gentle banjo, light hand percussion, open and curious with a touch of unease, exploring the edge of a strange frontier, very loopable, low energy |
| `mid-bed.mp3` | Instrumental folk ambient, darker than before, low bowed strings and dulcimer drone, sparse plucked notes, distant tribal drum, mounting tension and mystery, walking deeper into haunted territory, loopable |
| `deep-bed.mp3` | Ominous instrumental folk drone, dissonant low strings, detuned guitar harmonics, slow heartbeat percussion, cold and cavernous, dread of approaching something ancient, sparse and heavy, loopable |
| `boss-battle.mp3` | Driving weird-West folk combat track, urgent stomping percussion, aggressive banjo and distorted slide guitar, low brass stabs, tense and dangerous showdown energy, relentless rhythm, loopable |
| *(optional)* `the-drop.mp3` → `sfx/the-drop.mp3` | Resolving instrumental folk finale, builds from a lone fingerpicked guitar to a warm full-band swell, hopeful and cathartic resolution after a long climb, dulcimer and strings blooming, one-shot (not looped) |

> The Drop currently plays as a one-shot via the SFX path (`sfx/the-drop.mp3`). If you want
> a longer authored finale, export it there.

---

## Sound effects (ElevenLabs Sound Effects) — one-shots

Keep each **short and dry** (no reverb tails unless noted). Aim < 1s except where stated.

| File | ElevenLabs prompt |
|------|-------------------|
| `charge-up.mp3` | short rising magical charge-up chirp, energy gathering, clean and bright, 0.2s |
| `payoff-hit.mp3` | deep heavy impact, powerful thud with a sharp transient crack, weighty melee payoff |
| `wildcard.mp3` | punchy mid-range whoosh-thud, dynamic magic strike with a downward pitch sweep |
| `shield-block.mp3` | hollow resonant clunk, a blow absorbed by a shield, dull metallic |
| `heal.mp3` | warm ascending chime, gentle restorative shimmer, hopeful |
| `regen-tick.mp3` | soft quiet healing tick, small bright chime, subtle |
| `burn-tick.mp3` | short sharp fizzing crackle, small flame burst |
| `dot-tick.mp3` | dull toxic fizz, a tick of poison/decay damage, muffled and sickly |
| `amp-buff.mp3` | rising electric buzz, power loading into an ally, energizing |
| `upgrade-pick.mp3` | clean satisfying double-chirp UI confirm, an upgrade chosen |
| `forge-buy.mp3` | short metallic two-tap, a forge purchase, anvil-like |
| `wave-clear.mp3` | brief triumphant three-note chime arpeggio, a wave cleared |
| `merchant-bell.mp3` | bright warm shop bell ding, a merchant appears |
| `treasure-chime.mp3` | ascending magical sparkle, treasure discovered |
| `elite-growl.mp3` | low menacing creature growl with a downward snarl, danger ahead |
| `ring-taken.mp3` | ascending four-note fanfare with a warm chord bloom, a victory, ~1.5s |
| `squad-down.mp3` | three descending minor tones, a somber defeat, final |
| `creature-caught.mp3` | rising five-note triumphant fanfare with a high sparkle, a creature captured |
| `ring-threshold.mp3` | low atmospheric swell crossing into a new area, deep and cavernous, ~1.5s |
| `the-drop.mp3` | warm resolving chord bloom, an emotional arrival, ~5s, slight reverb |
| `scene-turn.mp3` | soft low woody knock, a storybook page turning |

---

## Wiring notes (already built)

- `src/audio/manifest.js` is the single source of truth (filenames + per-sound volume).
- Per-sound levels are tuned in the manifest's `vol` field, not in code.
- In-game **Music** and **Sound Effects** each have a toggle + volume slider in ⚙ Settings.
- Missing files fall back to procedural synth, so you can ship assets incrementally.

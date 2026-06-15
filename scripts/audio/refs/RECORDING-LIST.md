# Speech-to-Speech reference recordings — shot list

Record these performances yourself (phone voice memo is fine), drop the files in **this folder**,
then I run `node scripts/audio/generate-sts.mjs` to convert each into the character's voice —
keeping YOUR timing, cries, and emotion, just swapping the voice.

## How to record
- **One line per file.** Name it exactly as shown (lowercase): e.g. `mara-down-1.m4a`.
- **Format:** `.m4a` / `.wav` / `.mp3` / `.ogg` / `.webm` all work.
- **Length:** just say the line at a natural pace — most are 1–3 seconds (target noted per line).
  A small breath before/after is fine; don't leave long silences.
- **PERFORM it.** Actually shout the shouts, gasp the panic, let the voice break. Only the
  *performance* transfers — your accent, gender, and voice are replaced by the character's.
  A flat read = a flat result. Commit to the emotion; don't worry about sounding "good."
- **Mic:** close-ish, quiet room, minimal echo. (Background-noise removal is on.)

You don't have to do all of these — even the top 4–5 panic/shout lines are where it matters most.

---

## The lines (filename — emotion — "text" — ~length)

### Mara (panic / desperation — the medic)
- `mara-down-1`   — **terror, breaking** — "No no no — somebody cover me!" — ~2s
- `mara-heal-1`   — **desperate reassurance** — "Stay with me — you're alright." — ~2s
- `mara-heal-2`   — **tense, gritted** — "Hold still, this'll sting worse'n the wound." — ~3s

### Cal (manic shouts — the powder-grin)
- `cal-grenade-1` — **warning shout** — "Frag out — cover's comin' down!" — ~2s
- `cal-grenade-2` — **gleeful yell** — "Fire in the hole, darlin'!" — ~2s
- `cal-crit-1`    — **delighted** — "Now THAT'S a hole." — ~2s

### Tom (rallying / grief — the bannerman)
- `tom-rally-1`   — **commanding shout** — "On me! Move!" — ~1.5s
- `tom-rally-2`   — **fierce resolve** — "We don't break. Not tonight." — ~2.5s
- `tom-down-1`    — **heavy, grim** — "Hold the line — I've got their name." — ~3s

### Spotter (urgent calls)
- `spotter-rite-lose-1` — **alarm** — "Too late. It's through. Pull back!" — ~2.5s
- `spotter-flanked-1`   — **sharp warning** — "You're exposed — get to cover." — ~2.5s
- `spotter-down-1`      — **urgent** — "We're hurt. Tighten up." — ~2s

### Handler (the gut-punch)
- `handler-squad-wiped-1` — **devastated, quiet** — "Squad's gone... fall back." — ~2.5s

### Wren (cocky kid)
- `wren-mark-1`  — **cocky triumph** — "Lit 'em up — no cover, nowhere to fly." — ~3s

---
After you drop files here: I add the **Speech to Speech** permission check, run the pipeline,
and those flat TTS lines get replaced with your performance in the character's voice.

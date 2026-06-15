# Ringward Tactics — Game Script & Voice Bible

Voiced lines for ElevenLabs TTS + the in-game text log. Tone = **weird-West folk-mystery**:
tired frontier, dry, grounded, an ominous wrongness past the fenceline. Never quippy-Marvel,
never grimdark-edgy. Short. Spoken aloud, around a fire or over a field radio.

> Pipeline: write here → ElevenLabs TTS (one voice per speaker) → `public/audio/vo/<speaker>-<id>.mp3`
> → wire playback into the game at the matching event. SFX reuse the existing `public/audio/sfx/`.

---

## 1. Voices (ElevenLabs casting guide)

| Speaker | Who | Voice direction |
|---|---|---|
| **SPOTTER** | the scout on the glass, calls the field | Weathered, calm, dry. Sam Elliott / Gus McCrae. Carries the tutorial + threat calls. The ominous undertone lives here. |
| **HANDLER** | command voice (the player's own) | Steadier, warmer than Spotter; brief orders. **Distinct voice from Spotter** (two-voice narration). |
| **ELI MERCER** · Sharpshooter | "Deadeye" — laconic old marksman | Slow, patient, dry humor. Talks to the shot, not the people. |
| **RUTH HOLLOWAY** · Ironclad | the wall | Stoic, blunt, few words, heavy. A quiet, hard faith. |
| **CAL BRIGGS** · Bombardier | the powder-grin | Nervy, reckless, gallows humor, loves the boom. |
| **MARA PRYOR** · Sawbones | field medic | Warm but bone-tired; mutters over her work; the Taint frightens her. |
| **WREN SALT** · Outrider | the kid scout | Fast, cocky, bravado over fear; eyes on the weird horizon. |
| **TOM VANE** · Bannerman | the heart | Weary old soldier; rallies the others; carries the dead's names. |
| **(creatures)** | Raiders/Brutes/Flyers/Casters/Swarms | No words — SFX only (chitter, roar, screech, chant, skitter). See §6. |

---

## 2. Tutorial — First Sortie ("First Blood") · SPOTTER, sequenced
Fire these once, in order, gated on the player's first of each action.

1. **On deploy:** "Six of us against whatever crossed the Rim tonight. Pick a trooper — click one, bottom-left."
2. **On first select:** "Good. Two actions a turn, each one. Spend 'em like they're your last, 'cause out here they might be."
3. **On move mode:** "Lit tiles are where they can reach. Click one to move — then Confirm. No takin' it back once the boots move."
4. **First time near cover:** "See those shields on the tile edges? Half cover knocks 'em off their aim. Full cover blocks the shot cold. Live behind it."
5. **First Shoot:** "Hover a target — that number's your odds. Get 'round their cover for a flank: no defense, and it stings extra."
6. **On a miss:** "That's the dice. Frontier doesn't owe you the hit. Reset, find a cleaner angle."
7. **On Overwatch:** "Overwatch sets a trap — first thing that moves in your sights, you drop it. Good for holding a gap."
8. **On high ground:** "High ground's worth climbing — better aim, and it strips a level off their cover."
9. **On End Turn:** "When you're spent, end the turn. Then it's their move. Watch the dark."
10. **First objective reminder:** "Job tonight's simple: every hostile that crossed, put it down. Simple ain't the same as easy."
11. **First wound:** "They'll take hits. Sawbones can patch 'em mid-fight — keep her close, keep her alive."
12. **Close-out:** "That's the shape of it. The rest you'll learn the hard way. Everybody does."

---

## 3. Battle barks — by event (variants; pick at random for variety)

### Contact / a pod wakes
- SPOTTER: "Contact. They know we're here now." / "Somethin' moved — pack's awake." / "Eyes up. That's not the wind."

### Move
- WREN: "On the wind." / "Watch this." · RUTH: "Holding." · ELI: "Findin' my angle."

### Shoot — HIT
- ELI: "Knew it'd drop." / "Wind was right." · CAL: "Ha! Sit down." · RUTH: "Down."

### Shoot — MISS
- SPOTTER: "Damn. Reset, find the angle." · ELI: "...Wind." · CAL: "Who built this thing crooked?"

### Shoot — CRIT / flank kill
- ELI: "That's the one." · CAL: "Now THAT'S a hole." · SPOTTER: "Clean through. That's how."

### Kill
- SPOTTER: "That's one down." · TOM: "One less crossin' tonight." · RUTH: "Stay down."

### Grenade
- CAL: "Frag out — cover's comin' down!" / "Fire in the hole, darlin'!"

### Heal (Sawbones)
- MARA: "Stay with me — you're alright." / "Hold still, this'll sting worse'n the wound."

### Rally (Bannerman)
- TOM: "On me! Move!" / "We don't break. Not tonight."

### Mark (Outrider)
- WREN: "Lit 'em up — no cover, nowhere to fly." · SPOTTER: "Marked. Put it down."

### Hunker / Overwatch
- RUTH: "Let 'em come." · ELI: "I'll be watchin'."

### A soldier goes down / low HP
- MARA: "No no no — somebody cover me!" · TOM: "Hold the line — I've got their name." · SPOTTER: "We're hurt. Tighten up."

### Flanked / in the open
- SPOTTER: "You're exposed — get to cover." · RUTH: "Bad spot."

---

## 4. Mission & objective lines · SPOTTER
- **Hunt deploy:** "Hostiles came through the Rim. Advance careful — keep to cover, mind your flanks."
- **Rite deploy:** "Somethin's chanting out past the rocks. Find the Caster and put it down before the rite finishes."
- **Rite breaking:** "That's it — the chant's done. Now clean up."
- **Rite completes (lose):** "Too late. It's through. Pull back!"
- **Hold deploy:** "We just have to hold the cut till the relief comes. Dig in."
- **Hold won:** "That's the relief horn — we held. Good work."
- **Sector cleared (win):** "All hostiles down. Clean work, team." (HANDLER)
- **Squad wiped (lose):** "Squad's gone... fall back." (HANDLER)

## 5. Meta — Frontier / promotion / the fallen
- **Promote, human path:** SPOTTER: "Earned it. Good."
- **Promote, graft path (Taint):** SPOTTER: "...you sure about carryin' that inside you?"
- **A soldier falls (Cairn):** TOM: "We'll set their stone on the ridge. Say the name." · SPOTTER: "Another one for the Cairn."
- **Return to Frontier:** HANDLER: "Back to the line. Patch up, decide what we build."
- **The Drop / blight ambient (rare, deep-ring tease):** SPOTTER, low: "Ground's wrong here. Don't drink the water, don't listen too long."

---

## 6. Creatures — SFX only (no VO; for the sound pass)
- **Raiders** (goblins): dry chitter / yip on wake. · **Brutes** (ogres): low roar on charge.
- **Flyers** (harpies): screech overhead. · **Casters** (shamans): the *rite* — a building drone/chant loop while alive.
- **Swarms**: skittering rush. · **The Drop**: a deep sub-bass hum under everything (reuse `the-drop.mp3`).

---

## 7. SFX mapping (reuse existing `public/audio/sfx/`)
shoot→(need new), hit→`payoff-hit`, heal→`heal`, full-cover-block→`shield-block`, grenade→(need new),
kill/down→`squad-down`, promote→`upgrade-pick`, forge/build→`forge-buy`, elite wake→`elite-growl`,
mission win→`wave-clear`, the Drop ambient→`the-drop`, title screen→`music/title-theme.mp3` (NEW).
Gaps to generate later: gunshot, grenade blast, melee, move-step, UI click.

---

## 8. Build plan (once the ElevenLabs key is in)
1. Lock voices (assign an ElevenLabs voice per speaker in §1; decide Spotter≡Handler or split).
2. TTS each line → `public/audio/vo/<speaker>-<event>-<n>.mp3` (keep ids stable for wiring).
3. Add a tiny audio system to `ringward-tactics.html`: `playVO(id)` + `playSfx(id)`, a mute toggle,
   preload, and one-at-a-time VO so lines don't stack.
4. Wire `playVO`/`playSfx` into the existing `bark()`/`log()` and action handlers (they already fire
   at every event above — bark() is the natural hook).
5. Volume sliders + a settings toggle; respect reduced-motion / autoplay rules.

---

## 9. TTS generation — FOR THE AUDIO INSTANCE
The exact, runnable contract lives in **`docs/ringward-tactics-vo-manifest.json`**. Render every line
in it to its `file` path, with one voice per `speaker`. The game (built by the game-file instance)
plays these exact ids/files — do not rename them.

- **Key:** `ELEVENLABS_API_KEY` in `scripts/audio/.env` (gitignored). It authenticates (verified).
- **Voices:** `GET /v1/voices` returns 0 (empty library), so **pick ElevenLabs premade voice ids**
  (or add voices from the shared library first), then assign one `voice_id` per speaker in the
  manifest's `voices` map. Casting directions are in §1 / the manifest. **Two-voice narration (decided):**
  `spotter` and `handler` get DISTINCT voices.
- **Call:** `POST /v1/text-to-speech/{voice_id}`, header `xi-api-key`, body
  `{text, model_id:"eleven_multilingual_v2", voice_settings:{stability:0.45, similarity_boost:0.8, style:0.15, use_speaker_boost:true}}`,
  `output_format=mp3_44100_128` → write bytes to `public/<file>`.
- **Output dir:** `public/audio/vo/` (create it). Normalize loudness, trim silence.
- **Recommended:** a guarded `scripts/audio/eleven.mjs` (mirror `scripts/pixellab/mj-to-pixel.mjs`):
  reads the manifest, `--only <speaker|id>` filter, `--go` to spend, 5xx retry, skips files that
  already exist (`--force` to redo).
- **Hand-off check:** when done, the file list under `public/audio/vo/` should match the manifest's
  `file` entries 1:1. Ping the game-file instance (me) and I'll confirm playback wiring lights up.

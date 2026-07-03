# Ringward — Cinematic / Visual Direction Doctrine

**Status: PROVISIONALLY VALIDATED (2026-06-08).** Validated ≠ finished. We have evidence the approach
works; the job now is to *use* it, not perfect it. North star: **"The descent is the movie."**

Proven live (standalone hash routes, isolated from the game): `#cinema` (travel), `#director` (combat,
master-dominant), `#boss` (boss-arena differentiation). Validation artifact: the 10-shot contact sheet
(`public/art/creatures/_previews/SHOT_GALLERY.png`) — 10 distinct, purpose-readable compositions from
ONE handful of pixel assets. PixelLab generation rules live in `scripts/pixellab/PIXELLAB-NOTES.md §7`.

---

## What was actually validated (precise)
NOT that the visuals/camera/art style are *finished*. What's validated: **Ringward can generate
emotional variety through composition + staging using a CONSTRAINED asset set.** That's the production
breakthrough — it means the "descent is a movie" feeling may NOT require dozens of bespoke environments.

**The headline discovery (Frostbound):** *The visual LANGUAGE changes when the emotional objective
changes, while the staging RULES stay CONSTANT.* Outer Ring speaks **danger through energy** (fire,
motion, enclosure, heat). Frostbound speaks **insignificance through stillness** (silence, scale,
emptiness — "this place doesn't care that you exist"). Opposite emotional tools, SAME staging doctrine →
the doctrine is real, not an Outer-Ring fluke. Each ring's job is to pick the FEELING and the TOOLS;
the rules don't move.

## The 12 rules (what we learned)

1. **Build a STAGING system, not a camera system.** A "shot" = a composed FRAME (which creatures, their
   SCALE, position, what's behind/in front, the negative space). HARD-CUT between still compositions.
   **Scale change is the dramatic engine** — a boss looms because it's re-composed huge+low, not zoomed.
   Avoid constant pans/zooms/shake (reads as "the whole screen is moving" = cheap). Pixel art is already
   abstraction; don't simulate a film camera.

2. **Generate STAGES, not postcards.** Layered components (sky / flat ground / foreground), a FLAT ground
   plane + STRAIGHT horizon that run OFF the edges (world continues past the frame). Never show the full
   composition — the frame is a *window into a larger world*. **Foreground occlusion is gold:**
   silhouetted grass/rocks/roots entering from bottom + sides, IN FRONT of characters → instant depth.

3. **Master-shot dominant (~80/20).** Hold a readable master most of the time; the camera REACTS to big
   moments (crit, death, transformation, boss turn) — never a basic attack. Constant cutting destroys
   readability and spatial awareness.

4. **Reveal ≠ combat.** The dramatic, dominant composition is a RESERVED reveal/insert (emotion). The
   combat MASTER pulls back so squad/positioning/abilities read (gameplay). Reveal = emotion; master = gameplay.

5. **Reserve your best shots — rarity = power.** Giant low-angle reveals = BOSSES only. Extreme
   close-ups / massive push-ins = FINAL boss only. Total stillness = the DROP only. A random fight must
   never look like a boss fight.

6. **Boss differentiation = SAME place, staged differently.** Tighter, taller, less sky, heavier
   foreground, boss owns more frame → "feels dangerous" with no new mechanics. The test: freeze-frame it,
   remove the UI — can you tell it's a boss? (Outer-Ring boss arena passes.)

7. **Two-layer camera + UI matte.** GAME camera owns readability/safe-areas/telegraph visibility; FILM
   offset applies push-ins/shakes ONLY within its envelope (a dramatic shot can't hide a telegraph). UI =
   anchored MATTE (the letterbox bands); the playable stage sits ABOVE it, ground never cropped, controls
   never cover action. Manual play = stable master + flourishes between turns; auto = free director.

8. **Lighting is NOT the bottleneck — staging is.** Players forgive lighting; they don't forgive staging
   (FF6/Chrono/Octopath). Fix grounding "enough nobody notices": contact shadows + feet darkening +
   a runtime warm/cool GRADE. Then STOP. One canonical creature set — grade per environment at RUNTIME,
   **never regenerate sprites per ring** (PixelLab style-drift is worse than a lighting mismatch).

9. **Grounding rules.** Characters stand ON a visible flat ground; trim + foot-anchor; scale-by-depth
   (far = smaller + higher); screen-direction HELD (heroes left, foes right, across every cut).

10. **Emotional objective per ring drives everything** (camera, staging, motion, light, music):
    curiosity → momentum → unease → oppression → dread → **silence**. Each ring has a visual VERB (the
    world MOVES differently: drifting / arcing / pooling / frozen). Motion escalates inward, then the
    **Drop BREAKS the language** — no parallax, no particles, no camera. Absence as the payoff.
    **Name the FEELING precisely — don't default every ring to "danger."** The emotional TOOLS vary with
    it while the rules stay fixed: Outer = *danger through energy* (heat/motion/enclosure); Frostbound =
    *insignificance through stillness* (silence/scale/emptiness — the world doesn't care you exist).
    Distinct feelings (danger ≠ insignificance ≠ dread) → distinct tools → same staging doctrine.

11. **Generate for REUSE, judge by LEARNING.** Every stage must support wide/hero/reaction/boss/OTS/
    travel — if it can't, regenerate (the 10-freeze-frame test is the bar). And the meta-rule: ask
    *"have we learned something new?"* not *"can this screenshot be better?"* A new lighting pass teaches
    nothing; a new biome (Frostbound) teaches whether the doctrine scales. Validate, then move on.

12. **Every experiment must have a QUESTION.** Before any iteration, name the uncertainty it reduces.
    Good: "does a boss feel more dangerous if the world closes in?" (yes) / "can one stage make 10
    distinct emotional comps?" (yes). Weak: "can we make the sunset prettier?" (changes no decision —
    don't). This is the rule that prevents months of motion that don't reduce uncertainty.

13. **Creature READABILITY is biome-dependent — guarantee separation per biome.** (Frostbound test,
    2026-06-08.) The COMPOSITION doctrine is biome-INDEPENDENT (cold stages, boss-menace-without-red, and
    the shot grammar all transferred). But creature-vs-background SEPARATION is NOT free — warm/high-
    contrast biomes hand it to you; cold/desaturated/monochrome biomes SWALLOW the creatures (even the
    boss vanished, pale-on-pale). Required per-biome treatment, MATCHED TO THE VALUE RELATIONSHIP: a DARK
    separation band behind LIGHT creatures; a BRIGHT rim-light behind DARK ones; a calm value-contrast
    band behind the standing zone. And DIAL FOREGROUND OCCLUSION to the biome (gold in high contrast, a
    liability when heavy in low contrast). Cheap fix (proven), but it MUST exist before a biome ships.

---

## What's still open (small)
- **OTS + travel-from-behind** are the weakest frames (shots #3/#10) — they read as "angle change," not
  "emotion change." One short refinement pass; if a shot doesn't earn a *feeling*, CUT it (films cut shots).

## Frostbound Transfer Test — DONE (2026-06-08): PASS, with one new rule
Ran the hard test (one cold biome, the three questions). Result:
- **Composition/staging doctrine is REUSABLE, not an Outer-Ring fluke.** Cold flat stages transferred;
  the boss arena menaced with NO warm color (Test 2 pass); cold reads through *absence/stillness* where
  warm read through *energy* (Test 3 — the emotional-objective doctrine holds). Frostbound's truest
  identity is **insignificance/indifference** ("the world doesn't care you exist"), NOT danger — likely
  one of Ringward's strongest visual ideas. (Master debt: the giant beautiful mountain steals focus from
  gameplay — keep it for the reveal, reduce its dominance in the combat master. Reveal=emotion, master=gameplay.)
- **But it exposed Rule 13:** creature readability broke in the low-contrast cold palette (Test 1 fail
  until treated). Fix proven cheap (dark separation band → creature pops). The warm biome had hidden this.
- Net: we have a reusable visual LANGUAGE that needs a per-biome readability/separation layer. That's
  the difference between "a good Outer Ring scene" and "a system" — and it's a system.

## Now: FREEZE visual R&D, return to game systems
The direction is validated and the doctrine is written down. Per the meta-rule (judge by learning), the
next visual work would teach little. Remaining visual debts (do later, briefly, only with a question):
the OTS/travel shots (cut if they don't earn a feeling); the per-biome separation layer when a real
biome ships. Wiring the cinematic staging into the live `SeamLab` run is the *eventual* path — "too
early" until game systems catch up. **Visual phase: complete.**

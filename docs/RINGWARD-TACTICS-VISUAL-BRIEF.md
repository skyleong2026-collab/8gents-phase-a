# Ringward Tactics — Visual Brief (for Claude Design)

**Purpose:** This is the *look* brief. It pairs with the design bible
`~/.claude/plans/foamy-enchanting-seahorse.md` (the *soul* — fiction, mechanics, scope).
The plan tells you what the game IS; this tells you what it should LOOK like.
Read both. Restyle the existing build — do not start a new project.

---

## 1. The theme, in one line
**Weird-West meets classic fantasy.** A frontier company of gunslingers and field-medics
holds the rim of *the Drop* against a fantasy bestiary (goblins, ogres, harpies, shamans, dire
wolves) crossing over. Humans survive by **grafting monster parts onto themselves** — so the
heroes are slowly becoming the thing they fight. Tone: **folk-mystery, tired frontier, ominous
but grounded.** Not heroic-bright, not grimdark-edgy. Think a dusty outpost at dusk with
something wrong glowing just past the fenceline.

## 2. Mood & references
- **Frontier:** sun-bleached timber, wrought iron, dust, lamplight, canvas, brass, worn leather.
- **The wrong-ness:** an uncanny fantasy glow — ember-orange and bruised violet — bleeding in at
  the edges. Grafts, shards, blight. It should feel like infection, not magic sparkle.
- **Palette feel:** gunmetal + ember + bone + bruised twilight. Warm earth tones grounded by cold
  steel and a sickly accent. NOT clean sci-fi blue, NOT saturated fantasy primaries.
- **Visual touchstones:** XCOM 2 (HUD clarity & readability — the gold standard to match),
  Weird West / Hard West (frontier-occult mood), Blood West / Dust (grim-fantasy frontier edge),
  Red Dead (light, dust, materials). Pixel-art era, not photoreal.

## 3. Current state (what you're replacing)
The build today is functional **programmer-art**: near-black background, **monospace** font
everywhere, an amber title, thin 1px panel borders, flat green/blue status text. Legible but
themeless. Screenshots of every screen are attached. Keep the *information* and *layout logic*;
replace the *skin* — color, type, texture, framing, iconography — so it reads as frontier-occult.

## 4. The surfaces to design (there are only three screens + a few panels)
1. **Frontier (camp)** — `rwt-screen-frontier.png`. The hub between missions. Contains: the
   **company roster** (one card per soldier: name, class, rank, HP bar, Humanity, Taint), the
   **4 buildings** (Forge / Infirmary / Watchtower / Hall, each with a Build button + cost), an
   **Iron** resource readout, the **Cairn** memorial line (the fallen), the **Ironman** toggle, and
   the **Deploy** button. Once the Forge is built, a **craft panel** (Shard Rounds) appears here.
2. **Combat (the mission)** — `rwt-screen-combat.png`. A top toolbar (Difficulty / Mission /
   Seed / **2.5D** + **rotate** view toggles), the **tactical board** (isometric-ish 2.5D grid,
   cover markers, fog, 128px unit sprites), and a **right HUD column**: selected-unit panel (HP,
   aim, weapon line, Rank/Humanity/Taint), a target-odds readout, the **action buttons**
   (Move / Shoot / Overwatch / Hunker / Grenade / Heal / Rally), **End Turn**, and the **Spotter
   log** (folk-voice narration).
3. **Debrief (mission-end decision)** — `rwt-screen-debrief.png`. A result headline ("Sector Held")
   + salvage line + **a one-of-three choice** (e.g. Strip the field / Tend the wounded / Rest).
   This screen is the campaign's emotional beat — give it weight.

*Plus inline panels:* a **promotion** pick (one-of-two per rank, human-tech vs monster-graft) and
the **Forge craft** panel. Same visual language as their parent screen.

## 5. Hard guardrails (do not break these)
- **One self-contained `public/ringward-tactics.html` file. No framework, no build step, no new
  dependencies.** Ship CSS/markup that drops straight into it. Vanilla JS/CSS only.
- **Tactical readability is sacred.** %-to-hit, cover state, HP, whose-turn, and the action buttons
  must stay instantly parseable mid-fight. Mood must never cost clarity. (This is why XCOM is the
  HUD reference.)
- **The 128px pixel sprites stay** (11 of them, in `public/art/tactics/`). Design the frame around
  pixel art — crisp edges, no blur, integer-friendly. Don't propose a non-pixel art style.
- **The 2.5D board stays** (CSS perspective tilt + rotate). Don't redesign it into true 3D or flat
  top-down.
- Keep it **performant** — this renders every frame during combat.

## 6. Deliverable format
Design **tokens + CSS** (a cohesive color/type/spacing system) plus restyled markup for the three
screens, written to drop into the single HTML file. A short rationale for the palette/type choices
helps. Iterate on the *skin*; leave the *structure and logic* intact.

## 7. Pointers
- Soul / mechanics / fiction: `~/.claude/plans/foamy-enchanting-seahorse.md`
- The live file to restyle: `~/8gents/public/ringward-tactics.html` (run a static server in
  `public/` to view: `python3 -m http.server 4399`)
- Final unit art to design around: `~/8gents/public/art/tactics/*.png` (11 sprites)
- Current-screen screenshots: attached (`rwt-screen-frontier/combat/debrief.png`)

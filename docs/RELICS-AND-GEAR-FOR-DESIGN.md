# Ringward — Relics & Gear (for Claude Design)

**Source of truth:** `src/data/relics.js` + the `RELIC_SETS` block in `src/screens/SeamLab.jsx` (live game). Generated 2026-06-12 — if the game changes, regenerate from those.

## What "gear" is in Ringward
There is **no separate gear system** in the live game. **Relics ARE the equippable loadout** — the run's gear. (An old `src/data/gear.js` with "Cores/Echo/operator" behaviors exists but belongs to a *retired* auto-battler and is NOT in the live build — ignore it for design.)

A run's power comes from three stacked layers; relics are layer 3:
1. **Per-creature skill trees + innates** (permanent, on the grunling)
2. **Holdfast boons** (pick-one, per-climb)
3. **Relics** — the equippable loadout, the focus of this doc

## The relic system (what the UI must express)
- **Rarity tiers**, each with its own color language: **Common → Rare → Legendary → Keystone**.
- **Stat relics** = clean multipliers (HP, damage, healing, charge). **Verb relics** = a *rule*, not a number (e.g. "first hit on a full-HP enemy hits harder") — design these to read as a special, conditional thing, not a stat line.
- **Recut** (Forge): most relics can be re-forged into an **alternate "cut"** — same power budget, different build role (e.g. raw damage → tempo, or → freeze-synergy). It's a sidegrade, not an upgrade. UI: relic + a small "cut" selector.
- **Keystones**: the top tier you **don't find — you FORGE** (Forge tab, costs shards + a success %). Build-defining. Never drop in loot or summons.
- **Set bonuses**: equip **2+ members of a set** → a passive bonus. 4 sets (below). UI: a set-progress indicator on the loadout.
- **Currencies**: **slag** (one universal currency — recuts, swaps) and **shards** (forge keystones).

---

## RELICS (26)

Format: `icon · Name · [rarity] — effect — "lore"` (color = the hex the game uses for that relic's accent).

### Common (4) — one clean stat
- 🌰 **Ironwood Charm** `#c9a06a` — +18% max HP. — *"Blight-hardened heartwood. Heavy — and it makes you heavy too."*
- ⚡ **Quick Core** `#f5a623` — Start every fight +2 charge. — *"Still warm to the touch. It wants to go."*
- 💚 **Mender's Knot** `#7ed321` — Healing is +50% stronger. — *"Tied by a healer who climbed these rings before you."*
- 🪨 **Stoneblood** `#a89070` — +22% max HP. — *"Slow to bleed, slower to fall."*

### Rare (10) — bigger, often a second edge
- ⚔️ **Whetstone Fang** `#ff8a4a` — +35% damage. — *"A tooth filed to an edge that never seems to dull."*
- 🔥 **Ember Brand** `#ff5a2a` — Burns +2 stacks, +10% damage. — *"It smoulders against the cold of the deep rings."*
- 🛡️ **Bulwark Stone** `#7fd6ff` — +30% max HP and +30% shields. — *"A shard of the Fallen Gate that still remembers holding."*
- 🩸 **Reckless Charm** `#ff6b6b` — +55% damage, −18% max HP. — *"Climb angry, climb fast — and mind the long way down."*
- 🎯 **Ambusher's Edge** `#ffd166` — *(verb)* First hit on a full-HP enemy: +25% damage. — *"Strike before they know you are even there."*
- ❄️ **Frostbite Charm** `#7fd6ff` — *(verb)* Hits on a FROZEN enemy deal +50%. Pairs with a Warden. — *"Cold makes a thing brittle. Then you break it."*
- 😤 **Wrathcore** `#ff5a3c` — +42% damage, −12% healing. — *"All forward. Mending is for after — if there is an after."*
- 🧰 **Surgeon's Kit** `#7be0a0` — +70% healing, −12% damage. — *"Keep everyone standing and the rest sorts itself out."*
- 🌵 **Bramble Hide** `#7fae5a` — *(verb)* Attackers take 25% of their hit straight back. — *"Touch a thornbush and it touches you back."*
- 🌀 **Reservoir Core** `#f5a623` — *(verb)* Every kill banks +2 charge on the grunling that landed it. — *"It drinks the last spark of whatever falls to you."*

### Legendary (8) — run-defining, with a real trade
- ❤️‍🔥 **Bloodpact** `#ff4d6d` — +30% damage, +40% healing, −10% HP. — *"What you pour out comes back doubled. Some of you stays behind."*
- 🗡️ **Glass Edge** `#e8e2ff` — +70% damage, −30% max HP. — *"It cuts through anything. Including the hand that holds it."*
- ✦ **Drop-Shard** `#e8a040` — +18% damage, +18% HP, +1 charge. — *"A splinter of whatever fell. It hums in tune with your cores."*
- 🐺 **Hunter's Totem** `#ff7a9c` — *(verb)* Every kill sharpens that grunling +8% damage — stacks all fight. — *"Blood remembers. The pack grows keener with every fall."*
- 🩸 **Vampiric Edge** `#c83a5a` — *(verb)* Heal 15% of all damage you deal. — *"It takes a little life each time it bites — and gives it to you."*
- 🔆 **Frenzy Totem** `#ffb84d` — +20% damage and start every fight +1 charge. — *"It will not let you wait. Neither will what is coming."*
- ☠️ **Reaper's Mark** `#c0c0d8` — *(verb)* +40% damage to enemies already below half HP. — *"Finish what the climb started. Leave nothing standing."*
- 🪶 **Phoenix Feather** `#ffb84d` — *(verb)* Each grunling survives one lethal blow per fight (revives at 30% HP). — *"It does not burn — it remembers how to come back."*

### Keystone (4) — FORGED, not found
- 🜸 **Warden's Keystone** `#9be7ff` — +28% max HP, +28% shields, +14% damage. — *"Two cores welded as one — the wall and the spear, finally on the same side."*
- 🔥 **Emberheart Core** `#ff5a2a` — Burns +3 stacks, +28% damage, start +1 charge. — *"A core that never cooled… and it is still angry."*
- 💧 **Lifespring Knot** `#6fe0a0` — Healing +70% stronger, +22% max HP. — *"Knotted from the clean water of the Stillpool."*
- 👑 **Drop-Forged Crown** `#e8a040` — +32% damage, +20% HP, +20% healing, start +1 charge. — *"To wear it is to carry a piece of the Drop inward."*

---

## RECUTS (Forge alternates — same power, different role)
Each relic's listed effect is **cut 0** (default). These are the alternates:
- **Whetstone Fang** → *Tempo Edge* (+28% dmg, +1 charge) · *Frostfang* (+30% dmg, frozen-shatter)
- **Ironwood Charm** → *Thornwood* (+12% HP, attackers take 5% back)
- **Bulwark Stone** → *Bastion* (+24% HP/shields, 10% thorns) · *Lifewall* (+24% HP, +14% healing)
- **Bloodpact** → *Berserker's Pact* (+48% dmg, −10% HP) · *Bloodwell* (+17% dmg, 9% lifesteal, −10% HP)
- **Drop-Shard** → *Edge-Shard* (+25% dmg, +1 charge)
- **Stoneblood** → *Spineblood* (+16% HP, 5% thorns)
- **Ember Brand** → *Searbrand* (+16% dmg, +1 burn stack)
- **Reckless Charm** → *Bloodrage* (+48% dmg, +1 charge, −15% HP)
- **Wrathcore** → *Warcry* (+34% dmg, +1 charge, −12% healing)
- **Bramble Hide** → *Razorvine* (+8% dmg, 12% thorns)
- **Reservoir Core** → *Surge Core* (+1 kill-charge, +8% dmg)
- **Glass Edge** → *Edgewalker* (+56% dmg, +1 charge, −25% HP)
- **Frenzy Totem** → *Onslaught* (+26% dmg, trades the charge for raw power)

*(Verb relics like Ambusher's Edge, Frostbite, Hunter's Totem, Vampiric Edge, Phoenix, Reaper's Mark are intentionally single-purpose — no recuts.)*

---

## SET BONUSES (equip 2+ members → bonus)
- 🔥 **Berserker** — +12% damage — *members:* Whetstone Fang, Reckless Charm, Wrathcore, Glass Edge, Bloodpact, Frenzy Totem
- 🛡️ **Stonehide** — +12% max HP — *members:* Ironwood Charm, Stoneblood, Bulwark Stone, Bramble Hide
- 🩸 **Lifeblood** — +8% lifesteal — *members:* Vampiric Edge, Bloodpact, Mender's Knot, Surgeon's Kit, Reckless Charm
- ⚡ **Tempo** — start every fight +1 charge — *members:* Quick Core, Reservoir Core, Frenzy Totem, Drop-Shard

---

## Design prompts (paste these into Claude Design)
- "Design the **relic loadout screen**: equipped relics + the run's stat summary, with a **set-bonus progress** indicator (2+ members lights the set). Rarity color language: Common (muted), Rare (each relic's accent), Legendary (rich), Keystone (forged/special). Use the icons + accent hexes above."
- "Design a **relic card** that distinguishes **stat relics** (clean number lines) from **verb relics** (a conditional *rule*, shown as a special trait, not a stat). Include name, icon, rarity, effect, and a one-line lore."
- "Design the **Forge** flow for **Recut** (swap a relic to an alternate cut — same power, different role) and **Keystone forging** (spend shards + a success %, the only way to get the 4 keystones)."
- "Design a **relic-drop reward** moment (loot pick) that reads rarity instantly and shows how a new relic interacts with the equipped set."

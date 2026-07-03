# Ringward Tactics — Midjourney prompt pack (weird-West vs the monster world)

Ready-to-paste prompts for the launch art. Style goal: **weird-West / gaslamp-steampunk frontier**, grim folk tone, readable game silhouettes. Use a consistent style suffix so the set hangs together. Generate top-down/3-4 view sprites you can crop for the tactics grid (256–512px), OR full-body refs to lock a look first.

**Shared style suffix (append to each):**
`weird-west gaslamp frontier, muted dust-and-brass palette, grim folk tone, clean readable silhouette, game character sprite, plain dark background, semi-realistic stylized, dramatic rim light --ar 2:3 --style raw --stylize 200 --v 7 --no text, logo, watermark, modern, neon`

---

## The 6 soldiers (your company)
1. **Sharpshooter** — `a lean frontier markswoman in a long oilskin duster, wide-brim hat, brass-scoped long rifle slung, weathered calm face, bandolier`
2. **Ironclad** — `a hulking frontier soldier in riveted steam-plate armor and a slab pauldron, short scattergun, helmet with a narrow vision slit, heavy and immovable`
3. **Bombardier** — `a soot-stained frontier grenadier, leather apron and goggles, satchel of brass grenades, a stubby carbine, bandolier of shells`
4. **Sawbones** — `a frontier field-surgeon in a blood-flecked coat, leather medical satchel and bone-saw, a sidearm, tired steady eyes, rolled sleeves`
5. **Outrider** — `a fast frontier scout in light riding leathers and spurred boots, a coachgun, scarf over the mouth, lean and quick, dust trailing`
6. **Bannerman** — `a frontier officer with a tattered company standard on the back, brass repeater rifle, long coat with rank cord, commanding weary stance`

## The 5 Rim enemy families (the monster world, ring 1 forms)
1. **Raider (goblin)** — `a wiry feral goblin raider, scavenged scrap armor, jagged cleaver, hunched aggressive stance, sickly green-grey skin, glowing eyes`
2. **Brute (ogre)** — `a massive hulking ogre, slabs of muscle and crude iron, a great stone maul, dull brutal face, scarred grey hide`
3. **Flyer (harpy)** — `a swift harpy, broad feathered wings, taloned limbs, half-bird half-woman, shrieking dive pose, ragged plumage, airborne`
4. **Caster (shaman)** — `a hooded monster shaman wreathed in cold blue hex-light, bone fetishes and a crooked staff, casting a withering curse, eerie`
5. **Swarm (wolf)** — `a gaunt feral dire-wolf of the Drop, mangy fur and too many teeth, low predatory lunge, glowing eyes, pack-beast`

## Deeper-ring evolutions (for later — same family, scarier coat)
- Raiders → **orc soldiers** → **elite frontier hunters**
- Brutes → **trolls** → **stone giants**
- Flyers → **griffins** → **crystal-wing creatures**
- Casters → **war-mages** → **core speakers**
- Swarms → **giant insects** → **living shards**

## Workflow
1. Run all 11 (6 soldiers + 5 families) once to find looks. 2. Re-roll favorites, lock one ref each. 3. Use the locked ref as a `--cref` for a clean neutral-pose sprite, then run through **PixelLab** (`scripts/pixellab/`) for the per-state frames the game loads. The game already supports both animated frame-folders and single static images, so even one good image per unit drops straight in.

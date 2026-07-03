// themeSystem.js — §28 Cosmetic Theme System: LOGIC + MODE-WALL.
//
// Pure resolution logic over the theme data. THREE jobs (§28):
//   1. Resolve a creature's appearance (default-or-equipped, tier-clamped).
//   2. Enforce the mode-wall: PvE = honest render (motion grammar LOCKED, no
//      disguise); PvP = player-controlled look (color, and the reserved motion/
//      Type disguise hook).
//   3. Guarantee combat fairness: `combatType()` is the ONLY thing the engine
//      should ever read for Type, and it is BLIND to themes/disguise. Skins never
//      touch the math (§28 hard constraint: "engine always resolves true").
//
// No power, no VFX — data/logic only.

import {
  THEMES,
  isThemeId,
  MAX_TIER,
  MOTION_GRAMMAR,
  ARCHETYPE_TO_TYPE,
  TYPE_DEFAULT_THEME,
  CREATURE_DEFAULT_THEME,
  TIER_UNLOCK_LEVEL,
} from '../data/themes.js';
import { BASE, TYPE_COLORS } from '../data/designTokens.js';
import { HUNTING_GROUNDS } from './waves.js';

const STORAGE_KEY = 'ringward.themes.v1';

// ── RING THEMES (vF-CA feel pass) — the look of each of the 8 rings as a backdrop. ──
// One visual theme per ring, derived ENTIRELY from data that already exists: each ring's
// creature cluster (waves.js HUNTING_GROUNDS) leans on ONE Type, so that Type's color (from
// designTokens TYPE_COLORS) is the ring's accent, and its dim shade tints the dark backdrop
// gradient. No new colors — the earthen BASE + the eight Type identities, nothing else.
//   bgGradient   — dark → slightly-less-dark CSS gradient (a backdrop, never wallpaper)
//   accentColor  — the ring's dominant Type color (e.g. outer ring = Reactor orange)
//   particleHint — a tag for a FUTURE particle layer (stored, not yet implemented)
//   label        — the ring's name, for the faint watermark
//
// Each ring's dominant Type + its atmosphere tag. Verified against waves.js biasIds →
// roster types: outer=Reactor, fallen-gate=Bulwark, green-seam=Mender, storm-wire=Booster,
// fast-trails=Striker, lightless=Assassin, witherfen=Hexer, frostbound=Warden.
const RING_FEEL = {
  'outer-ring':  { type: 'Reactor',  particleHint: 'embers' },
  'fallen-gate': { type: 'Bulwark',  particleHint: 'dark'   },
  'green-seam':  { type: 'Mender',   particleHint: 'roots'  },
  'storm-wire':  { type: 'Booster',  particleHint: 'static' },
  'fast-trails': { type: 'Striker',  particleHint: 'mist'   },
  'lightless':   { type: 'Assassin', particleHint: 'void'   },
  'witherfen':   { type: 'Hexer',    particleHint: 'spores' },
  'frostbound':  { type: 'Warden',   particleHint: 'frost'  },
};

// Build the table once from HUNTING_GROUNDS (the ring names) + RING_FEEL (the Type/tag).
export const RING_THEMES = Object.fromEntries(
  HUNTING_GROUNDS.map((g) => {
    const feel = RING_FEEL[g.id];
    if (!feel) return [g.id, null];
    const tc = TYPE_COLORS[feel.type] || {};
    const dim = tc.dim || BASE.stone; // the Type's dark shade; the "slightly less dark" end
    return [g.id, {
      // dark (pitch) → panel → the Type's dark dim corner: an earthen backdrop, faintly
      // colored by the ring's creatures. Stays dark enough that foreground UI keeps reading.
      bgGradient: `linear-gradient(160deg, ${BASE.pitch} 0%, ${BASE.panel} 52%, ${dim} 100%)`,
      accentColor: tc.color || BASE.gold,
      particleHint: feel.particleHint,
      label: g.name,
    }];
  })
);

// The theme for a ring, or null when there's no active ring (e.g. sandbox) — callers
// render no backdrop on null (fail silently).
export function ringTheme(ringId) {
  return (ringId && RING_THEMES[ringId]) || null;
}

// ── True Type (the engine read) ────────────────────────────────────────────────
// Prefers the §23 `type` field (new combat module); falls back to mapping the
// legacy `archetype`. NEVER influenced by a theme or disguise.
export function combatType(creature) {
  if (creature.type && MOTION_GRAMMAR[creature.type]) return creature.type;
  return ARCHETYPE_TO_TYPE[creature.archetype] ?? creature.type ?? creature.archetype ?? null;
}

const creatureKey = (creature) => creature.instanceId ?? creature.id;

// ── Defaults & unlocks ───────────────────────────────────────────────────────
export function defaultThemeFor(creature) {
  const byId = CREATURE_DEFAULT_THEME[creature.id];
  if (byId && isThemeId(byId)) return byId;
  const type = combatType(creature);
  return TYPE_DEFAULT_THEME[type] ?? 'light';
}

// Highest theme tier a creature has earned, gated by skill level (§28 §5).
export function maxUnlockedTier(creature) {
  const level = creature.level ?? 1;
  let tier = 1;
  for (let t = 2; t <= MAX_TIER; t++) {
    if (level >= (TIER_UNLOCK_LEVEL[t] ?? Infinity)) tier = t;
  }
  return tier;
}

// ── Persistence (§28: "selection persists; switching is free and instant") ─────
// Storage is injectable so this is testable headless; defaults to localStorage.
function getStore(store) {
  if (store) return store;
  if (typeof localStorage !== 'undefined') return localStorage;
  return null;
}

function readAll(store) {
  const s = getStore(store);
  if (!s) return {};
  try { return JSON.parse(s.getItem(STORAGE_KEY) || '{}'); } catch { return {}; }
}

function writeAll(map, store) {
  const s = getStore(store);
  if (!s) return;
  s.setItem(STORAGE_KEY, JSON.stringify(map));
}

// What the player has equipped (raw), or null if they've never touched it.
export function getEquipped(creature, store) {
  return readAll(store)[creatureKey(creature)] ?? null;
}

// Equip a theme/tier (and optional PvP-only disguise Type). Validates + persists.
export function setEquipped(creature, { themeId, tier, disguiseType } = {}, store) {
  const map = readAll(store);
  const cur = map[creatureKey(creature)] ?? {};
  const next = { ...cur };
  if (themeId !== undefined && isThemeId(themeId)) next.themeId = themeId;
  if (tier !== undefined) next.tier = Math.max(1, Math.min(MAX_TIER, tier));
  if (disguiseType !== undefined) next.disguiseType = disguiseType; // honored only in PvP
  map[creatureKey(creature)] = next;
  writeAll(map, store);
  return next;
}

// ── The mode-wall (§28 §6) ──────────────────────────────────────────────────────
// Resolve the full cosmetic appearance for a render context. `mode` is 'pve'
// (default — legibility guaranteed) or 'pvp' (legibility released).
export function resolveAppearance(creature, mode = 'pve', store) {
  const trueType = combatType(creature);
  const equipped = getEquipped(creature, store) ?? {};
  const unlocked = maxUnlockedTier(creature);

  // Material/color theme applies in BOTH modes (it never misleads on its own).
  const themeId = isThemeId(equipped.themeId) ? equipped.themeId : defaultThemeFor(creature);
  const tier = Math.min(equipped.tier ?? 1, unlocked); // clamp to what's earned

  const isPvp = mode === 'pvp';
  // Disguise (a misleading Type/motion) is PvP-ONLY. In PvE the displayed Type and
  // the motion grammar are ALWAYS the true ones — the firewall that protects the
  // teaching voice (§28 §6 "disguise is PvP-only — never PvE/contracts").
  const disguiseType =
    isPvp && equipped.disguiseType && MOTION_GRAMMAR[equipped.disguiseType]
      ? equipped.disguiseType
      : null;
  const displayedType = disguiseType ?? trueType;

  return {
    themeId,
    tier,
    coreGlow: THEMES[themeId].coreGlow,
    displayedType,                                   // what the viewer is shown
    motionGrammar: MOTION_GRAMMAR[displayedType] ?? MOTION_GRAMMAR[trueType],
    motionLocked: !isPvp,                            // PvE locks motion to true Type
    honest: !isPvp || displayedType === trueType,    // PvE always honest
    disguised: displayedType !== trueType,
  };
}

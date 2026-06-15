// manifest.js — the single source of truth for authored audio assets.
//
// Each entry maps a LOGICAL sound name (the same names sfx.js / music.js expose) to a
// file path under /public/audio + a default volume (0..1). Tuning levels lives HERE so a
// balance pass never has to touch playback code.
//
// Files don't have to exist yet: sfx.js falls back to its procedural synth when a buffer
// is missing, and music.js falls back to the procedural ambient pad. Drop authored MP3s
// into public/audio/** and they take over automatically — no code change needed.
//
// Vite serves /public/* at the site root, so "/audio/sfx/foo.mp3" is the live URL.

// ── Sound effects (short, decoded into AudioBuffers, fired on game events) ──────────────
export const SFX = {
  // Combat
  chargeUp:      { src: '/audio/sfx/charge-up.mp3',      vol: 0.8 },
  payoff:        { src: '/audio/sfx/payoff-hit.mp3',     vol: 0.9 },
  wildcard:      { src: '/audio/sfx/wildcard.mp3',       vol: 0.85 },
  shieldAbsorb:  { src: '/audio/sfx/shield-block.mp3',   vol: 0.8 },
  healLand:      { src: '/audio/sfx/heal.mp3',           vol: 0.75 },
  regenTick:     { src: '/audio/sfx/regen-tick.mp3',     vol: 0.6 },
  burnTick:      { src: '/audio/sfx/burn-tick.mp3',      vol: 0.6 },
  dotTick:       { src: '/audio/sfx/dot-tick.mp3',       vol: 0.6 },  // poison/doom/hexbleed/thorns/blight
  ampStack:      { src: '/audio/sfx/amp-buff.mp3',       vol: 0.7 },
  // Run / UI
  upgradePick:   { src: '/audio/sfx/upgrade-pick.mp3',   vol: 0.8 },
  forgeBuy:      { src: '/audio/sfx/forge-buy.mp3',      vol: 0.8 },
  waveClear:     { src: '/audio/sfx/wave-clear.mp3',     vol: 0.85 },
  // Wayside-node stingers
  merchantBell:  { src: '/audio/sfx/merchant-bell.mp3',  vol: 0.8 },
  treasureChime: { src: '/audio/sfx/treasure-chime.mp3', vol: 0.8 },
  eliteGrowl:    { src: '/audio/sfx/elite-growl.mp3',    vol: 0.9 },
  // Outcomes
  ringTaken:     { src: '/audio/sfx/ring-taken.mp3',     vol: 0.9 },
  squadDown:     { src: '/audio/sfx/squad-down.mp3',     vol: 0.85 },
  caughtCreature:{ src: '/audio/sfx/creature-caught.mp3',vol: 0.9 },
  // Story spine
  ringThreshold: { src: '/audio/sfx/ring-threshold.mp3', vol: 0.85 },
  theDrop:       { src: '/audio/sfx/the-drop.mp3',       vol: 0.95 },
  sceneTurn:     { src: '/audio/sfx/scene-turn.mp3',     vol: 0.6 },
};

// ── Music (looping background beds, streamed via HTMLAudioElement) ───────────────────────
export const MUSIC = {
  title: { src: '/audio/music/title-theme.mp3', vol: 0.55 }, // home / menu
  rim:   { src: '/audio/music/rim-bed.mp3',     vol: 0.45 }, // rings 1–3
  mid:   { src: '/audio/music/mid-bed.mp3',     vol: 0.45 }, // rings 4–6
  deep:  { src: '/audio/music/deep-bed.mp3',    vol: 0.45 }, // rings 7–8
  boss:  { src: '/audio/music/boss-battle.mp3', vol: 0.55 }, // ring boss / elite
};

// Which exploration bed plays at a given ring depth.
export function bandForDepth(depth) {
  if (depth >= 7) return 'deep';
  if (depth >= 4) return 'mid';
  return 'rim';
}

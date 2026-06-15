// sfx.js — in-game sound effects.
//
// AUTHORED-FIRST, SYNTH-FALLBACK: on the first user gesture we preload the MP3s listed in
// audio/manifest.js into decoded AudioBuffers. When a sound fires, we play its buffer if it
// loaded; otherwise we fall back to the original PROCEDURAL synthesis (oscillators + gain
// envelopes) so the game is never silent before the authored assets exist.
//
// Call sfx.resume() on the first user gesture to unlock the AudioContext (browser autoplay
// policy) and kick off the preload. After that every exported function just works.

import { SFX } from './audio/manifest.js';

let _ctx = null;
// SFX mute — gates BOTH file playback and the synth primitives. Ambient MUSIC has its own
// path (music.js + startAmbient/stopAmbient), so muting SFX never touches the music. Set
// from the Settings overlay; the React layer owns persistence.
let _muted = false;
let _vol = 1;             // master SFX volume (0..1), times each sound's manifest vol
export function setMuted(b) { _muted = !!b; }
export function isMuted() { return _muted; }
export function setVolume(v) { _vol = Math.max(0, Math.min(1, v)); }
export function getVolume() { return _vol; }

function ctx() {
  if (!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (_ctx.state === 'suspended') _ctx.resume();
  return _ctx;
}

export function resume() { ctx(); preload(); }

function now() { return ctx().currentTime; }

// ── Authored-sample layer ────────────────────────────────────────────────────
const _buffers = {};   // name → decoded AudioBuffer (only present once loaded)
let _loaded = false;

function preload() {
  if (_loaded) return;
  _loaded = true;
  const c = ctx();
  Object.entries(SFX).forEach(([name, def]) => {
    fetch(def.src)
      .then((r) => { if (!r.ok) throw new Error('missing'); return r.arrayBuffer(); })
      .then((ab) => c.decodeAudioData(ab))
      .then((buf) => { _buffers[name] = buf; })
      .catch(() => { /* no file yet → synth fallback handles this sound */ });
  });
}

function playBuffer(name) {
  const buf = _buffers[name];
  if (!buf) return false;
  const c = ctx();
  const src = c.createBufferSource();
  const g = c.createGain();
  src.buffer = buf;
  g.gain.value = _vol * (SFX[name]?.vol ?? 1);
  src.connect(g); g.connect(c.destination);
  src.start();
  return true;
}

// Fire a named sound: authored sample if loaded, else the synth fallback (extra args, e.g.
// ringThreshold's depth, pass through to the synth).
function fire(name, ...args) {
  if (_muted) return;
  if (playBuffer(name)) return;
  const fn = SYN[name];
  if (fn) fn(...args);
}

// ── Synthesis primitives ─────────────────────────────────────────────────────

// One oscillator with a linear attack + exponential decay.
function tone(freq, type, start, end, peak, attack = 0.006) {
  const c = ctx();
  const o = c.createOscillator();
  const g = c.createGain();
  o.connect(g); g.connect(c.destination);
  o.type = type;
  o.frequency.setValueAtTime(freq, start);
  g.gain.setValueAtTime(0.001, start);
  g.gain.linearRampToValueAtTime(peak * _vol, start + attack);
  g.gain.exponentialRampToValueAtTime(0.001, end);
  o.start(start); o.stop(end);
}

// Frequency sweep with constant gain → exponential decay.
function sweep(f0, f1, type, dur, peak, delay = 0) {
  const start = now() + delay;
  const c = ctx();
  const o = c.createOscillator();
  const g = c.createGain();
  o.connect(g); g.connect(c.destination);
  o.type = type;
  o.frequency.setValueAtTime(f0, start);
  o.frequency.exponentialRampToValueAtTime(f1, start + dur);
  g.gain.setValueAtTime(peak * _vol, start);
  g.gain.exponentialRampToValueAtTime(0.001, start + dur);
  o.start(start); o.stop(start + dur);
}

// ── Synth fallbacks (the original procedural sounds) ──────────────────────────
// Reached only when the matching authored sample hasn't loaded. Mute is handled upstream
// in fire(), so these don't re-check it.
const SYN = {
  chargeUp() {
    sweep(260, 430, 'sine', 0.15, 0.2);
    const s = now();
    tone(900, 'sine', s + 0.05, s + 0.12, 0.07, 0.004);
  },
  payoff() {
    const s = now();
    tone(75,  'sine',     s, s + 0.55, 0.42, 0.008);
    tone(50,  'triangle', s, s + 0.55, 0.3,  0.008);
    tone(380, 'sawtooth', s, s + 0.1,  0.14, 0.004);
  },
  wildcard() {
    const s = now();
    tone(190, 'triangle', s, s + 0.3, 0.3, 0.007);
    sweep(460, 240, 'sine', 0.22, 0.18);
  },
  shieldAbsorb() {
    const s = now();
    tone(155, 'triangle', s, s + 0.22, 0.28, 0.005);
    tone(310, 'sine',     s, s + 0.1,  0.11, 0.005);
  },
  healLand() {
    const s = now();
    tone(440, 'sine', s,        s + 0.38, 0.22, 0.01);
    tone(660, 'sine', s + 0.04, s + 0.34, 0.14, 0.01);
    tone(880, 'sine', s + 0.08, s + 0.28, 0.08, 0.01);
  },
  regenTick() {
    const s = now();
    tone(528, 'sine', s,        s + 0.18, 0.13, 0.008);
    tone(792, 'sine', s + 0.04, s + 0.18, 0.07, 0.008);
  },
  burnTick() {
    sweep(1600, 800, 'sawtooth', 0.1, 0.09);
  },
  dotTick() {
    // Generic damage-over-time tick (poison/doom/hexbleed/thorns/blight): a duller fizz
    // than burn so stacked DoTs don't all read as fire.
    sweep(900, 500, 'sawtooth', 0.12, 0.07);
  },
  ampStack() {
    sweep(280, 680, 'sawtooth', 0.13, 0.13);
    sweep(420, 900, 'sine',     0.12, 0.09, 0.04);
  },
  upgradePick() {
    const s = now();
    tone(480, 'sine', s,        s + 0.12, 0.2,  0.007);
    tone(720, 'sine', s + 0.09, s + 0.2,  0.18, 0.007);
  },
  forgeBuy() {
    // Forge purchase: a short metallic two-tap.
    const s = now();
    tone(520, 'square', s,        s + 0.08, 0.12, 0.003);
    tone(660, 'square', s + 0.07, s + 0.16, 0.1,  0.003);
  },
  waveClear() {
    const s = now();
    [523, 659, 784].forEach((f, i) =>
      tone(f, 'sine', s + i * 0.13, s + i * 0.13 + 0.32, 0.24, 0.01));
  },
  merchantBell() {
    const s = now();
    tone(880,  'sine',     s,        s + 0.5,  0.18, 0.004);
    tone(1318, 'sine',     s + 0.01, s + 0.45, 0.1,  0.004);
    tone(660,  'triangle', s + 0.12, s + 0.5,  0.08, 0.01);
  },
  treasureChime() {
    const s = now();
    [784, 988, 1318, 1568].forEach((f, i) => tone(f, 'sine', s + i * 0.06, s + i * 0.06 + 0.4, 0.12, 0.004));
    tone(2093, 'sine', s + 0.28, s + 0.72, 0.06, 0.004);
  },
  eliteGrowl() {
    const s = now();
    tone(70,  'sawtooth', s, s + 0.7, 0.22, 0.02);
    tone(105, 'triangle', s, s + 0.6, 0.14, 0.02);
    sweep(300, 90, 'sawtooth', 0.5, 0.12);
  },
  ringTaken() {
    const s = now();
    [523, 659, 784, 1047].forEach((f, i) =>
      tone(f, 'sine', s + i * 0.12, s + i * 0.12 + 0.36, 0.25, 0.01));
    const bloom = s + 4 * 0.12 + 0.06;
    [523, 659, 784, 1047].forEach((f) =>
      tone(f, 'sine', bloom, bloom + 0.9, 0.17, 0.02));
  },
  squadDown() {
    const s = now();
    tone(440, 'sine', s,        s + 0.48, 0.24, 0.01);
    tone(370, 'sine', s + 0.22, s + 0.68, 0.2,  0.01);
    tone(294, 'sine', s + 0.44, s + 0.9,  0.17, 0.01);
  },
  caughtCreature() {
    const s = now();
    [392, 523, 659, 784, 1047].forEach((f, i) =>
      tone(f, 'sine', s + i * 0.11, s + i * 0.11 + 0.32, 0.27, 0.01));
    const peak = s + 5 * 0.11;
    tone(1568, 'sine', peak,        peak + 0.42, 0.15, 0.01);
    tone(2093, 'sine', peak + 0.07, peak + 0.42, 0.1,  0.01);
  },
  ringThreshold(depth = 1) {
    const s = now();
    const t = Math.max(0, Math.min(7, depth - 1)) / 7; // 0 outer → 1 the Drop
    const root = 196 - t * 70;
    const dur = 1.1 + t * 0.9;
    tone(root,       'triangle', s,        s + dur,       0.22, 0.25);
    tone(root * 1.5, 'sine',     s + 0.05, s + dur * 0.8, 0.12, 0.3);
    tone(root * 2,   'sine',     s + 0.02, s + dur * 0.6, 0.07, 0.2);
    if (t < 0.7) tone(root * 6, 'sine', s + 0.08, s + 0.5 + (1 - t) * 0.6, 0.05, 0.1);
  },
  theDrop() {
    const c = ctx();
    const s = now();
    const master = c.createGain();
    master.gain.setValueAtTime(0.0001, s);
    master.gain.linearRampToValueAtTime(0.9 * _vol, s + 0.4);
    master.connect(c.destination);
    const chord = (freqs, at, dur, peak) => {
      freqs.forEach((f, i) => {
        const o = c.createOscillator(); const g = c.createGain();
        o.connect(g); g.connect(master);
        o.type = i === 0 ? 'triangle' : 'sine';
        o.frequency.setValueAtTime(f, at);
        g.gain.setValueAtTime(0.0001, at);
        g.gain.linearRampToValueAtTime(peak, at + 0.12);
        g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
        o.start(at); o.stop(at + dur);
      });
    };
    chord([130.8, 261.6, 329.6], s,        1.5, 0.18);  // C
    chord([110.0, 261.6, 329.6], s + 1.3,  1.5, 0.18);  // Am
    chord([174.6, 261.6, 349.2], s + 2.6,  1.5, 0.18);  // F
    chord([196.0, 293.7, 392.0], s + 3.9,  1.4, 0.18);  // G
    chord([130.8, 261.6, 329.6, 392.0, 523.3], s + 5.1, 3.2, 0.2);
    tone(1046.5, 'sine', s + 5.2, s + 7.5, 0.1, 0.05);
    tone(1568.0, 'sine', s + 5.4, s + 7.2, 0.06, 0.05);
  },
  sceneTurn() {
    const s = now();
    tone(220, 'sine',     s,        s + 0.18, 0.12, 0.01);
    tone(330, 'triangle', s + 0.02, s + 0.22, 0.07, 0.02);
    sweep(520, 300, 'sine', 0.2, 0.06, 0.01);
  },
};

// ── Public SFX surface (same names as before; file-first, synth-fallback) ──────
export const chargeUp       = () => fire('chargeUp');
export const payoff         = () => fire('payoff');
export const wildcard       = () => fire('wildcard');
export const shieldAbsorb   = () => fire('shieldAbsorb');
export const healLand       = () => fire('healLand');
export const regenTick      = () => fire('regenTick');
export const burnTick       = () => fire('burnTick');
export const dotTick        = () => fire('dotTick');
export const ampStack       = () => fire('ampStack');
export const upgradePick    = () => fire('upgradePick');
export const forgeBuy       = () => fire('forgeBuy');
export const waveClear      = () => fire('waveClear');
export const merchantBell   = () => fire('merchantBell');
export const treasureChime  = () => fire('treasureChime');
export const eliteGrowl     = () => fire('eliteGrowl');
export const ringTaken      = () => fire('ringTaken');
export const squadDown      = () => fire('squadDown');
export const caughtCreature = () => fire('caughtCreature');
export const ringThreshold  = (depth = 1) => fire('ringThreshold', depth);
export const theDrop        = () => fire('theDrop');
export const sceneTurn      = () => fire('sceneTurn');

// ── Ambient pad — the PROCEDURAL fallback the music manager stands up when an authored
// track is missing. Once real beds exist in audio/manifest.js, music.js plays those instead
// and this never runs. Kept very quiet; lives behind its own master gain to fade cleanly. ──
let _ambient = null;
export function startAmbient() {
  if (_ambient) return;
  const c = ctx();
  const master = c.createGain();
  master.gain.setValueAtTime(0.0001, now());
  master.gain.linearRampToValueAtTime(0.05, now() + 2.5);
  master.connect(c.destination);
  const palette = [
    [110.0, 164.8, 220.0],   // Am
    [130.8, 196.0, 261.6],   // C
    [146.8, 220.0, 293.7],   // Dm
    [98.0,  146.8, 196.0],   // G
  ];
  let i = 0;
  const swell = () => {
    if (!_ambient) return;
    const freqs = palette[i % palette.length]; i += 1;
    const at = now();
    freqs.forEach((f, k) => {
      const o = c.createOscillator(); const g = c.createGain();
      o.connect(g); g.connect(master);
      o.type = k === 0 ? 'triangle' : 'sine';
      o.frequency.setValueAtTime(f * (k === 2 ? 1.001 : 1), at);
      g.gain.setValueAtTime(0.0001, at);
      g.gain.linearRampToValueAtTime(0.5 / (k + 1), at + 2.4);
      g.gain.exponentialRampToValueAtTime(0.0001, at + 6.5);
      o.start(at); o.stop(at + 6.8);
    });
  };
  swell();
  const timer = setInterval(swell, 5200);
  _ambient = { master, timer };
}
export function stopAmbient() {
  if (!_ambient) return;
  const { master, timer } = _ambient;
  clearInterval(timer);
  try { master.gain.exponentialRampToValueAtTime(0.0001, now() + 1.2); } catch { /* best-effort fade */ }
  _ambient = null;
}
export function ambientOn() { return !!_ambient; }

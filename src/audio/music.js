// music.js — looping background music manager (separate from sfx.js).
//
// Streams authored tracks via HTMLAudioElement (music files are large; no need to fully
// decode them like SFX). Crossfades between tracks, loops, and carries its own volume.
//
// Graceful fallback: if a track's file is missing (404) the manager falls back to the
// PROCEDURAL ambient pad in sfx.js, so the climb is never dead-silent before the authored
// music exists. Autoplay policy: if the browser blocks playback before a user gesture, the
// manager retries on the first pointer/key event.

import { MUSIC } from './manifest.js';
import * as sfx from '../sfx.js';

let _vol = 0.7;            // master music volume (0..1), times each track's manifest vol
let _curId = null;         // logical track currently desired
let _curEl = null;         // the HTMLAudioElement actually playing a file (or null)
let _curDefVol = 1;        // current track's manifest volume
let _usingFallback = false;// true while the procedural ambient pad is standing in
let _gestureHooked = false;

const clamp = (v) => Math.max(0, Math.min(1, v));

export function setMusicVolume(v) {
  _vol = clamp(v);
  if (_curEl) _curEl.volume = _vol * _curDefVol;
}
export function getMusicVolume() { return _vol; }

// Linear volume ramp on an <audio> element (HTMLAudio has no built-in fade).
function fade(el, from, to, ms, done) {
  const steps = 16, dt = Math.max(8, ms / steps);
  let i = 0; el.volume = clamp(from);
  const t = setInterval(() => {
    i += 1;
    el.volume = clamp(from + (to - from) * (i / steps));
    if (i >= steps) { clearInterval(t); if (done) done(); }
  }, dt);
}

// Retry the desired track once the user interacts (clears an autoplay block).
function hookGesture() {
  if (_gestureHooked) return;
  _gestureHooked = true;
  const retry = () => {
    _gestureHooked = false;
    if (_curId) { const id = _curId; _curId = null; playMusic(id); }
  };
  window.addEventListener('pointerdown', retry, { once: true });
  window.addEventListener('keydown', retry, { once: true });
}

function startFallbackPad() {
  if (!_usingFallback) { sfx.startAmbient(); _usingFallback = true; }
}
function stopFallbackPad() {
  if (_usingFallback) { sfx.stopAmbient(); _usingFallback = false; }
}

export function stopMusic() {
  _curId = null;
  if (_curEl) {
    const el = _curEl; _curEl = null;
    fade(el, el.volume, 0, 700, () => { try { el.pause(); } catch { /* best-effort */ } });
  }
  stopFallbackPad();
}

// Play a logical track (key in MUSIC). No-op if it's already the current track, so the
// caller can fire this on every render without re-triggering crossfades.
export function playMusic(trackId) {
  if (trackId === _curId) return;
  const def = MUSIC[trackId];
  _curId = trackId;
  if (!def) { stopMusic(); _curId = trackId; return; }

  // Fade out whatever's currently playing.
  const oldEl = _curEl;
  const oldFallback = _usingFallback;
  _curEl = null; _usingFallback = false;
  if (oldEl) fade(oldEl, oldEl.volume, 0, 600, () => { try { oldEl.pause(); } catch { /* best-effort */ } });

  const el = new Audio(def.src);
  el.loop = true; el.preload = 'auto'; el.volume = 0;
  _curDefVol = def.vol ?? 1;

  let settled = false;
  const fallback = () => {
    if (settled) return; settled = true;
    if (_curId !== trackId) return;     // superseded by a newer request
    if (oldFallback) { _usingFallback = true; return; } // pad already running — keep it
    startFallbackPad();
  };
  // A hard load error (404 / decode) → procedural pad.
  el.addEventListener('error', fallback, { once: true });

  const p = el.play();
  if (p && typeof p.then === 'function') {
    p.then(() => {
      settled = true;
      if (_curId !== trackId) { try { el.pause(); } catch { /* best-effort */ } return; }
      if (oldFallback) stopFallbackPad();   // real file took over from the pad
      _curEl = el; _usingFallback = false;
      fade(el, 0, _vol * _curDefVol, 700);
    }).catch((err) => {
      if (_curId !== trackId) return;
      // Autoplay blocked → retry on first gesture; anything else → procedural pad.
      if (err && err.name === 'NotAllowedError') hookGesture();
      else fallback();
    });
  }
}

export function currentTrack() { return _curId; }

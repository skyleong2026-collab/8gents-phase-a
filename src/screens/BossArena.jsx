// BossArena — STANDALONE test of BOSS-STAGE DIFFERENTIATION. <url>/#boss.
// Same Outer-Ring world + asset family as the combat stage, but STAGED FOR DANGER: a tighter, taller,
// more enclosed backdrop (boss_stage), heavy foreground rocks pressing in from the edges (boss_fg),
// the boss occupying far more visual territory, the squad dwarfed at its feet. Opens on a boss REVEAL.
// The test: does it feel dangerous with the UI removed? Same staging system as #director — no new tech,
// just composition. Reuses existing pixel assets (evolved Cinderpaw = boss).
import { useState, useEffect, useRef } from 'react';

const ROT = '/art/creatures/cinderpaw/character_v3';
const EVO = '/art/creatures/cinderpaw/evolved_charv3';
const ENV = '/art/env/outer-ring';
const MATTE_H = 22;

// COMBAT MASTER positions: boss big & dominant (right) but NOT a portrait — squad reads clearly (left),
// off-center/asymmetric. The dramatic "boss owns the frame" look is achieved by a reveal/insert push-in,
// not by the base staging. (Reveal = emotion; Master = gameplay.)
const F = {
  H1: { sprite: `${ROT}/rot_02.png`, x: 14, y: 92, w: 13, face: 1 },
  H2: { sprite: `${ROT}/rot_02.png`, x: 23, y: 96, w: 12, face: 1 },
  H3: { sprite: `${ROT}/rot_02.png`, x: 18, y: 94, w: 14, face: 1 }, // carry
  B:  { sprite: `${EVO}/rot_01.png`, x: 73, y: 92, w: 34, face: -1 }, // the Cinder Maw — big, right, off-center
};

// Master = the readable combat frame. The dramatic boss-dominant look lives ONLY in the reveal/insert
// (a push-in), so it stays rare and powerful.
const BEATS = [
  { name: 'THE CINDER MAW', fx: 73, fy: 60, z: 1.55, cy: 64, ms: 2400 },     // REVEAL/insert → boss dominates
  { name: 'MASTER', master: true, ms: 2800 },                                 // readable: boss right, squad reads left
  { name: 'BOSS · strikes', fx: 73, fy: 62, z: 1.5, cy: 60, actor: 'B', shake: true, ms: 1100 },
  { name: 'SQUAD · braces', fx: 18, fy: 92, z: 2.3, target: 'H3', ms: 850 },
  { name: 'MASTER', master: true, ms: 2600 },
  { name: 'BOSS · looms', fx: 73, fy: 56, z: 1.45, cy: 68, ms: 1400 },
  { name: 'MASTER', master: true, ms: 2400 },
];

function Fighter({ def, anim, beat }) {
  const a = def.face > 0 ? 'r' : 'l';
  const motion = anim === 'attack' ? `bos-lunge-${a} .55s ease-out`
    : anim === 'hurt' ? `bos-hurt-${a} .45s ease-in-out`
    : `bos-bob 1.8s ease-in-out infinite`;
  return (
    <div style={{ position: 'absolute', left: `${def.x}%`, top: `${def.y}%`, width: `${def.w}%`, transform: 'translate(-50%, -100%)' }}>
      <div style={{ position: 'absolute', bottom: '-2%', left: '22%', width: '56%', paddingBottom: '8%',
        borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(0,0,0,0.62), rgba(0,0,0,0.22) 55%, transparent 76%)' }} />
      <div key={beat} style={{ animation: motion, position: 'relative' }}>
        <img src={def.sprite} alt="" style={{ width: '100%', display: 'block', imageRendering: 'pixelated',
          filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.55))' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '32%', mixBlendMode: 'multiply',
          pointerEvents: 'none', background: 'linear-gradient(to top, rgba(18,8,20,0.55), transparent)' }} />
      </div>
    </div>
  );
}

export default function BossArena() {
  const [bi, setBi] = useState(0);
  const idx = useRef(0);
  useEffect(() => {
    let alive = true;
    const run = () => { if (!alive) return; setBi(idx.current % BEATS.length); const b = BEATS[idx.current % BEATS.length];
      setTimeout(() => { idx.current += 1; run(); }, b.ms); };
    run();
    return () => { alive = false; };
  }, []);
  const b = BEATS[bi];
  const cx = b.cx ?? 50, cy = b.cy ?? 50;
  const cam = b.master ? 'none' : `scale(${b.z}) translate(${cx / b.z - b.fx}%, ${cy / b.z - b.fy}%)`;
  const animOf = (id) => (b.actor === id ? 'attack' : b.target === id ? 'hurt' : 'idle');

  return (
    <div style={{ minHeight: '100vh', background: '#06060c', color: '#e8e8f0', fontFamily: 'system-ui, sans-serif', padding: '18px 16px 50px' }}>
      <style>{`
        @keyframes bos-bob { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-3%) } }
        @keyframes bos-lunge-r { 0%,100% { transform: translateX(0) } 45% { transform: translateX(20%) scale(1.04) } }
        @keyframes bos-lunge-l { 0%,100% { transform: translateX(0) } 45% { transform: translateX(-12%) scale(1.05) } }
        @keyframes bos-hurt-r { 0%,100% { transform: translateX(0); filter: none } 30% { transform: translateX(-18%) rotate(8deg); filter: brightness(2) sepia(1) hue-rotate(-30deg) saturate(4) } }
        @keyframes bos-hurt-l { 0%,100% { transform: translateX(0); filter: none } 30% { transform: translateX(18%) rotate(-8deg); filter: brightness(2) sepia(1) hue-rotate(-30deg) saturate(4) } }
        @keyframes bos-shake { 0%,100% { transform: translate(0,0) } 20% { transform: translate(-1.8%,1.1%) } 45% { transform: translate(1.8%,-1.1%) } 70% { transform: translate(-1.1%,-0.6%) } }
      `}</style>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: 1, color: '#ff5a4a' }}>BOSS ARENA · staged for danger</div>
        <div style={{ fontSize: 13, color: '#9aa0b0', marginTop: 4 }}>
          Same world + asset family as the combat stage — but tighter, taller, rocks pressing in, the boss
          owning the frame. The freeze-frame test: does it feel <i>dangerous</i> with the UI off? Now:&nbsp;
          <b style={{ color: b.master ? '#9be7ff' : '#ff9a7a' }}>{b.name}</b>
        </div>

        <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', marginTop: 14,
          borderRadius: 12, overflow: 'hidden', border: '1px solid #2a2a3a', background: '#140a12' }}>
          {/* stage window above the matte */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: `${MATTE_H}%`, overflow: 'hidden' }}>
            <div key={`sh${bi}`} style={{ position: 'absolute', inset: 0, animation: b.shake ? 'bos-shake .34s ease-in-out' : 'none' }}>
              <div style={{ position: 'absolute', inset: 0, transformOrigin: '0 0', transform: cam, transition: 'none' }}>
                <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${ENV}/boss_stage.png)`,
                  backgroundSize: 'cover', backgroundPosition: 'center bottom', imageRendering: 'pixelated' }} />
                {Object.entries(F).map(([id, def]) => <Fighter key={id} def={def} anim={animOf(id)} beat={bi} />)}
                {/* heavy foreground rocks pressing in from the edges — IN FRONT of everything */}
                <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${ENV}/boss_fg_keyed.png)`,
                  backgroundSize: 'cover', backgroundPosition: 'center bottom', imageRendering: 'pixelated', pointerEvents: 'none' }} />
              </div>
            </div>
            {/* ominous danger GRADE — hot red glow from below + darkening (runtime, no resprite) */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', mixBlendMode: 'soft-light',
              background: 'radial-gradient(ellipse at 50% 88%, rgba(255,70,35,0.5), rgba(10,6,16,0.4) 70%)' }} />
          </div>

          {/* top HUD — boss name + boss HP */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '13%', background: 'linear-gradient(180deg,#0b0b14ee,transparent)',
            display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 12px', gap: 3, pointerEvents: 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontWeight: 800 }}>
              <span style={{ color: '#ff7a6a' }}>☠ THE CINDER MAW</span><span style={{ color: '#9aa0b0' }}>Outer Ring · Boss</span>
            </div>
            <div style={{ height: 4, borderRadius: 3, background: '#2a1416', overflow: 'hidden' }}>
              <div style={{ width: '78%', height: '100%', background: 'linear-gradient(90deg,#ff5a4a,#ff8a4a)' }} />
            </div>
          </div>
          {/* bottom control matte */}
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: `${MATTE_H}%`, background: '#0b0b14',
            borderTop: '1px solid #23232f', display: 'flex', alignItems: 'center', gap: 8, padding: '0 10px' }}>
            <div style={{ height: '70%', aspectRatio: '1', borderRadius: '50%', border: '2px solid #ff8a4a',
              backgroundImage: `url(${ROT}/rot_00.png)`, backgroundSize: 'cover', imageRendering: 'pixelated', flexShrink: 0 }} />
            <div style={{ flex: 1, textAlign: 'center', padding: '6px 0', borderRadius: 7, fontSize: 11, fontWeight: 800, color: '#ff8a4a', background: '#ff8a4a1e', border: '1.5px solid #ff8a4a66' }}>Charge</div>
            <div style={{ flex: 1, textAlign: 'center', padding: '6px 0', borderRadius: 7, fontSize: 11, fontWeight: 800, color: '#ffd166', background: '#ffd1661e', border: '1.5px solid #ffd16666' }}>Overload</div>
            <div style={{ flex: 1, textAlign: 'center', padding: '6px 0', borderRadius: 7, fontSize: 11, fontWeight: 800, color: '#ff7a9c', background: '#ff7a9c1e', border: '1.5px solid #ff7a9c66' }}>Backdraft</div>
          </div>
          <div style={{ position: 'absolute', left: 12, bottom: `${MATTE_H + 2}%`, fontSize: 10, fontWeight: 800, letterSpacing: 1,
            color: '#fff', textShadow: '0 1px 3px #000', opacity: 0.8 }}>● {b.name}</div>
        </div>

        <div style={{ marginTop: 12, fontSize: 12.5, lineHeight: 1.6, color: '#9aa0b0' }}>
          No new mechanics — just staging. Tighter walls, rocks crowding the edges, the boss owning most of
          the frame while your squad is small and low. The intent: a player glancing at this (UI off) should
          feel it's a boss, not a random fight. That's the boss-arena differentiation test.
        </div>
      </div>
    </div>
  );
}

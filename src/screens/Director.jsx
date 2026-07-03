// Director — STANDALONE proof of a STAGING system (not a camera system). <url>/#director.
// Pixel art is already abstraction, so we don't simulate a film camera: each shot is a COMPOSED FRAME
// (which creatures, what scale, what's behind them) and we HARD-CUT between still compositions. Scale
// change does the drama (a boss looms because we re-compose it huge+low next to a tiny hero). Discipline:
// MASTER-shot dominant (~70% of the time a stable, readable master shot); inserts reserved for key
// moments, then cut back. Layout law: the playable STAGE sits ABOVE the bottom UI MATTE — the flat
// ground stays VISIBLE and the squad stands ON it; the controls never cover the ground or the action.
import { useState, useEffect, useRef } from 'react';

const ROT = '/art/creatures/cinderpaw/character_v3';   // rot_01 = west (faces left), rot_02 = east (right)
const EVO = '/art/creatures/cinderpaw/evolved_charv3';
const ENV = '/art/env/outer-ring';
const MATTE_H = 22;  // % of viewport reserved at the bottom for controls (the stage lives above it)

// fighters stand near the BOTTOM of the stage window (y% of the window) — on the flat ground plane.
// Heroes LEFT, foes RIGHT — screen direction held across every cut.
const F = {
  H1: { sprite: `${ROT}/rot_02.png`, x: 25, y: 90, w: 15, face: 1 },
  H2: { sprite: `${ROT}/rot_02.png`, x: 16, y: 96, w: 14, face: 1 },
  H3: { sprite: `${ROT}/rot_02.png`, x: 35, y: 93, w: 19, face: 1 }, // carry
  E1: { sprite: `${ROT}/rot_01.png`, x: 71, y: 90, w: 15, face: -1 },
  E2: { sprite: `${ROT}/rot_01.png`, x: 80, y: 96, w: 14, face: -1 },
  B:  { sprite: `${EVO}/rot_01.png`, x: 84, y: 88, w: 30, face: -1 }, // boss
};

// MASTER-DOMINANT. master:true = the stable readable composition (where manual play happens).
// Inserts are reserved compositions we HARD-CUT to (fx,fy = focus in stage-window %; z = scale), then back.
const BEATS = [
  { name: 'MASTER', master: true, ms: 3000 },
  { name: 'HERO · insert', fx: 35, fy: 84, z: 2.0, actor: 'H3', ms: 800 },   // carry ~2x, foes off-frame
  { name: 'MASTER', master: true, ms: 1500 },
  { name: 'BOSS · looms',  fx: 84, fy: 70, z: 1.7, cy: 66, actor: 'B', ms: 1300 }, // boss ~45% h, headroom
  { name: 'MASTER', master: true, ms: 2200 },
  { name: 'IMPACT',        fx: 84, fy: 74, z: 2.1, target: 'B', shake: true, ms: 700 },
  { name: 'MASTER', master: true, ms: 1500 },
  { name: 'REACTION',      fx: 16, fy: 90, z: 2.4, target: 'H2', ms: 500 },   // struck ally, brief hold
  { name: 'MASTER', master: true, ms: 2400 },
];

function Fighter({ def, anim, beat }) {
  const a = def.face > 0 ? 'r' : 'l';
  const motion = anim === 'attack' ? `dir-lunge-${a} .5s ease-out`
    : anim === 'hurt' ? `dir-hurt-${a} .45s ease-in-out`
    : `dir-bob 1.6s ease-in-out infinite`;
  return (
    <div style={{ position: 'absolute', left: `${def.x}%`, top: `${def.y}%`, width: `${def.w}%`, transform: 'translate(-50%, -100%)' }}>
      {/* contact shadow — tight dark core + soft spread (grounds the feet) */}
      <div style={{ position: 'absolute', bottom: '-2%', left: '22%', width: '56%', paddingBottom: '9%',
        borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(0,0,0,0.6), rgba(0,0,0,0.22) 55%, transparent 76%)' }} />
      <div key={beat} style={{ animation: motion, position: 'relative' }}>
        <img src={def.sprite} alt="" style={{ width: '100%', display: 'block', imageRendering: 'pixelated',
          filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.55))' }} />
        {/* feet darkening — ties the creature into the dark ground (fixes the value disconnect) */}
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '32%', mixBlendMode: 'multiply',
          pointerEvents: 'none', background: 'linear-gradient(to top, rgba(18,10,26,0.55), transparent)' }} />
      </div>
    </div>
  );
}

function Skill({ label, color }) {
  return <div style={{ flex: 1, textAlign: 'center', padding: '6px 0', borderRadius: 7, fontSize: 11, fontWeight: 800,
    color, background: `${color}1e`, border: `1.5px solid ${color}66` }}>{label}</div>;
}

export default function Director() {
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
  const STAGE = `url(${ENV}/stage2.png)`, FALLBACK = `url(${ENV}/stage.png)`;
  const FGOCC = `url(${ENV}/fgocc_keyed.png)`;

  return (
    <div style={{ minHeight: '100vh', background: '#06060c', color: '#e8e8f0', fontFamily: 'system-ui, sans-serif', padding: '18px 16px 50px' }}>
      <style>{`
        @keyframes dir-bob { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-4%) } }
        @keyframes dir-lunge-r { 0%,100% { transform: translateX(0) } 45% { transform: translateX(26%) scale(1.05) } }
        @keyframes dir-lunge-l { 0%,100% { transform: translateX(0) } 45% { transform: translateX(-26%) scale(1.05) } }
        @keyframes dir-hurt-r { 0%,100% { transform: translateX(0); filter: none } 30% { transform: translateX(-15%) rotate(6deg); filter: brightness(2) sepia(1) hue-rotate(-30deg) saturate(4) } }
        @keyframes dir-hurt-l { 0%,100% { transform: translateX(0); filter: none } 30% { transform: translateX(15%) rotate(-6deg); filter: brightness(2) sepia(1) hue-rotate(-30deg) saturate(4) } }
        @keyframes dir-shake { 0%,100% { transform: translate(0,0) } 25% { transform: translate(-1.4%,0.8%) } 50% { transform: translate(1.4%,-0.8%) } 75% { transform: translate(-0.8%,-0.4%) } }
      `}</style>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: 1, color: '#ff8a4a' }}>DIRECTED COMBAT · staging system</div>
        <div style={{ fontSize: 13, color: '#9aa0b0', marginTop: 4 }}>
          Master-shot dominant; reserved inserts on key moments (hard cuts between still compositions — scale
          does the drama). The flat ground stays visible ABOVE the control matte; the squad stands on it. Now:&nbsp;
          <b style={{ color: b.master ? '#9be7ff' : '#ffd0a8' }}>{b.name}</b>
        </div>

        {/* viewport */}
        <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', marginTop: 14,
          borderRadius: 12, overflow: 'hidden', border: '1px solid #2a2a3a', background: '#1a1208' }}>
          {/* STAGE WINDOW — the playable area, ABOVE the matte (so the ground is never cropped) */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: `${MATTE_H}%`, overflow: 'hidden' }}>
            <div key={`sh${bi}`} style={{ position: 'absolute', inset: 0, animation: b.shake ? 'dir-shake .3s ease-in-out' : 'none' }}>
              {/* world — composition transform, HARD CUT */}
              <div style={{ position: 'absolute', inset: 0, transformOrigin: '0 0', transform: cam, transition: 'none' }}>
                <div style={{ position: 'absolute', inset: 0, backgroundImage: `${STAGE}, ${FALLBACK}`,
                  backgroundSize: 'cover', backgroundPosition: 'center bottom', imageRendering: 'pixelated' }} />
                {Object.entries(F).map(([id, def]) => <Fighter key={id} def={def} anim={animOf(id)} beat={bi} />)}
                {/* foreground occluders — IN FRONT of characters (grass over feet) → depth + framing */}
                <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '26%', backgroundImage: FGOCC,
                  backgroundRepeat: 'repeat-x', backgroundSize: 'auto 100%', backgroundPosition: 'bottom', imageRendering: 'pixelated', pointerEvents: 'none' }} />
              </div>
            </div>
            {/* environment lighting GRADE — unifies creatures + backdrop at runtime (no resprite per ring) */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', mixBlendMode: 'soft-light',
              background: 'radial-gradient(ellipse at 50% 26%, rgba(255,150,70,0.55), rgba(28,16,38,0.25) 72%)' }} />
          </div>

          {/* top HUD strip */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '11%', background: 'linear-gradient(180deg,#0b0b14ee,transparent)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 10px', pointerEvents: 'none' }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: '#cfd4e0' }}>⬡ OUTER RING · Wave 3</span>
            <span style={{ fontSize: 10, fontWeight: 800, color: '#ff8a4a' }}>♥ squad</span>
          </div>
          {/* bottom control MATTE (anchored — never moves with the composition) */}
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: `${MATTE_H}%`, background: '#0b0b14',
            borderTop: '1px solid #23232f', display: 'flex', alignItems: 'center', gap: 8, padding: '0 10px' }}>
            <div style={{ height: '70%', aspectRatio: '1', borderRadius: '50%', border: '2px solid #ff8a4a',
              backgroundImage: `url(${ROT}/rot_00.png)`, backgroundSize: 'cover', imageRendering: 'pixelated', flexShrink: 0 }} />
            <Skill label="Charge" color="#ff8a4a" />
            <Skill label="Overload" color="#ffd166" />
            <Skill label="Backdraft" color="#ff7a9c" />
          </div>
          {/* shot tag — just above the matte */}
          <div style={{ position: 'absolute', left: 12, bottom: `${MATTE_H + 2}%`, fontSize: 10, fontWeight: 800, letterSpacing: 1,
            color: '#fff', textShadow: '0 1px 3px #000', opacity: 0.8 }}>● {b.name}</div>
        </div>

        <div style={{ marginTop: 12, fontSize: 12.5, lineHeight: 1.6, color: '#9aa0b0' }}>
          The squad now stands ON the flat ground (which sits above the control matte, never cropped). It
          mostly HOLDS a readable master shot — controls and action both clear — and only cuts to an insert
          on a real moment (the carry striking, the boss looming via re-composition, a heavy hit), then back.
        </div>
      </div>
    </div>
  );
}

import { useState, useRef, useCallback } from 'react';
import {
  createBattleState,
  runBattle,
  createHumanDriver,
  createAIDriver,
  getSkill,
} from '../engine/combat/index.js';
import { makeUnitDef } from '../engine/combat/roster.js';
import { randomSeed } from '../engine/rng.js';

// ⚗ LAB — the manual-combat pivot harness (§23/§24/§26), running in PARALLEL to the
// legacy auto-resolve flow. Two modes share ONE engine; only the side drivers differ:
//   • Manual : you drive squad A (HumanDriver), AI drives squad B
//   • Watch  : AI drives both sides at a fixed seed (the deterministic golden fight)

const KIND_COLOR = { builder: '#3a6a4a', payoff: '#e86040', wildcard: '#6a4a9a' };

function snap(state) {
  const side = (s) =>
    state.units[s].map((u) => ({
      uid: u.uid,
      name: u.name,
      hp: u.hp,
      maxHp: u.maxHp,
      charge: u.charge,
      maxCharge: u.maxCharge,
      burn: u.statuses.burn || 0,
      alive: u.alive,
      temperament: u.temperament,
    }));
  return { A: side('A'), B: side('B') };
}

function UnitCard({ u, you, highlight }) {
  const pct = u.maxHp > 0 ? Math.round((u.hp / u.maxHp) * 100) : 0;
  const hpColor = pct > 60 ? '#7ed321' : pct > 30 ? '#f5a623' : '#d0021b';
  return (
    <div
      style={{
        opacity: u.alive ? 1 : 0.35,
        border: `1px solid ${highlight ? '#e86040' : '#2a2a3a'}`,
        borderRadius: 8,
        padding: '8px 10px',
        background: '#15151d',
        marginBottom: 6,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontWeight: 800, fontSize: 13, color: you ? '#7ec8ff' : '#ff9a7a' }}>
          {u.name} {!u.alive && '☠'}
        </span>
        <span style={{ fontSize: 10, color: '#666', fontFamily: 'monospace' }}>
          {u.hp}/{u.maxHp}
        </span>
      </div>
      <div style={{ height: 6, background: '#222', borderRadius: 3, margin: '4px 0', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: hpColor }} />
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 10, color: '#888' }}>
        <span style={{ color: '#f5a623' }}>
          ⚡ {'▰'.repeat(u.charge)}{'▱'.repeat(Math.max(0, u.maxCharge - u.charge))} {u.charge}/{u.maxCharge}
        </span>
        {u.burn > 0 && <span style={{ color: '#e8603a' }}>🔥{u.burn}</span>}
        {!you && u.temperament && <span style={{ color: '#555' }}>· {u.temperament}</span>}
      </div>
    </div>
  );
}

export default function LabScreen({ onBack }) {
  const [feed, setFeed] = useState([]);
  const [view, setView] = useState(null); // current snapshot
  const [pending, setPending] = useState(null); // { actor, legal } — awaiting skill pick
  const [pendingActor, setPendingActor] = useState(null); // { pool } — awaiting which creature
  const [skillForTarget, setSkillForTarget] = useState(null); // skill awaiting a target pick
  const [result, setResult] = useState(null);
  const [mode, setMode] = useState(null);
  const stateRef = useRef(null);
  const resolveDecisionRef = useRef(null);
  const resolveActorRef = useRef(null);

  const onEvent = useCallback(() => {
    setFeed([...stateRef.current.log]);
    setView(snap(stateRef.current));
  }, []);

  function startWatch() {
    const squadA = [makeUnitDef('fizzwick', 'Balanced'), makeUnitDef('emberkit', 'Balanced')];
    const squadB = [makeUnitDef('sparkjaw', 'Greedy'), makeUnitDef('emberkit', 'Greedy')];
    const state = createBattleState(squadA, squadB, 1337);
    stateRef.current = state;
    reset('watch', state);
    runBattle(state, { A: createAIDriver(), B: createAIDriver() }, onEvent).then(setResult);
  }

  function startManual() {
    const squadA = [makeUnitDef('fizzwick'), makeUnitDef('emberkit')];
    const squadB = [makeUnitDef('sparkjaw', 'Balanced'), makeUnitDef('emberkit', 'Balanced')];
    const state = createBattleState(squadA, squadB, randomSeed());
    stateRef.current = state;
    reset('manual', state);
    const human = createHumanDriver({
      requestActor: (pool) =>
        new Promise((res) => {
          resolveActorRef.current = res;
          setPendingActor({ pool: pool.map((u) => ({ uid: u.uid, name: u.name })) });
        }),
      requestDecision: (actor, legal) =>
        new Promise((res) => {
          resolveDecisionRef.current = res;
          setPending({
            actorUid: actor.uid,
            actorName: actor.name,
            skillIds: actor.skillIds.slice(),
            legal: legal.map((s) => s.id),
          });
        }),
    });
    runBattle(state, { A: human, B: createAIDriver() }, onEvent).then((r) => {
      setResult(r);
      setPending(null);
      setPendingActor(null);
    });
  }

  function reset(m, state) {
    setMode(m);
    setResult(null);
    setPending(null);
    setPendingActor(null);
    setSkillForTarget(null);
    setFeed([]);
    setView(snap(state));
  }

  // ── Human input handlers ──
  function chooseActor(uid) {
    const actor = stateRef.current.units.A.find((u) => u.uid === uid);
    setPendingActor(null);
    resolveActorRef.current?.(actor);
  }

  function chooseSkill(skillId) {
    const skill = getSkill(skillId);
    if (skill.targetMode === 'enemy') {
      setSkillForTarget(skillId); // need an enemy target pick
    } else {
      // allEnemies / self resolve their own targets in apply()
      commit(skillId, []);
    }
  }

  function chooseTarget(uid) {
    commit(skillForTarget, [uid]);
  }

  function commit(skillId, targetIds) {
    setPending(null);
    setSkillForTarget(null);
    resolveDecisionRef.current?.({ skillId, targetIds });
  }

  const isManual = mode === 'manual';
  const liveEnemies = view ? view.B.filter((u) => u.alive) : [];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <button onClick={onBack} style={btn('#444', 'transparent')}>← Back</button>
        <span style={{ fontSize: 11, letterSpacing: 2, color: '#b08a3a', fontWeight: 900 }}>⚗ COMBAT LAB · REACTOR</span>
      </div>

      {!mode && (
        <div style={{ color: '#888', fontSize: 13, lineHeight: 1.6 }}>
          <p>Manual turn-by-turn combat (the §23 pivot). One engine, swappable drivers.</p>
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button onClick={startManual} style={btn('#fff', '#e86040')}>▶ Play manually</button>
            <button onClick={startWatch} style={btn('#7ec8ff', 'transparent', '#2a4a6a')}>👁 Watch AI vs AI</button>
          </div>
        </div>
      )}

      {mode && view && (
        <div>
          {/* Squads */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <div style={lbl('#7ec8ff')}>{isManual ? 'YOUR SQUAD' : 'SQUAD A · Balanced'}</div>
              {view.A.map((u) => (
                <UnitCard key={u.uid} u={u} you highlight={pending?.actorUid === u.uid} />
              ))}
            </div>
            <div>
              <div style={lbl('#ff9a7a')}>{isManual ? 'ENEMY · Balanced' : 'SQUAD B · Greedy'}</div>
              {view.B.map((u) => (
                <UnitCard key={u.uid} u={u} highlight={skillForTarget && u.alive} />
              ))}
            </div>
          </div>

          {/* Choose which creature acts */}
          {pendingActor && (
            <Panel label="Which creature acts next?">
              {pendingActor.pool.map((u) => (
                <button key={u.uid} onClick={() => chooseActor(u.uid)} style={btn('#fff', '#2a4a6a')}>{u.name}</button>
              ))}
            </Panel>
          )}

          {/* Choose a skill */}
          {pending && !skillForTarget && (
            <Panel label={`${pending.actorName} — pick a skill`}>
              {pending.skillIds.map((sid) => {
                const skill = getSkill(sid);
                const legal = pending.legal.includes(sid);
                return (
                  <button
                    key={sid}
                    onClick={() => legal && chooseSkill(sid)}
                    disabled={!legal}
                    title={skill.blurb}
                    style={btn(legal ? '#fff' : '#444', legal ? KIND_COLOR[skill.kind] : '#181820')}
                  >
                    {skill.name}
                    <span style={{ fontSize: 9, opacity: 0.7, marginLeft: 5 }}>{skill.kind}</span>
                  </button>
                );
              })}
            </Panel>
          )}

          {/* Choose a target */}
          {skillForTarget && (
            <Panel label={`${getSkill(skillForTarget).name} — pick a target`}>
              {liveEnemies.map((u) => (
                <button key={u.uid} onClick={() => chooseTarget(u.uid)} style={btn('#fff', '#6a3a2a')}>{u.name}</button>
              ))}
              <button onClick={() => setSkillForTarget(null)} style={btn('#888', 'transparent')}>cancel</button>
            </Panel>
          )}

          {/* Result */}
          {result && (
            <div style={{ textAlign: 'center', padding: 14, marginTop: 4 }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: result.winner === 'A' ? '#7ed321' : '#d0021b' }}>
                {isManual ? (result.winner === 'A' ? 'VICTORY' : 'DEFEAT') : `SQUAD ${result.winner} WINS`}
              </div>
              <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>
                {result.rounds} rounds{result.cappedOut ? ' · capped (most HP wins)' : ''}
              </div>
              <button onClick={() => setMode(null)} style={{ ...btn('#fff', '#e86040'), marginTop: 12 }}>⚗ Again</button>
            </div>
          )}

          {/* Battle feed */}
          <div style={{ marginTop: 14 }}>
            <div style={lbl('#555')}>BATTLE LOG</div>
            <div style={{ maxHeight: 240, overflowY: 'auto', fontSize: 11, fontFamily: 'monospace', lineHeight: 1.7 }}>
              {feed.map((e, i) => <FeedLine key={i} e={e} />)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FeedLine({ e }) {
  if (e.type === 'round-start')
    return <div style={{ color: '#555', marginTop: 6, borderTop: '1px solid #1f1f29', paddingTop: 4 }}>— round {e.round} · {e.firstSide} acts first —</div>;
  if (e.type === 'battle-end')
    return <div style={{ color: '#b08a3a', marginTop: 4 }}>★ {e.winner} wins in {e.rounds} rounds</div>;
  if (e.type === 'burn') {
    const c = e.killed ? '#d0021b' : '#e8603a';
    return <div style={{ color: c }}>🔥 {e.target.name} takes {e.dmg} burn{e.killed ? ' — falls!' : ''}</div>;
  }
  if (e.type === 'turn') {
    const dmg = e.hits.reduce((s, h) => s + h.dmg, 0);
    const kills = e.hits.filter((h) => h.killed).map((h) => h.name);
    const sideColor = e.actor.side === 'A' ? '#7ec8ff' : '#ff9a7a';
    return (
      <div style={{ color: '#aaa' }}>
        <span style={{ color: sideColor }}>{e.actor.name}</span> · {e.skill.name}
        {e.hits.length > 0 && <span> → {dmg} dmg{e.amplifiedByBurn ? ' 🔥×2' : ''}{e.hits.length > 1 ? ` (×${e.hits.length})` : ''}</span>}
        {kills.length > 0 && <span style={{ color: '#d0021b' }}> — {kills.join(', ')} falls!</span>}
      </div>
    );
  }
  return null;
}

function Panel({ label, children }) {
  return (
    <div style={{ background: '#15151d', border: '1px solid #2a2a3a', borderRadius: 8, padding: 12, marginBottom: 12 }}>
      <div style={lbl('#888')}>{label}</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>{children}</div>
    </div>
  );
}

const btn = (color, bg, border) => ({
  padding: '9px 14px',
  background: bg,
  border: `1px solid ${border || bg === 'transparent' ? border || '#333' : bg}`,
  borderRadius: 7,
  color,
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: 0.5,
  cursor: 'pointer',
});

const lbl = (color) => ({ fontSize: 10, letterSpacing: 2, color, fontWeight: 900, marginBottom: 6 });

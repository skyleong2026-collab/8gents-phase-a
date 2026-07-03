// Bestiary — a STANDALONE roster screen (not part of a run). Reach it at <url>/#bestiary.
//
// Purpose: lay out every creature's JOB at a glance — the recurring "I lose each unit's
// purpose" need. Each card leads with the Type's role + the unit's stat-identity, then its
// 3-skill kit. Reads the canonical engine data READ-ONLY (roster.js + skills/index.js); the
// Type visuals are re-declared here so this file depends on nothing the game owns.
import { useState, useMemo } from 'react';
import { COMBAT_ROSTER } from '../engine/combat/roster.js';
import { SKILLS } from '../engine/combat/skills/index.js';

// Type identity — mirrors SeamLab's TYPE_INFO, kept local so the Bestiary is self-contained.
const TYPE_INFO = {
  Reactor:  { glyph: '🔥', accent: '#ff8a4a', nick: 'The Hothead', role: 'Powers up, then blows up.' },
  Bulwark:  { glyph: '🛡', accent: '#7fd6ff', nick: 'The Wall',     role: 'Soaks hits and guards the team.' },
  Mender:   { glyph: '🌿', accent: '#3ec9a0', nick: 'The Healer',   role: 'Keeps the squad alive.' },
  Booster:  { glyph: '✦', accent: '#b06bff', nick: 'The Hype',     role: 'Makes an ally hit way harder.' },
  Striker:  { glyph: '⚔', accent: '#ffd166', nick: 'The Brawler',  role: 'Fast — lots of quick hits.' },
  Assassin: { glyph: '🗡', accent: '#ff7a9c', nick: 'The Killer',   role: 'Hunts and finishes the weak.' },
  Warden:   { glyph: '❄', accent: '#8fd8ff', nick: 'The Jailer',   role: 'Freezes enemies out of their turns.' },
  Hexer:    { glyph: '💀', accent: '#b06bff', nick: 'The Curse',    role: 'Makes enemies take more from the whole squad.' },
};
const TYPE_ORDER = ['Reactor', 'Bulwark', 'Mender', 'Booster', 'Striker', 'Assassin', 'Warden', 'Hexer'];

// roster-wide maxes for normalising the stat bars
const MAX = { hp: 320, atk: 40, speed: 10 };

// Within a Type, give each unit a one-word stat-identity so siblings read differently.
function statIdentity(c, peers) {
  const topAtk = Math.max(...peers.map((p) => p.atk));
  const topHp = Math.max(...peers.map((p) => p.hp));
  const topSpd = Math.max(...peers.map((p) => p.speed));
  if (peers.length < 2) return 'All-Rounder';
  if (c.atk === topAtk && c.hp !== topHp) return 'Glass Cannon';
  if (c.hp === topHp && c.atk !== topAtk) return 'Bruiser';
  if (c.speed === topSpd) return 'Quickest';
  return 'Balanced';
}

function StatBar({ label, value, max, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ width: 28, fontSize: 10, fontWeight: 800, color: '#8b90a0', letterSpacing: 0.5 }}>{label}</div>
      <div style={{ flex: 1, height: 7, borderRadius: 4, background: '#1a1a26', overflow: 'hidden', border: '1px solid #23232f' }}>
        <div style={{ width: `${Math.min(100, (value / max) * 100)}%`, height: '100%', background: color, borderRadius: 4 }} />
      </div>
      <div style={{ width: 26, textAlign: 'right', fontSize: 10, fontWeight: 700, color: '#c8cdda' }}>{value}</div>
    </div>
  );
}

function CreatureCard({ c, accent, glyph, identity, expanded, onToggle }) {
  const kit = c.skillIds.map((id) => SKILLS[id]).filter(Boolean);
  return (
    <div onClick={onToggle}
      style={{ cursor: 'pointer', background: '#10101a', border: `1px solid ${expanded ? accent : '#23232f'}`,
        borderRadius: 14, padding: 12, transition: 'border-color .15s', boxShadow: expanded ? `0 0 16px ${accent}33` : 'none' }}>
      <div style={{ display: 'flex', gap: 12 }}>
        {/* sprite */}
        <div style={{ width: 72, height: 72, flexShrink: 0, borderRadius: '50%', overflow: 'hidden', position: 'relative',
          border: `2.5px solid ${accent}`, background: `radial-gradient(circle at 50% 38%, ${accent}33 0%, #0b0b14 72%)`, boxShadow: `0 0 12px ${accent}55` }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(/sprites/${c.spriteId}.jpg)`, backgroundSize: 'auto 122%', backgroundPosition: '50% 38%', backgroundRepeat: 'no-repeat' }} />
        </div>
        {/* identity */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 16, fontWeight: 900, color: '#f0f0f6' }}>{c.name}</span>
            <span style={{ fontSize: 11, fontWeight: 800, color: accent, background: `${accent}1a`, border: `1px solid ${accent}55`, borderRadius: 6, padding: '1px 6px' }}>{glyph} {c.type}</span>
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: accent, marginTop: 2 }}>{identity}</div>
          <div style={{ fontSize: 11.5, color: '#9aa0b0', marginTop: 3, lineHeight: 1.4 }}>{TYPE_INFO[c.type].role}</div>
        </div>
      </div>
      {/* stats */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 10 }}>
        <StatBar label="HP" value={c.hp} max={MAX.hp} color="#3ec9a0" />
        <StatBar label="ATK" value={c.atk} max={MAX.atk} color="#e07a7a" />
        <StatBar label="SPD" value={c.speed} max={MAX.speed} color="#7fb0ff" />
      </div>
      {/* kit */}
      <div style={{ marginTop: 10, borderTop: '1px solid #1c1c28', paddingTop: 8 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: '#6b7080', letterSpacing: 1, marginBottom: 5 }}>KIT {expanded ? '' : '· tap to expand'}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: expanded ? 7 : 4 }}>
          {kit.map((s) => (
            <div key={s.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: '#e8e8f0' }}>{s.name}</span>
                <span style={{ fontSize: 9, fontWeight: 800, color: '#8b90a0', textTransform: 'uppercase', letterSpacing: 0.5, border: '1px solid #2a2a3a', borderRadius: 4, padding: '0 4px' }}>{s.kind}</span>
              </div>
              {expanded && <div style={{ fontSize: 11, color: '#9aa0b0', lineHeight: 1.45, marginTop: 1 }}>{s.blurb}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Bestiary() {
  const [filter, setFilter] = useState('All');
  const [expandedId, setExpandedId] = useState(null);

  // group roster by Type, in canonical order
  const byType = useMemo(() => {
    const groups = {};
    for (const c of COMBAT_ROSTER) (groups[c.type] ||= []).push(c);
    return groups;
  }, []);

  const shownTypes = filter === 'All' ? TYPE_ORDER : [filter];

  return (
    <div style={{ minHeight: '100vh', background: '#06060c', color: '#e8e8f0', fontFamily: 'system-ui, sans-serif', padding: '20px 16px 60px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: 1, color: '#ff8a4a' }}>BESTIARY</div>
        <div style={{ fontSize: 13, color: '#9aa0b0', marginTop: 4 }}>
          {COMBAT_ROSTER.length} grunlings · {TYPE_ORDER.length} Types. Each card leads with its <b style={{ color: '#cfd4e0' }}>job</b>, not its name.
        </div>

        {/* type filter */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '16px 0 18px' }}>
          {['All', ...TYPE_ORDER].map((t) => {
            const on = filter === t;
            const accent = t === 'All' ? '#ff8a4a' : TYPE_INFO[t].accent;
            return (
              <button key={t} onClick={() => setFilter(t)}
                style={{ cursor: 'pointer', borderRadius: 8, padding: '5px 11px', fontSize: 12, fontWeight: 800,
                  background: on ? `${accent}1f` : '#0e0e16', border: `1.5px solid ${on ? accent : '#23232f'}`, color: on ? accent : '#889' }}>
                {t === 'All' ? 'All' : `${TYPE_INFO[t].glyph} ${t}`}
              </button>
            );
          })}
        </div>

        {/* groups */}
        {shownTypes.map((type) => {
          const peers = byType[type] || [];
          const { accent, glyph, nick, role } = TYPE_INFO[type];
          return (
            <div key={type} style={{ marginBottom: 26 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 17, fontWeight: 900, color: accent }}>{glyph} {type}</span>
                <span style={{ fontSize: 12, color: '#8b90a0' }}>{nick} — {role}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
                {peers.map((c) => (
                  <CreatureCard key={c.id} c={c} accent={accent} glyph={glyph}
                    identity={statIdentity(c, peers)}
                    expanded={expandedId === c.id}
                    onToggle={() => setExpandedId(expandedId === c.id ? null : c.id)} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { REACTOR_SKILLS } from './reactor.js';

// ─── Skill registry ─────────────────────────────────────────────────────────────
// Flat lookup of every skill across all Types. Only Reactor is wired today (§26.5:
// "get ONE Type fully playable before wiring the other five"). The other five Types
// drop their kits in here behind the same shape: { id, name, kind, canUse, apply }.
export const SKILLS = {
  ...REACTOR_SKILLS,
};

export function getSkill(skillId) {
  const s = SKILLS[skillId];
  if (!s) throw new Error(`Unknown skill: ${skillId}`);
  return s;
}

// Skills an actor may legally use this instant (charge / cooldown gate, §26.1).
export function legalSkills(actor, state) {
  return actor.skillIds.map(getSkill).filter((s) => s.canUse(actor, state));
}

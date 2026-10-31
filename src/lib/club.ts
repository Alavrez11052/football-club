import { db } from "./db";

/** The singleton club row. Identity fields stay blank until setup runs. */
export async function getClub() {
  return db.club.upsert({ where: { id: "club" }, update: {}, create: { id: "club" } });
}

export const SETUP_STEPS = [
  { key: "name", label: "Club name & abbreviation" },
  { key: "crest", label: "Club crest" },
  { key: "colors", label: "Club colors" },
  { key: "founding", label: "Founding date & location" },
  { key: "description", label: "Description & mission" },
  { key: "contact", label: "Contact email" },
  { key: "socials", label: "Social media accounts" },
] as const;

export function setupProgress(club: { setupStepsDone: string }) {
  let done: string[] = [];
  try { done = JSON.parse(club.setupStepsDone); } catch { done = []; }
  return { done, total: SETUP_STEPS.length, percent: Math.round((done.length / SETUP_STEPS.length) * 100) };
}

export function clubDisplayName(name: string) {
  return name.trim() ? name : "Our Football Club";
}

export function ageFromDob(dob: Date | null | undefined): number | null {
  if (!dob) return null;
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
  return age;
}

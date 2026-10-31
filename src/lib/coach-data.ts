import { db } from "./db";

/** Teams visible to a user: all for owner/admin, assigned only for coaches. */
export async function visibleTeams(userId: string, role: string) {
  if (role === "OWNER" || role === "ADMIN") return db.team.findMany({ orderBy: { name: "asc" } });
  const rows = await db.teamCoach.findMany({ where: { userId }, include: { team: true } });
  return rows.map((r) => r.team).sort((a, b) => a.name.localeCompare(b.name));
}

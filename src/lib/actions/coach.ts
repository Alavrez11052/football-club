"use server";

import { revalidatePath } from "next/cache";
import { db } from "../db";
import { audit } from "../audit";
import { requireUser } from "../auth";

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

/** Teams this coach is assigned to. Owners/admins see all teams. */
export async function coachTeamIds(userId: string, role: string): Promise<string[] | null> {
  if (role === "OWNER" || role === "ADMIN") return null; // null = all teams
  const rows = await db.teamCoach.findMany({ where: { userId }, select: { teamId: true } });
  return rows.map((r) => r.teamId);
}

async function assertTeamAccess(teamId: string) {
  const me = await requireUser();
  const ids = await coachTeamIds(me.id, me.role);
  if (ids !== null && !ids.includes(teamId)) throw new Error("FORBIDDEN");
  return me;
}

export async function createTrainingSession(formData: FormData) {
  const teamId = str(formData, "teamId");
  const me = await assertTeamAccess(teamId);
  await db.trainingSession.create({
    data: {
      teamId,
      title: str(formData, "title") || "Training",
      date: new Date(str(formData, "date")),
      location: str(formData, "location"),
      notes: str(formData, "notes"),
    },
  });
  await audit(me.id, "TRAINING_CREATED", teamId);
  revalidatePath("/coach/training");
}

export async function deleteTrainingSession(formData: FormData) {
  const id = str(formData, "id");
  const session = await db.trainingSession.findUnique({ where: { id } });
  if (!session) return;
  const me = await assertTeamAccess(session.teamId);
  await db.trainingSession.delete({ where: { id } });
  await audit(me.id, "TRAINING_DELETED", id);
  revalidatePath("/coach/training");
}

export async function saveAttendance(formData: FormData) {
  const sessionId = str(formData, "sessionId");
  const session = await db.trainingSession.findUnique({ where: { id: sessionId } });
  if (!session) return;
  const me = await assertTeamAccess(session.teamId);
  const presentIds = new Set(formData.getAll("present").map(String));
  const players = await db.player.findMany({ where: { teamId: session.teamId }, select: { id: true } });
  for (const p of players) {
    await db.attendance.upsert({
      where: { sessionId_playerId: { sessionId, playerId: p.id } },
      update: { present: presentIds.has(p.id) },
      create: { sessionId, playerId: p.id, present: presentIds.has(p.id) },
    });
  }
  await audit(me.id, "ATTENDANCE_RECORDED", sessionId);
  revalidatePath("/coach/training");
}

export async function addCoachNote(formData: FormData) {
  const playerId = str(formData, "playerId");
  const player = await db.player.findUnique({ where: { id: playerId } });
  if (!player?.teamId) return;
  const me = await assertTeamAccess(player.teamId);
  await db.coachNote.create({ data: { playerId, authorId: me.id, note: str(formData, "note") } });
  await audit(me.id, "COACH_NOTE_ADDED", player.fullName);
  revalidatePath("/coach/players");
}

export async function addEvaluation(formData: FormData) {
  const playerId = str(formData, "playerId");
  const player = await db.player.findUnique({ where: { id: playerId } });
  if (!player?.teamId) return;
  const me = await assertTeamAccess(player.teamId);
  const rating = Math.min(10, Math.max(1, parseInt(str(formData, "rating") || "5", 10)));
  await db.evaluation.create({ data: { playerId, authorId: me.id, rating, comments: str(formData, "comments") } });
  await audit(me.id, "EVALUATION_ADDED", player.fullName);
  revalidatePath("/coach/players");
}

/** Matchday: save formation + lineup, and submit result + report. */
export async function saveMatchday(formData: FormData) {
  const fixtureId = str(formData, "fixtureId");
  const fixture = await db.fixture.findUnique({ where: { id: fixtureId } });
  if (!fixture?.teamId) return;
  const me = await assertTeamAccess(fixture.teamId);
  const lineup = formData.getAll("lineup").map(String);
  const status = str(formData, "status") || fixture.status;
  await db.fixture.update({
    where: { id: fixtureId },
    data: {
      formation: str(formData, "formation"),
      lineup: JSON.stringify(lineup),
      report: str(formData, "report"),
      status: status as never,
      homeScore: status === "COMPLETED" && str(formData, "homeScore") !== "" ? parseInt(str(formData, "homeScore"), 10) : fixture.homeScore,
      awayScore: status === "COMPLETED" && str(formData, "awayScore") !== "" ? parseInt(str(formData, "awayScore"), 10) : fixture.awayScore,
    },
  });
  await audit(me.id, "MATCHDAY_SAVED", fixture.opponent);
  revalidatePath("/coach/matches");
  revalidatePath("/fixtures");
}

"use server";

import { revalidatePath } from "next/cache";
import { db } from "../db";
import { audit } from "../audit";
import { requireRole } from "../auth";
import { saveUpload } from "../upload";

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const optDate = (v: string) => (v ? new Date(v) : null);

/* ---------------------------------- Players --------------------------------- */

export async function savePlayer(formData: FormData) {
  const me = await requireRole("OWNER", "ADMIN");
  const id = str(formData, "id");
  const photo = formData.get("photo") as File | null;
  const squadRaw = str(formData, "squadNumber");
  const data: Record<string, unknown> = {
    fullName: str(formData, "fullName"),
    dateOfBirth: optDate(str(formData, "dateOfBirth")),
    position: str(formData, "position"),
    squadNumber: squadRaw ? parseInt(squadRaw, 10) : null,
    biography: str(formData, "biography"),
    teamId: str(formData, "teamId") || null,
  };
  if (photo && photo.size > 0) data.photoUrl = await saveUpload(photo);
  try {
    if (id) {
      await db.player.update({ where: { id }, data });
      await audit(me.id, "PLAYER_UPDATED", data.fullName as string);
    } else {
      const p = await db.player.create({ data: data as never });
      await audit(me.id, "PLAYER_ADDED", p.fullName);
    }
  } catch {
    throw new Error("Could not save player — that squad number may already be taken in this team.");
  }
  revalidatePath("/portal/players");
  revalidatePath("/squad");
}

export async function deletePlayer(formData: FormData) {
  const me = await requireRole("OWNER", "ADMIN");
  const id = str(formData, "id");
  const p = await db.player.delete({ where: { id } });
  await audit(me.id, "PLAYER_REMOVED", p.fullName);
  revalidatePath("/portal/players");
  revalidatePath("/squad");
}

export async function linkPlayerAccount(formData: FormData) {
  const me = await requireRole("OWNER", "ADMIN");
  const playerId = str(formData, "playerId");
  const userId = str(formData, "userId") || null;
  await db.player.update({ where: { id: playerId }, data: { userId } });
  await audit(me.id, "PLAYER_ACCOUNT_LINKED", playerId);
  revalidatePath("/portal/players");
}

/* ----------------------------------- Staff ---------------------------------- */

export async function saveStaff(formData: FormData) {
  const me = await requireRole("OWNER", "ADMIN");
  const id = str(formData, "id");
  const photo = formData.get("photo") as File | null;
  const data: Record<string, unknown> = {
    name: str(formData, "name"),
    title: str(formData, "title"),
    biography: str(formData, "biography"),
    userId: str(formData, "userId") || null,
  };
  if (photo && photo.size > 0) data.photoUrl = await saveUpload(photo);
  if (id) {
    await db.staffMember.update({ where: { id }, data });
    await audit(me.id, "STAFF_UPDATED", data.name as string);
  } else {
    const s = await db.staffMember.create({ data: data as never });
    await audit(me.id, "STAFF_APPOINTED", s.name);
  }
  revalidatePath("/portal/staff");
  revalidatePath("/staff");
}

export async function deleteStaff(formData: FormData) {
  const me = await requireRole("OWNER", "ADMIN");
  const id = str(formData, "id");
  const s = await db.staffMember.delete({ where: { id } });
  await audit(me.id, "STAFF_REMOVED", s.name);
  revalidatePath("/portal/staff");
  revalidatePath("/staff");
}

/* ----------------------------------- Teams ---------------------------------- */

export async function saveTeam(formData: FormData) {
  const me = await requireRole("OWNER", "ADMIN");
  const id = str(formData, "id");
  const data = { name: str(formData, "name"), ageGroup: str(formData, "ageGroup") };
  if (id) await db.team.update({ where: { id }, data });
  else await db.team.create({ data });
  await audit(me.id, "TEAM_SAVED", data.name);
  revalidatePath("/portal/teams");
}

export async function deleteTeam(formData: FormData) {
  const me = await requireRole("OWNER", "ADMIN");
  const id = str(formData, "id");
  await db.team.delete({ where: { id } });
  await audit(me.id, "TEAM_DELETED", id);
  revalidatePath("/portal/teams");
}

export async function setTeamCoach(formData: FormData) {
  const me = await requireRole("OWNER", "ADMIN");
  const teamId = str(formData, "teamId");
  const userId = str(formData, "userId");
  const assign = formData.get("assign") === "true";
  if (assign) await db.teamCoach.upsert({ where: { userId_teamId: { userId, teamId } }, update: {}, create: { userId, teamId } });
  else await db.teamCoach.deleteMany({ where: { userId, teamId } });
  await audit(me.id, assign ? "COACH_ASSIGNED" : "COACH_UNASSIGNED", `${userId} / ${teamId}`);
  revalidatePath("/portal/teams");
}

/* -------------------------------- Applications ------------------------------- */

export async function reviewApplication(formData: FormData) {
  const me = await requireRole("OWNER", "ADMIN");
  const id = str(formData, "id");
  const decision = str(formData, "decision"); // approve | reject | info
  const note = str(formData, "reviewNote");
  const app = await db.application.findUnique({ where: { id } });
  if (!app) return;

  if (decision === "reject") {
    await db.application.update({ where: { id }, data: { status: "REJECTED", reviewNote: note } });
    await audit(me.id, "APPLICATION_REJECTED", `${app.type}: ${app.fullName}`);
  } else if (decision === "info") {
    await db.application.update({ where: { id }, data: { status: "INFO_REQUESTED", reviewNote: note } });
    await audit(me.id, "APPLICATION_INFO_REQUESTED", `${app.type}: ${app.fullName}`);
  } else if (decision === "approve") {
    // Approval converts the applicant into a real record — never automatic before this point.
    if (app.type === "PLAYER") {
      await db.player.create({
        data: {
          fullName: app.fullName,
          dateOfBirth: app.dateOfBirth,
          position: app.preferredPosition,
          biography: app.additionalInfo,
        },
      });
      await audit(me.id, "APPLICATION_APPROVED_PLAYER", app.fullName);
    } else {
      await db.staffMember.create({
        data: { name: app.fullName, title: app.desiredRole || "Coach", biography: app.qualifications || app.experience },
      });
      await audit(me.id, "APPLICATION_APPROVED_COACH", app.fullName);
    }
    await db.application.update({ where: { id }, data: { status: "APPROVED", reviewNote: note } });
  }
  revalidatePath("/portal/applications");
  revalidatePath("/portal");
}

export async function setInquiryHandled(formData: FormData) {
  const me = await requireRole("OWNER", "ADMIN");
  const id = str(formData, "id");
  await db.inquiry.update({ where: { id }, data: { handled: formData.get("handled") === "true" } });
  await audit(me.id, "INQUIRY_HANDLED", id);
  revalidatePath("/portal/inquiries");
}

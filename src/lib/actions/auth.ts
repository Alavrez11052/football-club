"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "../db";
import { audit } from "../audit";
import { createSession, destroySession, hashPassword, requireRole, verifyPassword } from "../auth";
import type { FormState } from "./public";

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const user = await db.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "Invalid email or password." };
  }
  await createSession(user);
  await audit(user.id, "LOGIN", user.email);
  redirect(user.role === "PLAYER" ? "/player" : user.role === "HEAD_COACH" || user.role === "ASSISTANT_COACH" ? "/coach" : "/portal");
}

export async function logout() {
  destroySession();
  redirect("/login");
}

const claimSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(10, "Use at least 10 characters."),
});

/** First-run: only works while zero user accounts exist. Creates the OWNER. */
export async function claimOwnership(_prev: FormState, formData: FormData): Promise<FormState> {
  const count = await db.user.count();
  if (count > 0) return { error: "Ownership has already been claimed for this installation." };
  const parsed = claimSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  const user = await db.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      passwordHash: await hashPassword(parsed.data.password),
      role: "OWNER",
    },
  });
  // First-run initialization: club record + the (uncompleted) milestone list,
  // so a fresh hosted deployment needs no separate seed step.
  await db.club.upsert({ where: { id: "club" }, update: {}, create: { id: "club" } });
  const MILESTONES = [
    ["founded", "Club founded", "The club was officially founded."],
    ["ownership", "Initial ownership established", "The founding ownership team is in place."],
    ["first-coach", "First coach appointed", "The club appointed its first coach."],
    ["first-player", "First player registered", "The first player was added to the club roster."],
    ["first-team", "First team assembled", "A full team was assembled from registered players."],
    ["first-training", "First training session", "The club held its first training session."],
    ["first-friendly", "First friendly match", "The club played its first friendly match."],
    ["league-application", "First league application", "The club applied to join a league."],
    ["league-affiliation", "Official league affiliation", "The club was officially accepted into a league."],
  ] as const;
  for (let i = 0; i < MILESTONES.length; i++) {
    const [key, label, description] = MILESTONES[i];
    await db.milestone.upsert({ where: { key }, update: {}, create: { key, label, description, sortOrder: i } });
  }
  await audit(user.id, "OWNERSHIP_CLAIMED", user.email);
  await createSession(user);
  redirect("/portal/setup");
}

const accountSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(10, "Use at least 10 characters."),
  role: z.enum(["OWNER", "ADMIN", "HEAD_COACH", "ASSISTANT_COACH", "PLAYER"]),
});

/** Owner-only: create an administrative / staff / player login account. */
export async function createAccount(_prev: FormState, formData: FormData): Promise<FormState> {
  const me = await requireRole("OWNER");
  const parsed = accountSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  const existing = await db.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (existing) return { error: "An account with that email already exists." };
  const user = await db.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      passwordHash: await hashPassword(parsed.data.password),
      role: parsed.data.role,
    },
  });
  await audit(me.id, "ACCOUNT_CREATED", `${user.email} (${user.role})`);
  revalidatePath("/portal/accounts");
  return { ok: true };
}

export async function setUserRole(formData: FormData) {
  const me = await requireRole("OWNER");
  const userId = String(formData.get("userId"));
  const role = String(formData.get("role")) as "OWNER" | "ADMIN" | "HEAD_COACH" | "ASSISTANT_COACH" | "PLAYER";
  if (userId === me.id && role !== "OWNER") return; // never demote yourself
  await db.user.update({ where: { id: userId }, data: { role } });
  await audit(me.id, "ROLE_CHANGED", `${userId} -> ${role}`);
  revalidatePath("/portal/accounts");
}

export async function deleteUser(formData: FormData) {
  const me = await requireRole("OWNER");
  const userId = String(formData.get("userId"));
  if (userId === me.id) return;
  await db.user.delete({ where: { id: userId } });
  await audit(me.id, "ACCOUNT_DELETED", userId);
  revalidatePath("/portal/accounts");
}

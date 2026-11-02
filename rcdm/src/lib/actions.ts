"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "./db";
import { createSession, destroySession, getCurrentUser, hashPassword, verifyPassword, canManage } from "./auth";

const email = z.string().email().transform((v) => v.toLowerCase().trim());
const text = (max = 5000) => z.string().trim().max(max);
const optDate = z
  .string()
  .optional()
  .transform((v) => (v ? new Date(v) : null));

function refresh(...paths: string[]) {
  for (const p of paths) revalidatePath(p);
}

async function mustBe(...roles: ("EMPLOYEE" | "SUPERVISOR" | "ADMIN")[]) {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  if (!roles.includes(user.role)) throw new Error("FORBIDDEN");
  return user;
}

/* ---------------- Auth ---------------- */

export async function loginAction(formData: FormData) {
  const parsed = z.object({ email, password: z.string().min(1) }).safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) redirect("/login?error=invalid");
  const user = await db.user.findUnique({ where: { email: parsed.data.email } }).catch(() => null);
  if (!user || user.status === "Inactive" || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    redirect("/login?error=invalid");
  }
  await createSession({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    rank: user.rank,
    position: user.position,
    status: user.status,
  });
  redirect("/portal");
}

export async function logoutAction() {
  destroySession();
  redirect("/");
}

/** First-run setup: creates the settings row and the first administrator. Only works while no accounts exist. */
export async function claimAdminAction(formData: FormData) {
  const count = await db.user.count().catch(() => 1);
  if (count > 0) redirect("/login");
  const parsed = z
    .object({ name: text(120), email, password: z.string().min(10, "Password must be at least 10 characters") })
    .safeParse({ name: formData.get("name"), email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) redirect("/setup?error=invalid");
  await db.siteSettings.upsert({ where: { id: "site" }, create: { id: "site" }, update: {} });
  const user = await db.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash: await hashPassword(parsed.data.password),
      role: "ADMIN",
      position: "Administrator",
    },
  });
  await createSession({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    rank: user.rank,
    position: user.position,
    status: user.status,
  });
  redirect("/portal");
}

/* ---------------- Employees / accounts (admin) ---------------- */

export async function createEmployeeAction(formData: FormData) {
  await mustBe("ADMIN");
  const parsed = z
    .object({
      name: text(120),
      email,
      password: z.string().min(10),
      role: z.enum(["EMPLOYEE", "SUPERVISOR", "ADMIN"]),
      rank: text(80).optional().default(""),
      position: text(120).optional().default(""),
    })
    .safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      role: formData.get("role"),
      rank: formData.get("rank") || "",
      position: formData.get("position") || "",
    });
  if (!parsed.success) redirect("/portal/admin/personnel?error=invalid");
  const exists = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (exists) redirect("/portal/admin/personnel?error=exists");
  await db.user.create({
    data: { ...parsed.data, passwordHash: await hashPassword(parsed.data.password) },
  });
  refresh("/portal/admin/personnel", "/portal/directory");
  redirect("/portal/admin/personnel?saved=1");
}

export async function updateEmployeeAction(formData: FormData) {
  await mustBe("ADMIN");
  const id = String(formData.get("id") || "");
  const parsed = z
    .object({
      name: text(120),
      role: z.enum(["EMPLOYEE", "SUPERVISOR", "ADMIN"]),
      rank: text(80).optional().default(""),
      position: text(120).optional().default(""),
      phone: text(40).optional().default(""),
      status: z.enum(["Active", "On Leave", "Inactive"]),
    })
    .safeParse({
      name: formData.get("name"),
      role: formData.get("role"),
      rank: formData.get("rank") || "",
      position: formData.get("position") || "",
      phone: formData.get("phone") || "",
      status: formData.get("status"),
    });
  if (!id || !parsed.success) redirect("/portal/admin/personnel?error=invalid");
  await db.user.update({ where: { id }, data: parsed.data });
  refresh("/portal/admin/personnel", "/portal/directory");
  redirect("/portal/admin/personnel?saved=1");
}

export async function resetPasswordAction(formData: FormData) {
  await mustBe("ADMIN");
  const id = String(formData.get("id") || "");
  const password = String(formData.get("password") || "");
  if (!id || password.length < 10) redirect("/portal/admin/personnel?error=invalid");
  await db.user.update({ where: { id }, data: { passwordHash: await hashPassword(password) } });
  redirect("/portal/admin/personnel?saved=1");
}

/** Employees can update their own contact details and bio. */
export async function updateMyProfileAction(formData: FormData) {
  const me = await mustBe("EMPLOYEE", "SUPERVISOR", "ADMIN");
  const parsed = z
    .object({ phone: text(40).optional().default(""), bio: text(1000).optional().default("") })
    .safeParse({ phone: formData.get("phone") || "", bio: formData.get("bio") || "" });
  if (!parsed.success) redirect("/portal/profile?error=invalid");
  await db.user.update({ where: { id: me.id }, data: parsed.data });
  refresh("/portal/profile", "/portal/directory");
  redirect("/portal/profile?saved=1");
}

/* ---------------- Announcements ---------------- */

export async function saveAnnouncementAction(formData: FormData) {
  const me = await mustBe("SUPERVISOR", "ADMIN");
  const id = String(formData.get("id") || "");
  const parsed = z
    .object({
      title: text(160),
      body: text().optional().default(""),
      audience: z.enum(["internal", "public"]),
      pinned: z.boolean(),
    })
    .safeParse({
      title: formData.get("title"),
      body: formData.get("body") || "",
      audience: formData.get("audience"),
      pinned: formData.get("pinned") === "on",
    });
  if (!parsed.success) redirect("/portal/admin/announcements?error=invalid");
  if (id) {
    await db.announcement.update({ where: { id }, data: parsed.data });
  } else {
    await db.announcement.create({ data: { ...parsed.data, authorId: me.id } });
  }
  refresh("/portal/admin/announcements", "/portal/announcements", "/");
  redirect("/portal/admin/announcements?saved=1");
}

export async function deleteAnnouncementAction(formData: FormData) {
  await mustBe("SUPERVISOR", "ADMIN");
  const id = String(formData.get("id") || "");
  if (id) await db.announcement.delete({ where: { id } });
  refresh("/portal/admin/announcements", "/portal/announcements", "/");
  redirect("/portal/admin/announcements?saved=1");
}

/* ---------------- Operations / deployments ---------------- */

const operationSchema = z.object({
  name: text(160),
  description: text().optional().default(""),
  location: text(160).optional().default(""),
  status: z.enum(["Planning", "Active", "Completed", "Cancelled"]),
  visibility: z.enum(["public", "internal"]),
  startsAt: optDate,
  endsAt: optDate,
});

export async function saveOperationAction(formData: FormData) {
  await mustBe("SUPERVISOR", "ADMIN");
  const id = String(formData.get("id") || "");
  const parsed = operationSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || "",
    location: formData.get("location") || "",
    status: formData.get("status"),
    visibility: formData.get("visibility"),
    startsAt: formData.get("startsAt") || undefined,
    endsAt: formData.get("endsAt") || undefined,
  });
  if (!parsed.success) redirect("/portal/admin/operations?error=invalid");
  if (id) await db.operation.update({ where: { id }, data: parsed.data });
  else await db.operation.create({ data: parsed.data });
  refresh("/portal/admin/operations", "/portal/operations", "/operations", "/");
  redirect("/portal/admin/operations?saved=1");
}

export async function deleteOperationAction(formData: FormData) {
  await mustBe("SUPERVISOR", "ADMIN");
  const id = String(formData.get("id") || "");
  if (id) await db.operation.delete({ where: { id } });
  refresh("/portal/admin/operations", "/portal/operations", "/operations");
  redirect("/portal/admin/operations?saved=1");
}

export async function assignEmployeeAction(formData: FormData) {
  await mustBe("SUPERVISOR", "ADMIN");
  const operationId = String(formData.get("operationId") || "");
  const userId = String(formData.get("userId") || "");
  const roleOnOp = String(formData.get("roleOnOp") || "").slice(0, 120);
  if (!operationId || !userId) redirect("/portal/admin/operations?error=invalid");
  await db.assignment.upsert({
    where: { operationId_userId: { operationId, userId } },
    create: { operationId, userId, roleOnOp },
    update: { roleOnOp },
  });
  refresh("/portal/admin/operations", "/portal/operations");
  redirect("/portal/admin/operations?saved=1");
}

export async function removeAssignmentAction(formData: FormData) {
  await mustBe("SUPERVISOR", "ADMIN");
  const id = String(formData.get("id") || "");
  if (id) await db.assignment.delete({ where: { id } });
  refresh("/portal/admin/operations", "/portal/operations");
  redirect("/portal/admin/operations?saved=1");
}

export async function updateAssignmentStatusAction(formData: FormData) {
  const me = await mustBe("EMPLOYEE", "SUPERVISOR", "ADMIN");
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  if (!["Assigned", "Confirmed", "Completed"].includes(status)) redirect("/portal/operations");
  const assignment = await db.assignment.findUnique({ where: { id } });
  // Employees can only change their own; managers can change any.
  if (assignment && (assignment.userId === me.id || canManage(me.role))) {
    await db.assignment.update({ where: { id }, data: { status } });
  }
  refresh("/portal/operations");
  redirect("/portal/operations");
}

/* ---------------- Training records ---------------- */

export async function saveTrainingAction(formData: FormData) {
  await mustBe("SUPERVISOR", "ADMIN");
  const id = String(formData.get("id") || "");
  const parsed = z
    .object({
      userId: z.string().min(1),
      course: text(160),
      status: z.enum(["Completed", "In Progress", "Expired"]),
      completedOn: optDate,
      expiresOn: optDate,
      notes: text(500).optional().default(""),
    })
    .safeParse({
      userId: formData.get("userId"),
      course: formData.get("course"),
      status: formData.get("status"),
      completedOn: formData.get("completedOn") || undefined,
      expiresOn: formData.get("expiresOn") || undefined,
      notes: formData.get("notes") || "",
    });
  if (!parsed.success) redirect("/portal/training?error=invalid");
  if (id) await db.trainingRecord.update({ where: { id }, data: parsed.data });
  else await db.trainingRecord.create({ data: parsed.data });
  refresh("/portal/training");
  redirect("/portal/training?saved=1");
}

export async function deleteTrainingAction(formData: FormData) {
  await mustBe("SUPERVISOR", "ADMIN");
  const id = String(formData.get("id") || "");
  if (id) await db.trainingRecord.delete({ where: { id } });
  refresh("/portal/training");
  redirect("/portal/training?saved=1");
}

/* ---------------- Site settings (admin) ---------------- */

export async function saveSettingsAction(formData: FormData) {
  await mustBe("ADMIN");
  const parsed = z
    .object({
      orgName: text(120),
      shortName: text(20),
      tagline: text(160),
      heroText: text(),
      mission: text(),
      aboutText: text(),
      operationsText: text(),
      contactEmail: text(120).optional().default(""),
      contactPhone: text(40).optional().default(""),
      address: text(200).optional().default(""),
      footerNote: text(300).optional().default(""),
    })
    .safeParse({
      orgName: formData.get("orgName"),
      shortName: formData.get("shortName"),
      tagline: formData.get("tagline"),
      heroText: formData.get("heroText") || "",
      mission: formData.get("mission") || "",
      aboutText: formData.get("aboutText") || "",
      operationsText: formData.get("operationsText") || "",
      contactEmail: formData.get("contactEmail") || "",
      contactPhone: formData.get("contactPhone") || "",
      address: formData.get("address") || "",
      footerNote: formData.get("footerNote") || "",
    });
  if (!parsed.success) redirect("/portal/admin/settings?error=invalid");
  await db.siteSettings.upsert({ where: { id: "site" }, create: { id: "site", ...parsed.data }, update: parsed.data });
  refresh("/", "/about", "/operations", "/contact", "/portal/admin/settings");
  redirect("/portal/admin/settings?saved=1");
}

/* ---------------- Public contact form ---------------- */

export async function submitInquiryAction(formData: FormData) {
  const parsed = z
    .object({ name: text(120), email, message: text(2000) })
    .safeParse({ name: formData.get("name"), email: formData.get("email"), message: formData.get("message") });
  if (!parsed.success) redirect("/contact?error=invalid");
  await db.inquiry.create({ data: parsed.data }).catch(() => null);
  redirect("/contact?sent=1");
}

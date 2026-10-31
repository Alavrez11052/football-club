import { db } from "./db";

export async function audit(userId: string | null, action: string, details = "") {
  try {
    await db.auditLog.create({ data: { userId, action, details } });
  } catch {
    // Audit logging must never break the action itself.
  }
}

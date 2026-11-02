import { db } from "./db";
import type { SiteSettingsData } from "./types";

export const DEFAULT_SETTINGS: SiteSettingsData = {
  orgName: "Ridgeway County Disaster Management",
  shortName: "RCDM",
  tagline: "Prepared. Responsive. Community first.",
  heroText:
    "Ridgeway County Disaster Management coordinates preparedness, response, and recovery for the residents of Ridgeway County — before, during, and after an emergency.",
  mission:
    "Our mission is to protect lives and property in Ridgeway County through planning, training, and coordinated response with local, state, and community partners.",
  aboutText:
    "Ridgeway County Disaster Management (RCDM) is the county office responsible for emergency preparedness and disaster coordination. Our team works year-round on response planning, training, and public readiness, and coordinates personnel and resources when incidents happen.",
  operationsText:
    "Active and recent operations coordinated by RCDM are listed below. Internal deployment details are available to employees in the portal.",
  contactEmail: "",
  contactPhone: "",
  address: "Ridgeway County, Indiana",
  footerNote: "For life-threatening emergencies, always call 911.",
};

/** Settings come from the DB when available; otherwise the editable defaults above. */
export async function getSettings(): Promise<SiteSettingsData> {
  try {
    const row = await db.siteSettings.findUnique({ where: { id: "site" } });
    if (!row) return DEFAULT_SETTINGS;
    return {
      orgName: row.orgName || DEFAULT_SETTINGS.orgName,
      shortName: row.shortName || DEFAULT_SETTINGS.shortName,
      tagline: row.tagline || DEFAULT_SETTINGS.tagline,
      heroText: row.heroText || DEFAULT_SETTINGS.heroText,
      mission: row.mission || DEFAULT_SETTINGS.mission,
      aboutText: row.aboutText || DEFAULT_SETTINGS.aboutText,
      operationsText: row.operationsText || DEFAULT_SETTINGS.operationsText,
      contactEmail: row.contactEmail || "",
      contactPhone: row.contactPhone || "",
      address: row.address || DEFAULT_SETTINGS.address,
      footerNote: row.footerNote || DEFAULT_SETTINGS.footerNote,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function getAnnouncements(audience?: "public" | "internal") {
  try {
    return await db.announcement.findMany({
      where: audience ? { audience } : undefined,
      orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
      include: { author: { select: { name: true } } },
    });
  } catch {
    return [];
  }
}

export async function getOperations(visibility?: "public" | "internal") {
  try {
    return await db.operation.findMany({
      where: visibility ? { visibility } : undefined,
      orderBy: [{ startsAt: "desc" }, { createdAt: "desc" }],
      include: { _count: { select: { assignments: true } } },
    });
  } catch {
    return [];
  }
}

export async function getEmployees() {
  try {
    return await db.user.findMany({ orderBy: { name: "asc" } });
  } catch {
    return [];
  }
}

export async function getAssignments(userId?: string) {
  try {
    return await db.assignment.findMany({
      where: userId ? { userId } : undefined,
      orderBy: { createdAt: "desc" },
      include: { operation: true, user: { select: { id: true, name: true, rank: true, position: true } } },
    });
  } catch {
    return [];
  }
}

export async function getTraining(userId?: string) {
  try {
    return await db.trainingRecord.findMany({
      where: userId ? { userId } : undefined,
      orderBy: [{ completedOn: "desc" }],
      include: { user: { select: { id: true, name: true } } },
    });
  } catch {
    return [];
  }
}

export async function hasAnyUser(): Promise<boolean> {
  try {
    return (await db.user.count()) > 0;
  } catch {
    return false;
  }
}

export function fmtDate(d: Date | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

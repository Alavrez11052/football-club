import type { Role } from "@prisma/client";

export type { Role };

export const ROLE_LABEL: Record<Role, string> = {
  EMPLOYEE: "Employee",
  SUPERVISOR: "Supervisor",
  ADMIN: "Administrator",
};

export interface SiteSettingsData {
  orgName: string;
  shortName: string;
  tagline: string;
  heroText: string;
  mission: string;
  aboutText: string;
  operationsText: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  footerNote: string;
}

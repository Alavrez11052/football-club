import { redirect } from "next/navigation";
import PortalShell, { type NavItem } from "@/components/PortalShell";
import { getCurrentUser } from "@/lib/auth";
import { getClub } from "@/lib/club";

const NAV: NavItem[] = [
  { href: "/portal", label: "Dashboard" },
  { href: "/portal/setup", label: "Club setup", ownerOnly: true },
  { href: "/portal/website", label: "Website & branding", ownerOnly: true },
  { href: "/portal/applications", label: "Applications" },
  { href: "/portal/players", label: "Players" },
  { href: "/portal/staff", label: "Staff & coaches" },
  { href: "/portal/teams", label: "Teams" },
  { href: "/portal/fixtures", label: "Fixtures" },
  { href: "/portal/news", label: "News" },
  { href: "/portal/inquiries", label: "Inquiries" },
  { href: "/portal/development", label: "Club development", ownerOnly: true },
  { href: "/portal/accounts", label: "Accounts & roles", ownerOnly: true },
];

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "PLAYER") redirect("/player");
  if (user.role === "HEAD_COACH" || user.role === "ASSISTANT_COACH") redirect("/coach");
  const club = await getClub();
  return (
    <PortalShell club={club} userName={user.name} role={user.role} area="Ownership Portal" nav={NAV}>
      {children}
    </PortalShell>
  );
}

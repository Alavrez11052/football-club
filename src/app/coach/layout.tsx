import { redirect } from "next/navigation";
import PortalShell, { type NavItem } from "@/components/PortalShell";
import { getCurrentUser } from "@/lib/auth";
import { getClub } from "@/lib/club";

const NAV: NavItem[] = [
  { href: "/coach", label: "My teams" },
  { href: "/coach/players", label: "Players & development" },
  { href: "/coach/training", label: "Training" },
  { href: "/coach/matches", label: "Matchday" },
];

export default async function CoachLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "PLAYER") redirect("/player");
  const club = await getClub();
  return (
    <PortalShell club={club} userName={user.name} role={user.role} area="Coaching Portal" nav={NAV}>
      {children}
    </PortalShell>
  );
}

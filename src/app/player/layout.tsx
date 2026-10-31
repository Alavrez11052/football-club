import { redirect } from "next/navigation";
import PortalShell, { type NavItem } from "@/components/PortalShell";
import { getCurrentUser } from "@/lib/auth";
import { getClub } from "@/lib/club";

const NAV: NavItem[] = [{ href: "/player", label: "My profile & team" }];

export default async function PlayerLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const club = await getClub();
  return (
    <PortalShell club={club} userName={user.name} role={user.role} area="Player Portal" nav={NAV}>
      {children}
    </PortalShell>
  );
}

import PortalShell from "@/components/PortalShell";
import { requireUser } from "@/lib/auth";
import { getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const [user, settings] = await Promise.all([requireUser(), getSettings()]);
  return (
    <PortalShell user={user} orgName={settings.orgName} shortName={settings.shortName}>
      {children}
    </PortalShell>
  );
}

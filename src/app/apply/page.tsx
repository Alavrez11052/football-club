import PublicShell from "@/components/PublicShell";
import { PageHero } from "@/components/ui";
import { ApplicationForm } from "@/components/forms";
import { getClub } from "@/lib/club";

export const dynamic = "force-dynamic";

export default async function ApplyPage() {
  const club = await getClub();
  return (
    <PublicShell club={club}>
      <PageHero title="Join the club" sub="Player and coaching applications are reviewed by the ownership team. Applying does not register you with the club." />
      <div className="mx-auto grid max-w-6xl items-start gap-10 px-4 py-12 lg:grid-cols-2">
        <section>
          <h2 className="mb-1 font-display text-2xl font-bold">Player application</h2>
          <p className="mb-4 text-sm text-gray-600">For players who want to join the squad. Applicants under 18 need parent/guardian consent (see the safeguarding section in the form).</p>
          <ApplicationForm type="PLAYER" />
        </section>
        <section>
          <h2 className="mb-1 font-display text-2xl font-bold">Coaching application</h2>
          <p className="mb-4 text-sm text-gray-600">For head coaches, assistants and other football staff who want to help build this club.</p>
          <ApplicationForm type="COACH" />
        </section>
      </div>
    </PublicShell>
  );
}

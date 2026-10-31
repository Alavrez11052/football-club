import PublicShell from "@/components/PublicShell";
import { EmptyState, FixtureCard, PageHero } from "@/components/ui";
import { db } from "@/lib/db";
import { clubDisplayName, getClub } from "@/lib/club";

export const dynamic = "force-dynamic";

export default async function FixturesPage() {
  const club = await getClub();
  const name = clubDisplayName(club.name);
  const [upcoming, results] = await Promise.all([
    db.fixture.findMany({ where: { status: "SCHEDULED" }, orderBy: { date: "asc" } }),
    db.fixture.findMany({ where: { status: "COMPLETED" }, orderBy: { date: "desc" } }),
  ]);
  return (
    <PublicShell club={club}>
      <PageHero title="Fixtures & results" sub="Every match, as it is arranged and played." />
      <div className="mx-auto max-w-4xl space-y-10 px-4 py-12">
        {upcoming.length === 0 && results.length === 0 ? (
          <EmptyState title="Fixtures have not been announced yet">
            The club is newly founded and is not yet affiliated with a league, so no fixtures have been arranged. When our first
            matches are scheduled, they will appear here.
          </EmptyState>
        ) : (
          <>
            {upcoming.length > 0 && (
              <section>
                <h2 className="mb-4 font-display text-2xl font-bold">Upcoming fixtures</h2>
                <div className="space-y-3">{upcoming.map((f) => <FixtureCard key={f.id} f={f} clubName={name} />)}</div>
              </section>
            )}
            {results.length > 0 && (
              <section>
                <h2 className="mb-4 font-display text-2xl font-bold">Results</h2>
                <div className="space-y-3">{results.map((f) => <FixtureCard key={f.id} f={f} clubName={name} />)}</div>
              </section>
            )}
          </>
        )}
      </div>
    </PublicShell>
  );
}

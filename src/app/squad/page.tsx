import Link from "next/link";
import PublicShell from "@/components/PublicShell";
import { EmptyState, PageHero } from "@/components/ui";
import { db } from "@/lib/db";
import { getClub } from "@/lib/club";

export const dynamic = "force-dynamic";

export default async function SquadPage() {
  const club = await getClub();
  const teams = await db.team.findMany({ orderBy: { name: "asc" }, include: { players: { orderBy: [{ squadNumber: "asc" }, { fullName: "asc" }] } } });
  const unassigned = await db.player.findMany({ where: { teamId: null }, orderBy: { fullName: "asc" } });
  const total = teams.reduce((n, t) => n + t.players.length, 0) + unassigned.length;

  const PlayerCard = ({ p }: { p: (typeof unassigned)[number] }) => (
    <div className="card text-center">
      {p.photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={p.photoUrl} alt={p.fullName} className="mx-auto h-28 w-28 rounded-full object-cover" />
      ) : (
        <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-burgundy/10 font-display text-3xl font-bold text-burgundy">
          {p.squadNumber ?? p.fullName.charAt(0)}
        </div>
      )}
      <p className="mt-3 font-display text-lg font-bold">{p.fullName}</p>
      <p className="text-sm font-medium" style={{ color: "var(--club-primary)" }}>
        {p.position || "Player"}{p.squadNumber ? ` · #${p.squadNumber}` : ""}
      </p>
      {p.biography ? <p className="mt-2 line-clamp-4 text-sm text-gray-600">{p.biography}</p> : null}
    </div>
  );

  return (
    <PublicShell club={club}>
      <PageHero title="Squad" sub="The players representing the club." />
      <div className="mx-auto max-w-6xl px-4 py-12">
        {total === 0 ? (
          <EmptyState
            title="We are recruiting our first squad"
            action={<Link href="/apply" className="btn-primary">Apply to play</Link>}
          >
            The club is newly founded and player recruitment is now open. No players are registered yet — the first names to join
            will be the founding squad of this club, and they will appear here as soon as they are registered.
          </EmptyState>
        ) : (
          <div className="space-y-12">
            {teams.filter((t) => t.players.length > 0).map((t) => (
              <section key={t.id}>
                <h2 className="mb-4 font-display text-2xl font-bold">{t.name}{t.ageGroup ? ` · ${t.ageGroup}` : ""}</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {t.players.map((p) => <PlayerCard key={p.id} p={p} />)}
                </div>
              </section>
            ))}
            {unassigned.length > 0 && (
              <section>
                <h2 className="mb-4 font-display text-2xl font-bold">Registered players</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {unassigned.map((p) => <PlayerCard key={p.id} p={p} />)}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </PublicShell>
  );
}

import Link from "next/link";
import { PortalTitle } from "@/components/PortalShell";
import { getCurrentUser } from "@/lib/auth";
import { visibleTeams } from "@/lib/coach-data";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function CoachHomePage() {
  const user = (await getCurrentUser())!;
  const teams = await visibleTeams(user.id, user.role);
  const cards = await Promise.all(
    teams.map(async (t) => {
      const [count, nextSession, nextMatch] = await Promise.all([
        db.player.count({ where: { teamId: t.id } }),
        db.trainingSession.findFirst({ where: { teamId: t.id, date: { gte: new Date() } }, orderBy: { date: "asc" } }),
        db.fixture.findFirst({ where: { teamId: t.id, status: "SCHEDULED" }, orderBy: { date: "asc" } }),
      ]);
      return { t, count, nextSession, nextMatch };
    })
  );
  return (
    <div className="space-y-6">
      <PortalTitle title="My teams" sub="You can only see and manage the teams you have been assigned to." />
      {teams.length === 0 ? (
        <p className="card text-sm text-gray-600">
          You have not been assigned to a team yet. Once the club&apos;s ownership creates a team and assigns you as its coach,
          it will appear here with its roster, training and matches.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {cards.map(({ t, count, nextSession, nextMatch }) => {
            return (
              <div key={t.id} className="card">
                <h2 className="font-display text-xl font-bold">{t.name}{t.ageGroup ? <span className="ml-2 text-sm font-medium text-gray-500">{t.ageGroup}</span> : null}</h2>
                <ul className="mt-2 space-y-1 text-sm text-gray-600">
                  <li>{count} registered player{count === 1 ? "" : "s"}</li>
                  <li>Next training: {nextSession ? `${nextSession.title} — ${new Date(nextSession.date).toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}` : "none scheduled"}</li>
                  <li>Next match: {nextMatch ? `vs ${nextMatch.opponent} — ${new Date(nextMatch.date).toLocaleDateString()}` : "none scheduled"}</li>
                </ul>
                <div className="mt-4 flex gap-2">
                  <Link href="/coach/players" className="btn-outline !px-3 !py-1.5 text-sm">Roster</Link>
                  <Link href="/coach/training" className="btn-outline !px-3 !py-1.5 text-sm">Training</Link>
                  <Link href="/coach/matches" className="btn-outline !px-3 !py-1.5 text-sm">Matchday</Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

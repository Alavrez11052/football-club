import Link from "next/link";
import { PortalTitle } from "@/components/PortalShell";
import { db } from "@/lib/db";
import { getClub, setupProgress } from "@/lib/club";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = (await getCurrentUser())!;
  const club = await getClub();
  const progress = setupProgress(club);
  const [players, staff, pendingPlayers, pendingCoaches, upcoming, activity, teams] = await Promise.all([
    db.player.count(),
    db.staffMember.count(),
    db.application.count({ where: { type: "PLAYER", status: "PENDING" } }),
    db.application.count({ where: { type: "COACH", status: "PENDING" } }),
    db.fixture.findMany({ where: { status: "SCHEDULED" }, orderBy: { date: "asc" }, take: 5 }),
    db.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 8, include: { user: true } }),
    db.team.count(),
  ]);

  const Stat = ({ label, value, href, hint }: { label: string; value: number; href: string; hint?: string }) => (
    <Link href={href} className="card block transition hover:shadow-md">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-1 font-display text-3xl font-extrabold text-gray-900">{value}</p>
      {hint ? <p className="mt-1 text-xs text-gray-400">{hint}</p> : null}
    </Link>
  );

  return (
    <div>
      <PortalTitle title={`Welcome${club.name ? `, ${club.name}` : ""}`} sub="The real, current state of your club — nothing here is filled in for show." />

      {user.role === "OWNER" && progress.done.length < progress.total && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-display font-bold text-amber-900">Club setup is {progress.percent}% complete</p>
              <p className="text-sm text-amber-800">Finish establishing your club&apos;s identity so the public website can introduce it properly.</p>
            </div>
            <Link href="/portal/setup" className="btn-primary">Continue setup</Link>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-amber-200">
            <div className="h-full" style={{ width: `${progress.percent}%`, background: "var(--club-primary)" }} />
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Registered players" value={players} href="/portal/players" hint={players === 0 ? "No players yet — recruitment is the priority." : undefined} />
        <Stat label="Coaching & staff" value={staff} href="/portal/staff" hint={staff === 0 ? "No staff appointed yet." : undefined} />
        <Stat label="Teams" value={teams} href="/portal/teams" hint={teams === 0 ? "Create your first team when ready." : undefined} />
        <Stat label="Pending applications" value={pendingPlayers + pendingCoaches} href="/portal/applications" hint={`${pendingPlayers} player · ${pendingCoaches} coach`} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="card">
          <h2 className="font-display text-lg font-bold">Upcoming fixtures</h2>
          {upcoming.length === 0 ? (
            <p className="mt-2 text-sm text-gray-500">
              No fixtures scheduled. Fixtures appear here once the club starts arranging matches —{" "}
              <Link className="font-semibold underline" href="/portal/fixtures">add one</Link>.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {upcoming.map((f) => (
                <li key={f.id} className="flex justify-between text-sm">
                  <span className="font-medium">vs {f.opponent}</span>
                  <span className="text-gray-500">{new Date(f.date).toLocaleDateString(undefined, { day: "numeric", month: "short" })}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="card">
          <h2 className="font-display text-lg font-bold">Recent activity</h2>
          {activity.length === 0 ? (
            <p className="mt-2 text-sm text-gray-500">No administrative activity recorded yet. Actions taken in this portal are logged here.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {activity.map((a) => (
                <li key={a.id} className="flex justify-between gap-3">
                  <span><span className="font-medium">{a.action.replace(/_/g, " ")}</span>{a.details ? <span className="text-gray-500"> — {a.details}</span> : null}</span>
                  <span className="whitespace-nowrap text-gray-400">{new Date(a.createdAt).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

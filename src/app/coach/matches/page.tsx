import { PortalTitle } from "@/components/PortalShell";
import { getCurrentUser } from "@/lib/auth";
import { visibleTeams } from "@/lib/coach-data";
import { db } from "@/lib/db";
import { saveMatchday } from "@/lib/actions/coach";

export const dynamic = "force-dynamic";

export default async function CoachMatchesPage() {
  const user = (await getCurrentUser())!;
  const teams = await visibleTeams(user.id, user.role);
  const fixtures = teams.length
    ? await db.fixture.findMany({ where: { teamId: { in: teams.map((t) => t.id) } }, orderBy: { date: "desc" }, take: 20, include: { team: true, availability: { include: { player: true } } } })
    : [];

  const rosters = new Map<string, { id: string; fullName: string; position: string }[]>();
  for (const f of fixtures) {
    if (f.teamId) {
      rosters.set(f.id, await db.player.findMany({ where: { teamId: f.teamId }, orderBy: { fullName: "asc" }, select: { id: true, fullName: true, position: true } }));
    }
  }

  return (
    <div className="space-y-6">
      <PortalTitle title="Matchday" sub="Build the squad, set the formation, then submit the result and your match report after the game." />
      {teams.length === 0 ? (
        <p className="card text-sm text-gray-600">No assigned teams yet.</p>
      ) : fixtures.length === 0 ? (
        <p className="card text-sm text-gray-600">No fixtures exist for your teams yet. Ownership creates fixtures in the ownership portal; they will appear here for matchday preparation.</p>
      ) : (
        fixtures.map((f) => {
          const roster = rosters.get(f.id) ?? [];
          let lineup: string[] = [];
          try { lineup = JSON.parse(f.lineup || "[]"); } catch { lineup = []; }
          return (
            <section key={f.id} className="card space-y-4">
              <p className="font-display font-bold">
                vs {f.opponent} <span className="ml-1 text-sm font-medium text-gray-500">
                  {f.team?.name} · {new Date(f.date).toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })} · {f.status}
                  {f.status === "COMPLETED" ? ` · ${f.homeScore ?? 0}–${f.awayScore ?? 0}` : ""}
                </span>
              </p>
              {f.availability.length > 0 && (
                <p className="text-sm text-gray-600">
                  Availability: {f.availability.map((a) => `${a.player.fullName} (${a.status.toLowerCase()})`).join(", ")}
                </p>
              )}
              <form action={saveMatchday} className="space-y-3">
                <input type="hidden" name="fixtureId" value={f.id} />
                <div className="grid gap-3 sm:grid-cols-3">
                  <div><label className="label">Formation</label><input className="input" name="formation" defaultValue={f.formation} placeholder="e.g. 4-3-3" /></div>
                  <div><label className="label">Status</label>
                    <select className="input" name="status" defaultValue={f.status}>
                      <option value="SCHEDULED">Scheduled</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="POSTPONED">Postponed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><label className="label">Our score</label><input className="input" type="number" name="homeScore" defaultValue={f.homeScore ?? ""} /></div>
                    <div><label className="label">Their score</label><input className="input" type="number" name="awayScore" defaultValue={f.awayScore ?? ""} /></div>
                  </div>
                </div>
                <div>
                  <p className="label">Matchday squad (tick the selected players)</p>
                  {roster.length === 0 ? (
                    <p className="text-sm text-gray-500">No players are assigned to this team yet.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {roster.map((p) => (
                        <label key={p.id} className="flex items-center gap-2 rounded-full bg-ink/5 px-3 py-1.5 text-sm">
                          <input type="checkbox" name="lineup" value={p.id} defaultChecked={lineup.includes(p.id)} />
                          {p.fullName}{p.position ? ` (${p.position})` : ""}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                <div><label className="label">Match report</label><textarea className="input" name="report" rows={3} defaultValue={f.report} placeholder="How did the match go? Key moments, scorers, lessons…" /></div>
                <button className="btn-primary !px-4 !py-2 text-sm">Save matchday</button>
              </form>
            </section>
          );
        })
      )}
    </div>
  );
}

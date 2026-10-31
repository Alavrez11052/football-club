import { PortalTitle } from "@/components/PortalShell";
import { db } from "@/lib/db";
import { deleteTeam, saveTeam, setTeamCoach } from "@/lib/actions/people";

export const dynamic = "force-dynamic";

export default async function TeamsPage() {
  const [teams, coaches] = await Promise.all([
    db.team.findMany({ orderBy: { name: "asc" }, include: { players: true, coaches: { include: { user: true } } } }),
    db.user.findMany({ where: { role: { in: ["HEAD_COACH", "ASSISTANT_COACH"] } }, orderBy: { name: "asc" } }),
  ]);
  return (
    <div className="space-y-6">
      <PortalTitle title="Teams" sub="Create teams as the club grows, assign players from the Players page, and assign coaches here." />
      <section className="card">
        <h2 className="mb-3 font-display font-bold">Create a team</h2>
        <form action={saveTeam} className="flex flex-wrap gap-3">
          <input type="hidden" name="id" value="" />
          <input className="input !w-64" name="name" placeholder="Team name (e.g. First Team, U18s)" required />
          <input className="input !w-48" name="ageGroup" placeholder="Age group (optional)" />
          <button className="btn-primary !px-4 !py-2 text-sm">Create team</button>
        </form>
      </section>
      {teams.length === 0 ? (
        <p className="card text-sm text-gray-500">No teams exist yet. A newly founded club might start with a single First Team once enough players are registered.</p>
      ) : (
        teams.map((t) => (
          <section key={t.id} className="card space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-display text-lg font-bold">{t.name}{t.ageGroup ? <span className="ml-2 text-sm font-medium text-gray-500">{t.ageGroup}</span> : null}</h3>
              <form action={deleteTeam}><input type="hidden" name="id" value={t.id} /><button className="text-sm font-semibold text-red-600">Delete team</button></form>
            </div>
            <form action={saveTeam} className="flex flex-wrap gap-2">
              <input type="hidden" name="id" value={t.id} />
              <input className="input !w-56" name="name" defaultValue={t.name} />
              <input className="input !w-40" name="ageGroup" defaultValue={t.ageGroup} placeholder="Age group" />
              <button className="btn-outline !px-3 !py-1.5 text-sm">Rename</button>
            </form>
            <p className="text-sm text-gray-600">{t.players.length} player{t.players.length === 1 ? "" : "s"} assigned{t.players.length ? `: ${t.players.map((p) => p.fullName).join(", ")}` : ""}</p>
            <div>
              <p className="mb-2 text-sm font-semibold text-gray-700">Coaches for this team</p>
              {coaches.length === 0 ? (
                <p className="text-sm text-gray-500">No coach accounts exist yet. Create one under Accounts &amp; roles, then assign it here.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {coaches.map((c) => {
                    const assigned = t.coaches.some((tc) => tc.userId === c.id);
                    return (
                      <form key={c.id} action={setTeamCoach}>
                        <input type="hidden" name="teamId" value={t.id} />
                        <input type="hidden" name="userId" value={c.id} />
                        <input type="hidden" name="assign" value={assigned ? "false" : "true"} />
                        <button className={`rounded-full px-3 py-1.5 text-xs font-bold ${assigned ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700"}`}>
                          {c.name} ({c.role.replace(/_/g, " ")}) {assigned ? "· assigned ✓" : "· assign"}
                        </button>
                      </form>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        ))
      )}
    </div>
  );
}

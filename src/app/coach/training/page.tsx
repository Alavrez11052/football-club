import { PortalTitle } from "@/components/PortalShell";
import { getCurrentUser } from "@/lib/auth";
import { visibleTeams } from "@/lib/coach-data";
import { db } from "@/lib/db";
import { createTrainingSession, deleteTrainingSession, saveAttendance } from "@/lib/actions/coach";

export const dynamic = "force-dynamic";

export default async function CoachTrainingPage() {
  const user = (await getCurrentUser())!;
  const teams = await visibleTeams(user.id, user.role);
  const teamIds = teams.map((t) => t.id);
  const sessions = teamIds.length
    ? await db.trainingSession.findMany({ where: { teamId: { in: teamIds } }, orderBy: { date: "desc" }, take: 20, include: { team: true, attendance: true } })
    : [];
  const rosters = new Map<string, { id: string; fullName: string }[]>();
  for (const t of teams) {
    rosters.set(t.id, await db.player.findMany({ where: { teamId: t.id }, orderBy: { fullName: "asc" }, select: { id: true, fullName: true } }));
  }

  return (
    <div className="space-y-6">
      <PortalTitle title="Training" sub="Schedule sessions for your teams and record who attended." />
      {teams.length === 0 ? (
        <p className="card text-sm text-gray-600">No assigned teams yet — training can be scheduled once ownership assigns you a team.</p>
      ) : (
        <>
          <section className="card">
            <h2 className="mb-3 font-display font-bold">Schedule a session</h2>
            <form action={createTrainingSession} className="grid gap-3 sm:grid-cols-3">
              <div><label className="label">Team</label>
                <select className="input" name="teamId">{teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
              </div>
              <div><label className="label">Title</label><input className="input" name="title" placeholder="Training" /></div>
              <div><label className="label">Date & time</label><input className="input" type="datetime-local" name="date" required /></div>
              <div><label className="label">Location</label><input className="input" name="location" /></div>
              <div className="sm:col-span-2"><label className="label">Session notes / focus</label><input className="input" name="notes" /></div>
              <div className="sm:col-span-3"><button className="btn-primary !px-4 !py-2 text-sm">Create session</button></div>
            </form>
          </section>
          {sessions.length === 0 ? (
            <p className="card text-sm text-gray-500">No sessions scheduled yet.</p>
          ) : (
            sessions.map((s) => {
              const roster = rosters.get(s.teamId) ?? [];
              const presentSet = new Set(s.attendance.filter((a) => a.present).map((a) => a.playerId));
              return (
                <section key={s.id} className="card space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-display font-bold">{s.title} <span className="ml-1 text-sm font-medium text-gray-500">{s.team.name} · {new Date(s.date).toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}{s.location ? ` · ${s.location}` : ""}</span></p>
                    <form action={deleteTrainingSession}><input type="hidden" name="id" value={s.id} /><button className="text-sm font-semibold text-red-600">Delete</button></form>
                  </div>
                  {s.notes ? <p className="text-sm text-gray-600">{s.notes}</p> : null}
                  {roster.length === 0 ? (
                    <p className="text-sm text-gray-500">This team has no registered players yet, so attendance cannot be recorded.</p>
                  ) : (
                    <form action={saveAttendance}>
                      <input type="hidden" name="sessionId" value={s.id} />
                      <p className="mb-2 text-sm font-semibold text-gray-700">Attendance — tick everyone who attended ({presentSet.size}/{roster.length} recorded present)</p>
                      <div className="flex flex-wrap gap-2">
                        {roster.map((p) => (
                          <label key={p.id} className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-sm">
                            <input type="checkbox" name="present" value={p.id} defaultChecked={presentSet.has(p.id)} /> {p.fullName}
                          </label>
                        ))}
                      </div>
                      <button className="btn-outline mt-3 !px-3 !py-1.5 text-sm">Save attendance</button>
                    </form>
                  )}
                </section>
              );
            })
          )}
        </>
      )}
    </div>
  );
}

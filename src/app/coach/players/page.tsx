import { PortalTitle } from "@/components/PortalShell";
import { getCurrentUser } from "@/lib/auth";
import { visibleTeams } from "@/lib/coach-data";
import { db } from "@/lib/db";
import { addCoachNote, addEvaluation } from "@/lib/actions/coach";

export const dynamic = "force-dynamic";

export default async function CoachPlayersPage() {
  const user = (await getCurrentUser())!;
  const teams = await visibleTeams(user.id, user.role);
  const players = teams.length
    ? await db.player.findMany({
        where: { teamId: { in: teams.map((t) => t.id) } },
        orderBy: { fullName: "asc" },
        include: {
          team: true,
          notes: { orderBy: { createdAt: "desc" }, take: 5, include: { author: true } },
          evaluations: { orderBy: { createdAt: "desc" }, take: 5 },
          attendance: true,
        },
      })
    : [];

  return (
    <div className="space-y-6">
      <PortalTitle title="Players & development" sub="Rosters for your teams. Notes and evaluations are private to coaching staff and ownership — players never see them." />
      {teams.length === 0 ? (
        <p className="card text-sm text-gray-600">No assigned teams yet.</p>
      ) : players.length === 0 ? (
        <p className="card text-sm text-gray-600">Your teams have no registered players yet. Players appear here once ownership registers them and assigns them to your team.</p>
      ) : (
        players.map((p) => {
          const attended = p.attendance.filter((a) => a.present).length;
          const totalSessions = p.attendance.length;
          const avg = p.evaluations.length ? (p.evaluations.reduce((n, e) => n + e.rating, 0) / p.evaluations.length).toFixed(1) : null;
          return (
            <section key={p.id} className="card space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-display font-bold">{p.fullName} <span className="ml-1 text-sm font-medium text-gray-500">{p.team?.name} · {p.position || "No position"}{p.squadNumber ? ` · #${p.squadNumber}` : ""}</span></p>
                <p className="text-xs text-gray-500">Attendance: {totalSessions ? `${attended}/${totalSessions} sessions` : "no sessions yet"}{avg ? ` · Avg. development rating ${avg}/10` : ""}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="mb-1 text-sm font-semibold text-gray-700">Private coaching notes</p>
                  {p.notes.length === 0 ? <p className="text-sm text-gray-500">No notes yet.</p> : (
                    <ul className="space-y-1 text-sm text-gray-700">
                      {p.notes.map((n) => <li key={n.id} className="rounded bg-gray-50 px-2 py-1">{n.note} <span className="text-xs text-gray-400">— {n.author?.name ?? "Coach"}, {new Date(n.createdAt).toLocaleDateString()}</span></li>)}
                    </ul>
                  )}
                  <form action={addCoachNote} className="mt-2 flex gap-2">
                    <input type="hidden" name="playerId" value={p.id} />
                    <input className="input" name="note" placeholder="Add a private note…" required />
                    <button className="btn-outline !px-3 !py-1.5 text-sm">Add</button>
                  </form>
                </div>
                <div>
                  <p className="mb-1 text-sm font-semibold text-gray-700">Development evaluations</p>
                  {p.evaluations.length === 0 ? <p className="text-sm text-gray-500">No evaluations yet.</p> : (
                    <ul className="space-y-1 text-sm text-gray-700">
                      {p.evaluations.map((e) => <li key={e.id} className="rounded bg-gray-50 px-2 py-1"><strong>{e.rating}/10</strong> {e.comments} <span className="text-xs text-gray-400">{new Date(e.createdAt).toLocaleDateString()}</span></li>)}
                    </ul>
                  )}
                  <form action={addEvaluation} className="mt-2 flex gap-2">
                    <input type="hidden" name="playerId" value={p.id} />
                    <input className="input !w-20" name="rating" type="number" min={1} max={10} placeholder="1–10" required />
                    <input className="input" name="comments" placeholder="Evaluation comments…" />
                    <button className="btn-outline !px-3 !py-1.5 text-sm">Save</button>
                  </form>
                </div>
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}

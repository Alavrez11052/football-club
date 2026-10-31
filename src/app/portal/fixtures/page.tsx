import { PortalTitle } from "@/components/PortalShell";
import { db } from "@/lib/db";
import { deleteFixture, saveFixture } from "@/lib/actions/fixtures";

export const dynamic = "force-dynamic";

export default async function PortalFixturesPage() {
  const [fixtures, teams] = await Promise.all([
    db.fixture.findMany({ orderBy: { date: "desc" }, include: { team: true } }),
    db.team.findMany({ orderBy: { name: "asc" } }),
  ]);
  const dt = (d: Date) => new Date(d).toISOString().slice(0, 16);

  const FixtureForm = ({ f }: { f?: (typeof fixtures)[number] }) => (
    <form action={saveFixture} className="grid gap-3 sm:grid-cols-3">
      <input type="hidden" name="id" value={f?.id ?? ""} />
      <div><label className="label">Opponent</label><input className="input" name="opponent" defaultValue={f?.opponent ?? ""} required /></div>
      <div><label className="label">Date & kickoff</label><input className="input" type="datetime-local" name="date" defaultValue={f ? dt(f.date) : ""} required /></div>
      <div><label className="label">Venue</label><input className="input" name="venue" defaultValue={f?.venue ?? ""} /></div>
      <div><label className="label">Competition</label><input className="input" name="competition" defaultValue={f?.competition ?? ""} placeholder="e.g. Friendly, League" /></div>
      <div><label className="label">Team</label>
        <select className="input" name="teamId" defaultValue={f?.teamId ?? ""}>
          <option value="">Club (unspecified)</option>
          {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>
      <div><label className="label">Status</label>
        <select className="input" name="status" defaultValue={f?.status ?? "SCHEDULED"}>
          <option value="SCHEDULED">Scheduled</option>
          <option value="COMPLETED">Completed</option>
          <option value="POSTPONED">Postponed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>
      <div><label className="label">Our score (if completed)</label><input className="input" type="number" name="homeScore" defaultValue={f?.homeScore ?? ""} /></div>
      <div><label className="label">Opponent score</label><input className="input" type="number" name="awayScore" defaultValue={f?.awayScore ?? ""} /></div>
      <label className="flex items-end gap-2 pb-2 text-sm"><input type="checkbox" name="isHome" defaultChecked={f?.isHome ?? true} /> Home match</label>
      <div className="sm:col-span-3"><button className="btn-primary !px-4 !py-2 text-sm">{f ? "Save fixture" : "Add fixture"}</button></div>
    </form>
  );

  return (
    <div className="space-y-6">
      <PortalTitle title="Fixtures" sub="Arrange matches and record results. Completed scores appear on the public Fixtures page automatically." />
      <section className="card"><h2 className="mb-3 font-display font-bold">Add a fixture</h2><FixtureForm /></section>
      {fixtures.length === 0 ? (
        <p className="card text-sm text-gray-500">No fixtures yet — correct for a club that has not started playing. Add the first friendly when it is arranged.</p>
      ) : (
        fixtures.map((f) => (
          <section key={f.id} className="card space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-display font-bold">
                vs {f.opponent} <span className="ml-1 text-sm font-medium text-gray-500">
                  {new Date(f.date).toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })} · {f.status}
                  {f.status === "COMPLETED" ? ` · ${f.homeScore ?? 0}–${f.awayScore ?? 0}` : ""}{f.team ? ` · ${f.team.name}` : ""}
                </span>
              </p>
              <form action={deleteFixture}><input type="hidden" name="id" value={f.id} /><button className="text-sm font-semibold text-red-600">Delete</button></form>
            </div>
            <details><summary className="cursor-pointer text-sm font-semibold text-gray-600">Edit</summary><div className="mt-3"><FixtureForm f={f} /></div></details>
          </section>
        ))
      )}
    </div>
  );
}

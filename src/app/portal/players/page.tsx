import { PortalTitle } from "@/components/PortalShell";
import { db } from "@/lib/db";
import { deletePlayer, linkPlayerAccount, savePlayer } from "@/lib/actions/people";

export const dynamic = "force-dynamic";

export default async function PlayersPage() {
  const [players, teams, playerAccounts] = await Promise.all([
    db.player.findMany({ orderBy: [{ teamId: "asc" }, { squadNumber: "asc" }, { fullName: "asc" }], include: { team: true } }),
    db.team.findMany({ orderBy: { name: "asc" } }),
    db.user.findMany({ where: { role: "PLAYER" }, orderBy: { name: "asc" } }),
  ]);
  const dv = (d: Date | null) => (d ? new Date(d).toISOString().slice(0, 10) : "");

  const PlayerForm = ({ p }: { p?: (typeof players)[number] }) => (
    <form action={savePlayer} className="grid gap-3 sm:grid-cols-3">
      <input type="hidden" name="id" value={p?.id ?? ""} />
      <div><label className="label">Full name</label><input className="input" name="fullName" defaultValue={p?.fullName ?? ""} required /></div>
      <div><label className="label">Position</label><input className="input" name="position" defaultValue={p?.position ?? ""} placeholder="e.g. Striker" /></div>
      <div><label className="label">Squad number</label><input className="input" name="squadNumber" type="number" min={1} max={99} defaultValue={p?.squadNumber ?? ""} /></div>
      <div><label className="label">Date of birth</label><input className="input" type="date" name="dateOfBirth" defaultValue={dv(p?.dateOfBirth ?? null)} /></div>
      <div><label className="label">Team</label>
        <select className="input" name="teamId" defaultValue={p?.teamId ?? ""}>
          <option value="">No team yet</option>
          {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>
      <div><label className="label">Photo</label><input className="input" type="file" name="photo" accept="image/*" /></div>
      <div className="sm:col-span-3"><label className="label">Biography</label><textarea className="input" name="biography" rows={2} defaultValue={p?.biography ?? ""} /></div>
      <div className="sm:col-span-3"><button className="btn-primary !px-4 !py-2 text-sm">{p ? "Save player" : "Add player"}</button></div>
    </form>
  );

  return (
    <div className="space-y-6">
      <PortalTitle title="Players" sub="The club's registered players. Approved applicants land here too — add details, teams and squad numbers." />
      <section className="card">
        <h2 className="mb-3 font-display font-bold">Add a player manually</h2>
        <PlayerForm />
      </section>
      {players.length === 0 ? (
        <p className="card text-sm text-gray-500">No players are registered yet. When you approve a player application it will appear here, or you can add a player manually above.</p>
      ) : (
        players.map((p) => (
          <section key={p.id} className="card space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {p.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.photoUrl} alt="" className="h-11 w-11 rounded-full object-cover" />
                ) : (
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-burgundy/10 font-display font-bold text-burgundy">{p.squadNumber ?? p.fullName.charAt(0)}</span>
                )}
                <div>
                  <p className="font-display font-bold">{p.fullName}</p>
                  <p className="text-xs text-gray-500">{p.position || "No position set"}{p.team ? ` · ${p.team.name}` : " · No team"}</p>
                </div>
              </div>
              <form action={deletePlayer}><input type="hidden" name="id" value={p.id} /><button className="text-sm font-semibold text-red-600">Remove player</button></form>
            </div>
            <details>
              <summary className="cursor-pointer text-sm font-semibold text-gray-600">Edit details</summary>
              <div className="mt-3"><PlayerForm p={p} /></div>
            </details>
            <form action={linkPlayerAccount} className="flex flex-wrap items-center gap-2 border-t pt-3">
              <input type="hidden" name="playerId" value={p.id} />
              <label className="text-sm font-medium text-gray-600">Player portal login:</label>
              <select className="input !w-64" name="userId" defaultValue={p.userId ?? ""}>
                <option value="">Not linked</option>
                {playerAccounts.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
              </select>
              <button className="btn-outline !px-3 !py-1.5 text-sm">Link account</button>
              <span className="text-xs text-gray-400">Create the login under Accounts &amp; roles first.</span>
            </form>
          </section>
        ))
      )}
    </div>
  );
}

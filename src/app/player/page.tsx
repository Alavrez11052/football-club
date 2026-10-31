import { PortalTitle } from "@/components/PortalShell";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { setAvailability, updateOwnProfile } from "@/lib/actions/player";

export const dynamic = "force-dynamic";

export default async function PlayerHomePage() {
  const user = (await getCurrentUser())!;
  const player = await db.player.findUnique({
    where: { userId: user.id },
    include: { team: true },
  });

  if (!player) {
    return (
      <div>
        <PortalTitle title={`Hello, ${user.name}`} />
        <p className="card text-sm text-gray-600">
          Your login account is not linked to a player profile yet. Once the club registers you as a player and links your
          account (ownership does this on the Players page), your profile, team, training schedule and match availability will
          appear here.
        </p>
      </div>
    );
  }

  const [sessions, fixtures] = await Promise.all([
    player.teamId
      ? db.trainingSession.findMany({ where: { teamId: player.teamId, date: { gte: new Date() } }, orderBy: { date: "asc" }, take: 10 })
      : Promise.resolve([]),
    player.teamId
      ? db.fixture.findMany({
          where: { teamId: player.teamId, status: "SCHEDULED", date: { gte: new Date() } },
          orderBy: { date: "asc" },
          take: 10,
          include: { availability: { where: { playerId: player.id } } },
        })
      : Promise.resolve([]),
  ]);
  const teammates = player.teamId
    ? await db.player.findMany({ where: { teamId: player.teamId }, orderBy: { fullName: "asc" } })
    : [];

  return (
    <div className="space-y-6">
      <PortalTitle title={player.fullName} sub={`${player.position || "Player"}${player.squadNumber ? ` · #${player.squadNumber}` : ""}${player.team ? ` · ${player.team.name}` : " · Not assigned to a team yet"}`} />
      <section className="card space-y-3">
        <h2 className="font-display font-bold">My profile</h2>
        {player.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={player.photoUrl} alt="" className="h-24 w-24 rounded-full object-cover" />
        ) : null}
        <form action={updateOwnProfile} className="space-y-2">
          <label className="label" htmlFor="biography">Biography (shown on the public squad page)</label>
          <textarea className="input" id="biography" name="biography" rows={3} defaultValue={player.biography} />
          <button className="btn-outline !px-3 !py-1.5 text-sm">Save biography</button>
        </form>
      </section>

      {player.team ? (
        <section className="card">
          <h2 className="font-display font-bold">My team — {player.team.name}</h2>
          <p className="mt-2 text-sm text-gray-600">
            {teammates.length} player{teammates.length === 1 ? "" : "s"}: {teammates.map((t) => t.fullName).join(", ")}
          </p>
        </section>
      ) : null}

      <section className="card">
        <h2 className="font-display font-bold">Upcoming training</h2>
        {sessions.length === 0 ? (
          <p className="mt-2 text-sm text-gray-500">No training sessions are scheduled yet.</p>
        ) : (
          <ul className="mt-2 space-y-1 text-sm">
            {sessions.map((s) => (
              <li key={s.id} className="flex justify-between"><span>{s.title}</span><span className="text-gray-500">{new Date(s.date).toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}{s.location ? ` · ${s.location}` : ""}</span></li>
            ))}
          </ul>
        )}
      </section>

      <section className="card">
        <h2 className="font-display font-bold">Match availability</h2>
        {fixtures.length === 0 ? (
          <p className="mt-2 text-sm text-gray-500">No upcoming matches for your team yet.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {fixtures.map((f) => {
              const current = f.availability[0]?.status;
              return (
                <li key={f.id} className="flex flex-wrap items-center justify-between gap-2 border-b pb-3 last:border-0">
                  <span className="text-sm"><strong>vs {f.opponent}</strong> · {new Date(f.date).toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                  <span className="flex gap-1">
                    {(["AVAILABLE", "MAYBE", "UNAVAILABLE"] as const).map((s) => (
                      <form key={s} action={setAvailability}>
                        <input type="hidden" name="fixtureId" value={f.id} />
                        <input type="hidden" name="status" value={s} />
                        <button className={`rounded-full px-3 py-1 text-xs font-bold ${current === s ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"}`}>
                          {s === "AVAILABLE" ? "Available" : s === "MAYBE" ? "Maybe" : "Unavailable"}
                        </button>
                      </form>
                    ))}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

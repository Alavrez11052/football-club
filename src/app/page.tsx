import Link from "next/link";
import PublicShell from "@/components/PublicShell";
import { Crest, FixtureCard, NewsCard, SocialLinks } from "@/components/ui";
import { db } from "@/lib/db";
import { clubDisplayName, getClub } from "@/lib/club";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const club = await getClub();
  const name = clubDisplayName(club.name);
  const founded = club.foundingDate ? new Date(club.foundingDate).getFullYear() : null;

  const [players, staff, upcoming, results, news, sponsors] = await Promise.all([
    db.player.findMany({ take: 4, orderBy: { fullName: "asc" } }),
    db.staffMember.findMany({ take: 1 }),
    db.fixture.findMany({ where: { status: "SCHEDULED", date: { gte: new Date() } }, orderBy: { date: "asc" }, take: 3 }),
    db.fixture.findMany({ where: { status: "COMPLETED" }, orderBy: { date: "desc" }, take: 3 }),
    db.newsPost.findMany({ where: { published: true }, orderBy: { createdAt: "desc" }, take: 3 }),
    club.showSponsors ? db.sponsor.findMany({ orderBy: { name: "asc" } }) : Promise.resolve([]),
  ]);
  const playerCount = await db.player.count();

  return (
    <PublicShell club={club}>
      {/* Hero */}
      <section className="relative overflow-hidden text-white" style={{ background: "var(--club-primary)" }}>
        {club.bannerUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={club.bannerUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
        ) : null}
        <div className="relative mx-auto max-w-6xl px-4 py-20 text-center md:py-28">
          <div className="flex justify-center"><Crest club={club} size={110} /></div>
          <h1 className="mt-6 font-display text-5xl font-extrabold tracking-tight md:text-6xl">{name}</h1>
          <p className="mt-2 text-sm font-semibold uppercase tracking-[0.3em] text-white/80">
            {founded ? `Founded ${founded}` : "A newly founded football club"}{club.location ? ` · ${club.location}` : ""}
          </p>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-white/85">
            {club.welcomeMessage || club.description ||
              "Welcome to the official home of our club. We are a newly founded football club building something from the ground up — and recruitment is now open."}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/apply" className="btn-accent">Apply to play</Link>
            <Link href="/about" className="rounded-md border border-white/40 px-5 py-2.5 font-semibold text-white hover:bg-white/10">About the club</Link>
          </div>
          <SocialLinks club={club} className="mt-8 justify-center" />
        </div>
        <div className="relative h-1.5" style={{ background: "var(--club-secondary)" }} />
      </section>

      {/* Mission & philosophy */}
      {(club.mission || club.philosophy) && (
        <section className="mx-auto grid max-w-6xl gap-6 px-4 py-14 md:grid-cols-2">
          {club.mission ? (
            <div className="card">
              <h2 className="font-display text-2xl font-bold" style={{ color: "var(--club-primary)" }}>Our mission</h2>
              <p className="mt-3 whitespace-pre-line leading-relaxed text-gray-700">{club.mission}</p>
            </div>
          ) : null}
          {club.philosophy ? (
            <div className="card">
              <h2 className="font-display text-2xl font-bold" style={{ color: "var(--club-primary)" }}>Our philosophy</h2>
              <p className="mt-3 whitespace-pre-line leading-relaxed text-gray-700">{club.philosophy}</p>
            </div>
          ) : null}
        </section>
      )}

      {/* Recruitment */}
      <section className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl p-7 text-white" style={{ background: "var(--club-primary)" }}>
            <h2 className="font-display text-2xl font-bold">Players wanted</h2>
            <p className="mt-2 text-white/85">
              {playerCount === 0
                ? "We are building our very first squad. Whatever your level, if you want to be part of this club from day one, we want to hear from you."
                : "Our squad is growing and we are still recruiting. Apply today to be considered for a place in the team."}
            </p>
            <Link href="/apply" className="btn-accent mt-5">Submit a player application</Link>
          </div>
          <div className="rounded-xl border-2 p-7" style={{ borderColor: "var(--club-secondary)" }}>
            <h2 className="font-display text-2xl font-bold text-gray-900">Coaches wanted</h2>
            <p className="mt-2 text-gray-700">
              {staff.length === 0
                ? "We are recruiting our first coaching team to lead the club on the pitch. Qualified or aspiring coaches are welcome to apply."
                : "We are expanding our coaching team. Apply to join the staff and help build this club."}
            </p>
            <Link href="/apply" className="btn-primary mt-5">Submit a coaching application</Link>
          </div>
        </div>
      </section>

      {/* Squad preview — only once players exist */}
      {players.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-10">
          <div className="mb-5 flex items-end justify-between">
            <h2 className="font-display text-3xl font-bold">First team squad</h2>
            <Link href="/squad" className="font-semibold" style={{ color: "var(--club-primary)" }}>View full squad →</Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {players.map((p) => (
              <div key={p.id} className="card text-center">
                {p.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.photoUrl} alt={p.fullName} className="mx-auto h-24 w-24 rounded-full object-cover" />
                ) : (
                  <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 font-display text-2xl font-bold text-gray-500">
                    {p.squadNumber ?? p.fullName.charAt(0)}
                  </div>
                )}
                <p className="mt-3 font-display font-bold">{p.fullName}</p>
                <p className="text-sm text-gray-500">{p.position || "Player"}{p.squadNumber ? ` · #${p.squadNumber}` : ""}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Fixtures & results — only once fixtures exist */}
      {(upcoming.length > 0 || results.length > 0) && (
        <section className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-2">
          {upcoming.length > 0 && (
            <div>
              <h2 className="mb-4 font-display text-2xl font-bold">Upcoming fixtures</h2>
              <div className="space-y-3">
                {upcoming.map((f) => <FixtureCard key={f.id} f={f} clubName={name} />)}
              </div>
            </div>
          )}
          {results.length > 0 && (
            <div>
              <h2 className="mb-4 font-display text-2xl font-bold">Latest results</h2>
              <div className="space-y-3">
                {results.map((f) => <FixtureCard key={f.id} f={f} clubName={name} />)}
              </div>
            </div>
          )}
        </section>
      )}

      {/* News — only once something is published */}
      {news.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-10">
          <div className="mb-5 flex items-end justify-between">
            <h2 className="font-display text-3xl font-bold">Club news</h2>
            <Link href="/news" className="font-semibold" style={{ color: "var(--club-primary)" }}>All news →</Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {news.map((n) => <NewsCard key={n.id} post={n} />)}
          </div>
        </section>
      )}

      {/* Sponsors — hidden until enabled AND sponsors exist */}
      {club.showSponsors && sponsors.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-10">
          <h2 className="mb-5 text-center font-display text-2xl font-bold">Our sponsors</h2>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {sponsors.map((s) => (
              <a key={s.id} href={s.website || "#"} target={s.website ? "_blank" : undefined} rel="noreferrer" className="flex flex-col items-center gap-2">
                {s.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.logoUrl} alt={s.name} className="h-14 object-contain" />
                ) : (
                  <span className="font-display text-xl font-bold text-gray-700">{s.name}</span>
                )}
                <span className="text-xs uppercase tracking-widest text-gray-400">{s.tier}</span>
              </a>
            ))}
          </div>
        </section>
      )}
    </PublicShell>
  );
}

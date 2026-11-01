import Link from "next/link";
import type { Club } from "@prisma/client";

export function Crest({ club, size = 44 }: { club: Club; size?: number }) {
  if (club.crestUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={club.crestUrl} alt={club.name || "Club crest"} width={size} height={size} className="object-contain" style={{ width: size, height: size }} />;
  }
  const initials = (club.abbreviation || club.name || "FC").slice(0, 3).toUpperCase();
  return (
    <div
      className="flex items-center justify-center rounded-full font-bold text-cream"
      style={{ width: size, height: size, background: "var(--club-primary)", fontSize: size * 0.32, border: "2px solid var(--club-secondary)" }}
      aria-label="Club crest placeholder"
    >
      {initials || "FC"}
    </div>
  );
}

export function EmptyState({ title, children, action }: { title: string; children?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="rounded-[2rem] border border-dashed border-[#CDBFA0] bg-paper px-6 py-12 text-center">
      <h3 className="font-display text-xl font-bold text-ink">{title}</h3>
      {children ? <div className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-ink/60">{children}</div> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function PageHero({ title, sub }: { title: string; sub?: string }) {
  return (
    <section className="text-cream" style={{ background: "var(--club-primary)" }}>
      <div className="mx-auto max-w-6xl px-4 py-14">
        <h1 className="font-display text-4xl font-extrabold tracking-tight md:text-5xl">{title}</h1>
        {sub ? <p className="mt-3 max-w-2xl text-cream/80">{sub}</p> : null}
      </div>
      <div className="h-1.5" style={{ background: "var(--club-secondary)" }} />
    </section>
  );
}

export function SocialLinks({ club, className = "" }: { club: Club; className?: string }) {
  const links = [
    { label: "X (Twitter)", href: club.socialX },
    { label: "Instagram", href: club.socialInstagram },
    { label: "Facebook", href: club.socialFacebook },
    { label: "YouTube", href: club.socialYoutube },
    { label: "TikTok", href: club.socialTiktok },
  ].filter((l) => l.href.trim() !== "");
  if (links.length === 0) return null;
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {links.map((l) => (
        <a key={l.label} href={l.href} target="_blank" rel="noreferrer" className="rounded-full border border-white/25 px-3 py-1 text-xs font-semibold text-white/90 hover:bg-white/10">
          {l.label}
        </a>
      ))}
    </div>
  );
}

export function FixtureCard({ f, clubName }: { f: { id: string; opponent: string; date: Date; venue: string; competition: string; status: string; homeScore: number | null; awayScore: number | null; isHome: boolean }; clubName: string }) {
  const when = new Date(f.date);
  const done = f.status === "COMPLETED";
  return (
    <div className="card flex items-center justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--club-primary)" }}>
          {f.competition || "Match"} · {f.isHome ? "Home" : "Away"}
        </p>
        <p className="mt-1 font-display text-lg font-bold">
          {clubName} {done ? `${f.homeScore ?? 0} – ${f.awayScore ?? 0}` : "vs"} {f.opponent}
        </p>
        <p className="text-sm text-ink/55">
          {when.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short", year: "numeric" })} ·{" "}
          {when.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
          {f.venue ? ` · ${f.venue}` : ""}
        </p>
      </div>
      <span className={`rounded-full px-3 py-1 text-xs font-bold ${done ? "bg-ink text-cream" : "bg-burgundy/10 text-burgundy"}`}>
        {done ? "Full time" : f.status === "SCHEDULED" ? "Upcoming" : f.status.toLowerCase()}
      </span>
    </div>
  );
}

export function NewsCard({ post }: { post: { id: string; title: string; body: string; category: string; createdAt: Date } }) {
  return (
    <Link href={`/news/${post.id}`} className="card block transition hover:shadow-md">
      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--club-primary)" }}>
        {post.category} · {new Date(post.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
      </p>
      <h3 className="mt-2 font-display text-xl font-bold text-ink">{post.title}</h3>
      <p className="mt-2 line-clamp-3 text-sm text-ink/65">{post.body}</p>
      <span className="mt-3 inline-block text-sm font-semibold" style={{ color: "var(--club-primary)" }}>Read more →</span>
    </Link>
  );
}

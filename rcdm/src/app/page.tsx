import Link from "next/link";
import PublicShell from "@/components/PublicShell";
import Reveal from "@/components/Reveal";
import { EmptyState, StatusChip } from "@/components/ui";
import { fmtDate, getAnnouncements, getOperations, getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [settings, operations, announcements] = await Promise.all([
    getSettings(),
    getOperations("public"),
    getAnnouncements("public"),
  ]);
  const active = operations.filter((o) => o.status === "Active");

  return (
    <PublicShell settings={settings}>
      <section className="relative overflow-hidden rounded-3xl bg-navy-900 px-7 py-12 text-white sm:px-10">
        <div className="hero-sheen" aria-hidden="true" />
        <p className="animate-fade-up relative text-sm font-semibold uppercase tracking-widest text-navy-300">{settings.shortName} · Ridgeway County</p>
        <h1 className="animate-fade-up anim-delay-1 relative mt-3 max-w-2xl text-3xl font-bold leading-tight sm:text-4xl">{settings.tagline}</h1>
        <p className="animate-fade-up anim-delay-2 relative mt-4 max-w-2xl text-navy-100">{settings.heroText}</p>
        <div className="animate-fade-up anim-delay-3 relative mt-7 flex flex-wrap gap-3">
          <Link href="/operations" className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-navy-900 hover:bg-navy-100">
            View operations
          </Link>
          <Link href="/contact" className="rounded-full border border-navy-400 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10">
            Contact us
          </Link>
        </div>
      </section>

      <Reveal>
        <section className="mt-10">
          <h2 className="section-title">Our mission</h2>
          <p className="mt-3 max-w-3xl leading-relaxed text-slate-600">{settings.mission}</p>
        </section>
      </Reveal>

      <section className="mt-12">
        <div className="flex items-end justify-between">
          <h2 className="section-title">Current operations</h2>
          <Link href="/operations" className="text-sm font-semibold text-navy-700 hover:underline">
            All operations →
          </Link>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {active.length === 0 && (
            <div className="sm:col-span-2">
              <EmptyState title="No active operations right now" body="When RCDM coordinates a response, public operations will be listed here." />
            </div>
          )}
          {active.slice(0, 4).map((op, i) => (
            <Reveal key={op.id} delay={i * 90}>
            <article className="card h-full">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-bold text-navy-900">{op.name}</h3>
                <StatusChip status={op.status} />
              </div>
              {op.location && <p className="mt-1 text-sm text-slate-500">{op.location}</p>}
              {op.description && <p className="mt-2 text-sm leading-relaxed text-slate-600">{op.description}</p>}
              <p className="mt-3 text-xs text-slate-400">
                {fmtDate(op.startsAt)}{op.endsAt ? ` – ${fmtDate(op.endsAt)}` : ""}
              </p>
            </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="section-title">Announcements</h2>
        <div className="mt-5 space-y-4">
          {announcements.length === 0 && (
            <EmptyState title="No public announcements yet" body="Public notices and preparedness updates will appear here." />
          )}
          {announcements.slice(0, 3).map((a, i) => (
            <Reveal key={a.id} delay={i * 90}>
            <article className="card">
              <h3 className="font-bold text-navy-900">{a.title}</h3>
              <p className="mt-1 text-xs text-slate-400">{fmtDate(a.createdAt)}</p>
              {a.body && <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600">{a.body}</p>}
            </article>
            </Reveal>
          ))}
        </div>
      </section>
    </PublicShell>
  );
}

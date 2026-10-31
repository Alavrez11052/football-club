import PublicShell from "@/components/PublicShell";
import { PageHero } from "@/components/ui";
import { db } from "@/lib/db";
import { getClub } from "@/lib/club";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const club = await getClub();
  const [milestones, owners] = await Promise.all([
    db.milestone.findMany({ where: { completed: true }, orderBy: { sortOrder: "asc" } }),
    db.staffMember.findMany({ where: { title: { contains: "Owner" } } }),
  ]);
  const founded = club.foundingDate ? new Date(club.foundingDate).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" }) : null;

  const Section = ({ title, body }: { title: string; body?: string | null }) =>
    body ? (
      <section>
        <h2 className="font-display text-2xl font-bold" style={{ color: "var(--club-primary)" }}>{title}</h2>
        <p className="mt-3 whitespace-pre-line leading-relaxed text-gray-700">{body}</p>
      </section>
    ) : null;

  return (
    <PublicShell club={club}>
      <PageHero title="About the club" sub={club.location ? `Based in ${club.location}${founded ? ` · Founded ${founded}` : ""}` : undefined} />
      <div className="mx-auto max-w-4xl space-y-10 px-4 py-12">
        {club.description ? (
          <p className="text-lg leading-relaxed text-gray-800">{club.description}</p>
        ) : (
          <p className="text-lg leading-relaxed text-gray-800">
            We are a newly founded, independent football club. This page will tell our story as the club grows — everything here is
            written by the club&apos;s ownership, and nothing is added before it is true.
          </p>
        )}
        <Section title="Our founding story" body={club.foundingStory} />
        <Section title="Mission" body={club.mission} />
        <Section title="Values" body={club.values} />
        <Section title="Club philosophy" body={club.philosophy} />
        <Section title="Where we are heading" body={club.ambitions} />
        {owners.length > 0 && (
          <section>
            <h2 className="font-display text-2xl font-bold" style={{ color: "var(--club-primary)" }}>Ownership</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {owners.map((o) => (
                <div key={o.id} className="card">
                  <p className="font-display font-bold">{o.name}</p>
                  <p className="text-sm text-gray-500">{o.title}</p>
                  {o.biography ? <p className="mt-2 text-sm text-gray-600">{o.biography}</p> : null}
                </div>
              ))}
            </div>
          </section>
        )}
        {milestones.length > 0 && (
          <section>
            <h2 className="font-display text-2xl font-bold" style={{ color: "var(--club-primary)" }}>The journey so far</h2>
            <ol className="mt-4 space-y-3 border-l-2 pl-5" style={{ borderColor: "var(--club-secondary)" }}>
              {milestones.map((m) => (
                <li key={m.key} className="relative">
                  <span className="absolute -left-[27px] top-1.5 h-3 w-3 rounded-full" style={{ background: "var(--club-primary)" }} />
                  <p className="font-semibold">{m.label}</p>
                  {m.completedAt ? <p className="text-xs text-gray-500">{new Date(m.completedAt).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}</p> : null}
                  {m.description ? <p className="text-sm text-gray-600">{m.description}</p> : null}
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>
    </PublicShell>
  );
}

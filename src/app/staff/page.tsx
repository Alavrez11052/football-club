import Link from "next/link";
import PublicShell from "@/components/PublicShell";
import { EmptyState, PageHero } from "@/components/ui";
import { db } from "@/lib/db";
import { getClub } from "@/lib/club";

export const dynamic = "force-dynamic";

export default async function StaffPage() {
  const club = await getClub();
  const staff = await db.staffMember.findMany({ orderBy: { name: "asc" } });
  return (
    <PublicShell club={club}>
      <PageHero title="Coaching staff" sub="The people leading the club on the pitch." />
      <div className="mx-auto max-w-6xl px-4 py-12">
        {staff.length === 0 ? (
          <EmptyState
            title="Coaching positions are open"
            action={<Link href="/apply" className="btn-primary">Apply to coach</Link>}
          >
            The club has not appointed its coaching staff yet — that is deliberate. We are recruiting the coaches who will build
            this team from its very first training session. If that could be you, apply today.
          </EmptyState>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {staff.map((s) => (
              <div key={s.id} className="card text-center">
                {s.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.photoUrl} alt={s.name} className="mx-auto h-28 w-28 rounded-full object-cover" />
                ) : (
                  <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-gray-100 font-display text-3xl font-bold text-gray-500">{s.name.charAt(0)}</div>
                )}
                <p className="mt-3 font-display text-lg font-bold">{s.name}</p>
                <p className="text-sm font-medium" style={{ color: "var(--club-primary)" }}>{s.title}</p>
                {s.biography ? <p className="mt-2 text-sm text-gray-600">{s.biography}</p> : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </PublicShell>
  );
}

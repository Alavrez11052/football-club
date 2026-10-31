import Link from "next/link";
import { redirect } from "next/navigation";
import { PortalTitle } from "@/components/PortalShell";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { setMilestone } from "@/lib/actions/club";

export const dynamic = "force-dynamic";

export default async function DevelopmentPage() {
  const user = (await getCurrentUser())!;
  if (user.role !== "OWNER") redirect("/portal");
  const milestones = await db.milestone.findMany({ orderBy: { sortOrder: "asc" }, include: { confirmedBy: true } });
  const doneCount = milestones.filter((m) => m.completed).length;
  return (
    <div className="space-y-6">
      <PortalTitle title="Club development" sub="The club's journey from founding to competitive football. A milestone only counts when you confirm it here — completed milestones appear on the public About page." />
      <p className="text-sm text-gray-500">{doneCount} of {milestones.length} milestones confirmed.</p>
      <div className="space-y-3">
        {milestones.map((m) => (
          <div key={m.key} className="card flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-display font-bold">{m.completed ? "✓ " : ""}{m.label}</p>
              <p className="text-sm text-gray-500">{m.description}</p>
              {m.completed && m.completedAt ? (
                <p className="text-xs text-gray-400">Confirmed {new Date(m.completedAt).toLocaleDateString()}{m.confirmedBy ? ` by ${m.confirmedBy.name}` : ""}</p>
              ) : null}
            </div>
            <form action={setMilestone}>
              <input type="hidden" name="key" value={m.key} />
              <input type="hidden" name="completed" value={m.completed ? "false" : "true"} />
              <button className={m.completed ? "btn-outline !px-4 !py-2 text-sm" : "btn-primary !px-4 !py-2 text-sm"}>
                {m.completed ? "Un-confirm" : "Confirm completed"}
              </button>
            </form>
          </div>
        ))}
      </div>
      <p className="text-sm text-gray-500">
        Progress is also visible publicly on the <Link className="font-semibold underline" href="/about">About page</Link> — only confirmed milestones are shown.
      </p>
    </div>
  );
}

import Link from "next/link";
import { EmptyState, StatusChip } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { fmtDate, getAnnouncements, getAssignments, getTraining } from "@/lib/data";
import { ROLE_LABEL } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();
  const [announcements, assignments, training] = await Promise.all([
    getAnnouncements("internal"),
    getAssignments(user.id),
    getTraining(user.id),
  ]);
  const activeAssignments = assignments.filter((a) => a.status !== "Completed");

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-navy-900">Welcome, {user.name.split(" ")[0]}</h1>
      <p className="mt-1 text-sm text-slate-500">
        {[user.rank, user.position].filter(Boolean).join(" · ") || "—"} · {ROLE_LABEL[user.role]} · {user.status}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="card">
          <p className="text-3xl font-bold text-navy-900">{activeAssignments.length}</p>
          <p className="mt-1 text-sm text-slate-500">Active assignments</p>
        </div>
        <div className="card">
          <p className="text-3xl font-bold text-navy-900">{training.filter((t) => t.status === "Completed").length}</p>
          <p className="mt-1 text-sm text-slate-500">Training courses completed</p>
        </div>
        <div className="card">
          <p className="text-3xl font-bold text-navy-900">{announcements.length}</p>
          <p className="mt-1 text-sm text-slate-500">Internal announcements</p>
        </div>
      </div>

      <h2 className="mt-10 text-lg font-bold text-navy-900">My assignments</h2>
      <div className="mt-4 space-y-3">
        {activeAssignments.length === 0 && (
          <EmptyState title="No active assignments" body="When you're assigned to an operation, it will show up here." />
        )}
        {activeAssignments.slice(0, 5).map((a) => (
          <div key={a.id} className="card flex flex-wrap items-center justify-between gap-3 !py-4">
            <div>
              <p className="font-semibold text-navy-900">{a.operation.name}</p>
              <p className="text-sm text-slate-500">
                {a.roleOnOp || "Team member"}{a.operation.location ? ` · ${a.operation.location}` : ""} · starts {fmtDate(a.operation.startsAt)}
              </p>
            </div>
            <StatusChip status={a.operation.status} />
          </div>
        ))}
      </div>
      <p className="mt-3 text-sm">
        <Link href="/portal/operations" className="font-semibold text-navy-700 hover:underline">View all operations & assignments →</Link>
      </p>

      <h2 className="mt-10 text-lg font-bold text-navy-900">Latest announcements</h2>
      <div className="mt-4 space-y-3">
        {announcements.length === 0 && <EmptyState title="No announcements yet" body="Internal announcements from leadership will appear here." />}
        {announcements.slice(0, 3).map((a) => (
          <article key={a.id} className="card !py-4">
            <p className="font-semibold text-navy-900">
              {a.pinned && <span className="chip mr-2">Pinned</span>}
              {a.title}
            </p>
            {a.body && <p className="mt-1 line-clamp-2 text-sm text-slate-600">{a.body}</p>}
            <p className="mt-1 text-xs text-slate-400">{fmtDate(a.createdAt)}{a.author ? ` · ${a.author.name}` : ""}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

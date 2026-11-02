import { EmptyState, StatusChip } from "@/components/ui";
import { updateAssignmentStatusAction } from "@/lib/actions";
import { requireUser } from "@/lib/auth";
import { fmtDate, getAssignments, getOperations } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function PortalOperationsPage() {
  const user = await requireUser();
  const [operations, myAssignments] = await Promise.all([getOperations(), getAssignments(user.id)]);
  const mineByOp = new Map(myAssignments.map((a) => [a.operationId, a]));

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-navy-900">Operations & Assignments</h1>
      <p className="mt-1 text-sm text-slate-500">Every operation, with your assignment status where you&apos;re deployed.</p>
      <div className="mt-6 space-y-4">
        {operations.length === 0 && <EmptyState title="No operations yet" body="Operations created by supervisors and administrators will appear here." />}
        {operations.map((op) => {
          const mine = mineByOp.get(op.id);
          return (
            <article key={op.id} className="card">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-bold text-navy-900">{op.name}</h2>
                <StatusChip status={op.status} />
              </div>
              <p className="mt-1 text-sm text-slate-500">
                {op.location || "—"} · {fmtDate(op.startsAt)}{op.endsAt ? ` – ${fmtDate(op.endsAt)}` : ""} · {op._count.assignments} assigned
                {op.visibility === "internal" ? " · Internal" : " · Public"}
              </p>
              {op.description && <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600">{op.description}</p>}
              {mine ? (
                <form action={updateAssignmentStatusAction} className="mt-4 flex flex-wrap items-center gap-2 rounded-xl bg-mist px-4 py-3">
                  <input type="hidden" name="id" value={mine.id} />
                  <span className="text-sm font-medium text-navy-900">
                    Your role: {mine.roleOnOp || "Team member"} — status: {mine.status}
                  </span>
                  <select name="status" defaultValue={mine.status} className="input ml-auto !w-auto">
                    <option>Assigned</option>
                    <option>Confirmed</option>
                    <option>Completed</option>
                  </select>
                  <button className="btn-primary !px-4 !py-2" type="submit">Update</button>
                </form>
              ) : (
                <p className="mt-3 text-sm text-slate-400">You are not assigned to this operation.</p>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}

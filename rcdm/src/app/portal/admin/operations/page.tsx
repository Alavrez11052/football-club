import { EmptyState, SavedBanner } from "@/components/ui";
import {
  assignEmployeeAction,
  deleteOperationAction,
  removeAssignmentAction,
  saveOperationAction,
} from "@/lib/actions";
import { requireRole } from "@/lib/auth";
import { fmtDate, getAssignments, getEmployees, getOperations } from "@/lib/data";

export const dynamic = "force-dynamic";

const toDateInput = (d: Date | null) => (d ? new Date(d).toISOString().slice(0, 10) : "");

export default async function AdminOperationsPage({ searchParams }: { searchParams: { saved?: string; error?: string } }) {
  await requireRole("SUPERVISOR", "ADMIN");
  const [operations, employees, assignments] = await Promise.all([getOperations(), getEmployees(), getAssignments()]);
  const byOp = new Map<string, typeof assignments>();
  for (const a of assignments) {
    const list = byOp.get(a.operationId) || [];
    list.push(a);
    byOp.set(a.operationId, list);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-navy-900">Manage Operations</h1>
      <p className="mt-1 text-sm text-slate-500">Create deployments, set whether they&apos;re public, and assign employees to them.</p>
      <SavedBanner show={searchParams.saved} error={searchParams.error} />

      <form action={saveOperationAction} className="card mt-6">
        <h2 className="font-bold text-navy-900">Create an operation</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div><label className="label">Name</label><input className="input" name="name" required placeholder="e.g. River Flooding Response" /></div>
          <div><label className="label">Location</label><input className="input" name="location" /></div>
          <div className="sm:col-span-2"><label className="label">Description</label><textarea className="input min-h-24" name="description" /></div>
          <div>
            <label className="label">Status</label>
            <select className="input" name="status" defaultValue="Planning">
              <option>Planning</option><option>Active</option><option>Completed</option><option>Cancelled</option>
            </select>
          </div>
          <div>
            <label className="label">Visibility</label>
            <select className="input" name="visibility" defaultValue="internal">
              <option value="internal">Internal only</option>
              <option value="public">Public (shown on website)</option>
            </select>
          </div>
          <div><label className="label">Starts</label><input className="input" name="startsAt" type="date" /></div>
          <div><label className="label">Ends</label><input className="input" name="endsAt" type="date" /></div>
        </div>
        <button className="btn-primary mt-5" type="submit">Create operation</button>
      </form>

      <div className="mt-8 space-y-5">
        {operations.length === 0 && <EmptyState title="No operations yet" body="Created operations will appear here with their assigned employees." />}
        {operations.map((op) => (
          <div key={op.id} className="card">
            <form action={saveOperationAction}>
              <input type="hidden" name="id" value={op.id} />
              <div className="grid gap-3 sm:grid-cols-2">
                <div><label className="label">Name</label><input className="input" name="name" defaultValue={op.name} required /></div>
                <div><label className="label">Location</label><input className="input" name="location" defaultValue={op.location} /></div>
                <div className="sm:col-span-2"><label className="label">Description</label><textarea className="input min-h-20" name="description" defaultValue={op.description} /></div>
                <div>
                  <label className="label">Status</label>
                  <select className="input" name="status" defaultValue={op.status}>
                    <option>Planning</option><option>Active</option><option>Completed</option><option>Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="label">Visibility</label>
                  <select className="input" name="visibility" defaultValue={op.visibility}>
                    <option value="internal">Internal only</option>
                    <option value="public">Public</option>
                  </select>
                </div>
                <div><label className="label">Starts</label><input className="input" name="startsAt" type="date" defaultValue={toDateInput(op.startsAt)} /></div>
                <div><label className="label">Ends</label><input className="input" name="endsAt" type="date" defaultValue={toDateInput(op.endsAt)} /></div>
                <div className="flex gap-3 sm:col-span-2">
                  <button className="btn-ghost !py-2" type="submit">Save operation</button>
                </div>
              </div>
            </form>
            <form action={deleteOperationAction} className="mt-1">
              <input type="hidden" name="id" value={op.id} />
              <button className="text-sm font-semibold text-red-600 hover:underline" type="submit">Delete operation</button>
            </form>

            <div className="mt-5 border-t border-slate-100 pt-4">
              <h3 className="text-sm font-bold text-navy-900">Assigned employees ({(byOp.get(op.id) || []).length})</h3>
              <div className="mt-2 space-y-2">
                {(byOp.get(op.id) || []).map((a) => (
                  <div key={a.id} className="flex flex-wrap items-center gap-2 rounded-xl bg-mist px-3.5 py-2.5 text-sm">
                    <span className="font-medium text-navy-900">{a.user.name}</span>
                    <span className="text-slate-500">{a.roleOnOp || "Team member"} · {a.status} · assigned {fmtDate(a.createdAt)}</span>
                    <form action={removeAssignmentAction} className="ml-auto">
                      <input type="hidden" name="id" value={a.id} />
                      <button className="font-semibold text-red-600 hover:underline" type="submit">Remove</button>
                    </form>
                  </div>
                ))}
                {(byOp.get(op.id) || []).length === 0 && <p className="text-sm text-slate-400">Nobody assigned yet.</p>}
              </div>
              <form action={assignEmployeeAction} className="mt-3 flex flex-wrap items-end gap-2">
                <input type="hidden" name="operationId" value={op.id} />
                <div className="min-w-48 flex-1">
                  <label className="label">Employee</label>
                  <select className="input" name="userId" required>
                    <option value="">Select…</option>
                    {employees.filter((e) => e.status !== "Inactive").map((e) => (
                      <option key={e.id} value={e.id}>{e.name}{e.rank ? ` — ${e.rank}` : ""}</option>
                    ))}
                  </select>
                </div>
                <div className="min-w-48 flex-1">
                  <label className="label">Role on this operation</label>
                  <input className="input" name="roleOnOp" placeholder="e.g. Team Lead, Driver, Comms" />
                </div>
                <button className="btn-primary !py-2.5" type="submit">Assign</button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

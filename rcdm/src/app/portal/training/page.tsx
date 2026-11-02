import { EmptyState, SavedBanner } from "@/components/ui";
import { deleteTrainingAction, saveTrainingAction } from "@/lib/actions";
import { canManage, requireUser } from "@/lib/auth";
import { fmtDate, getEmployees, getTraining } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function TrainingPage({ searchParams }: { searchParams: { saved?: string; error?: string } }) {
  const user = await requireUser();
  const manager = canManage(user.role);
  const [records, employees] = await Promise.all([
    getTraining(manager ? undefined : user.id),
    manager ? getEmployees() : Promise.resolve([]),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-navy-900">Training Records</h1>
      <p className="mt-1 text-sm text-slate-500">
        {manager ? "All employees' training records. Add or update records below." : "Your training and certifications on file."}
      </p>
      <SavedBanner show={searchParams.saved} error={searchParams.error} />

      <div className="mt-6 space-y-3">
        {records.length === 0 && <EmptyState title="No training records yet" body="Completed and in-progress courses will be listed here." />}
        {records.map((r) => (
          <div key={r.id} className="card flex flex-wrap items-center gap-3 !py-4">
            <div className="min-w-52">
              <p className="font-semibold text-navy-900">{r.course}</p>
              <p className="text-sm text-slate-500">
                {manager ? `${r.user.name} · ` : ""}Completed {fmtDate(r.completedOn)}{r.expiresOn ? ` · Expires ${fmtDate(r.expiresOn)}` : ""}
              </p>
              {r.notes && <p className="text-sm text-slate-400">{r.notes}</p>}
            </div>
            <span className="chip-gray ml-auto">{r.status}</span>
            {manager && (
              <form action={deleteTrainingAction}>
                <input type="hidden" name="id" value={r.id} />
                <button className="text-sm font-semibold text-red-600 hover:underline" type="submit">Delete</button>
              </form>
            )}
          </div>
        ))}
      </div>

      {manager && (
        <form action={saveTrainingAction} className="card mt-8">
          <h2 className="font-bold text-navy-900">Add a training record</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="userId">Employee</label>
              <select className="input" id="userId" name="userId" required>
                <option value="">Select…</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="course">Course</label>
              <input className="input" id="course" name="course" required placeholder="e.g. ICS-100, First Aid / CPR" />
            </div>
            <div>
              <label className="label" htmlFor="status">Status</label>
              <select className="input" id="status" name="status">
                <option>Completed</option>
                <option>In Progress</option>
                <option>Expired</option>
              </select>
            </div>
            <div>
              <label className="label" htmlFor="completedOn">Completed on</label>
              <input className="input" id="completedOn" name="completedOn" type="date" />
            </div>
            <div>
              <label className="label" htmlFor="expiresOn">Expires on</label>
              <input className="input" id="expiresOn" name="expiresOn" type="date" />
            </div>
            <div>
              <label className="label" htmlFor="notes">Notes</label>
              <input className="input" id="notes" name="notes" />
            </div>
          </div>
          <button className="btn-primary mt-5" type="submit">Add record</button>
        </form>
      )}
    </div>
  );
}

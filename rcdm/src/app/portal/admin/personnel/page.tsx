import { SavedBanner } from "@/components/ui";
import { createEmployeeAction, resetPasswordAction, updateEmployeeAction } from "@/lib/actions";
import { requireRole } from "@/lib/auth";
import { getEmployees } from "@/lib/data";
import { ROLE_LABEL } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function PersonnelPage({ searchParams }: { searchParams: { saved?: string; error?: string } }) {
  await requireRole("ADMIN");
  const employees = await getEmployees();

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-navy-900">Personnel & Accounts</h1>
      <p className="mt-1 text-sm text-slate-500">Create employee accounts and manage rank, position, role, and status. Accounts are admin-controlled — employees can&apos;t self-register.</p>
      <SavedBanner show={searchParams.saved} error={searchParams.error} />

      <form action={createEmployeeAction} className="card mt-6">
        <h2 className="font-bold text-navy-900">Create an employee account</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div><label className="label">Full name</label><input className="input" name="name" required /></div>
          <div><label className="label">Email</label><input className="input" name="email" type="email" required /></div>
          <div><label className="label">Temporary password (10+ characters)</label><input className="input" name="password" type="text" required minLength={10} /></div>
          <div>
            <label className="label">Role</label>
            <select className="input" name="role" defaultValue="EMPLOYEE">
              <option value="EMPLOYEE">Employee</option>
              <option value="SUPERVISOR">Supervisor</option>
              <option value="ADMIN">Administrator</option>
            </select>
          </div>
          <div><label className="label">Rank</label><input className="input" name="rank" placeholder="e.g. Captain, Specialist" /></div>
          <div><label className="label">Position</label><input className="input" name="position" placeholder="e.g. Operations Chief" /></div>
        </div>
        <button className="btn-primary mt-5" type="submit">Create account</button>
      </form>

      <div className="mt-8 space-y-4">
        {employees.map((e) => (
          <div key={e.id} className="card">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-bold text-navy-900">{e.name} <span className="ml-1 text-sm font-normal text-slate-500">{e.email}</span></p>
              <span className="chip-gray">{ROLE_LABEL[e.role]} · {e.status}</span>
            </div>
            <form action={updateEmployeeAction} className="mt-4 grid gap-3 sm:grid-cols-3">
              <input type="hidden" name="id" value={e.id} />
              <div><label className="label">Name</label><input className="input" name="name" defaultValue={e.name} required /></div>
              <div><label className="label">Rank</label><input className="input" name="rank" defaultValue={e.rank} /></div>
              <div><label className="label">Position</label><input className="input" name="position" defaultValue={e.position} /></div>
              <div><label className="label">Phone</label><input className="input" name="phone" defaultValue={e.phone} /></div>
              <div>
                <label className="label">Role</label>
                <select className="input" name="role" defaultValue={e.role}>
                  <option value="EMPLOYEE">Employee</option>
                  <option value="SUPERVISOR">Supervisor</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>
              <div>
                <label className="label">Status</label>
                <select className="input" name="status" defaultValue={e.status}>
                  <option>Active</option>
                  <option>On Leave</option>
                  <option>Inactive</option>
                </select>
              </div>
              <div className="sm:col-span-3">
                <button className="btn-ghost !py-2" type="submit">Save personnel record</button>
              </div>
            </form>
            <form action={resetPasswordAction} className="mt-3 flex flex-wrap items-end gap-2">
              <input type="hidden" name="id" value={e.id} />
              <div className="min-w-60 flex-1">
                <label className="label">Reset password</label>
                <input className="input" name="password" type="text" minLength={10} placeholder="New password (10+ characters)" />
              </div>
              <button className="btn-ghost !py-2" type="submit">Reset</button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}

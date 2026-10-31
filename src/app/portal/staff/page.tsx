import { PortalTitle } from "@/components/PortalShell";
import { db } from "@/lib/db";
import { deleteStaff, saveStaff } from "@/lib/actions/people";

export const dynamic = "force-dynamic";

export default async function StaffPage() {
  const [staff, coachAccounts] = await Promise.all([
    db.staffMember.findMany({ orderBy: { name: "asc" } }),
    db.user.findMany({ where: { role: { in: ["HEAD_COACH", "ASSISTANT_COACH", "ADMIN", "OWNER"] } }, orderBy: { name: "asc" } }),
  ]);

  const StaffForm = ({ s }: { s?: (typeof staff)[number] }) => (
    <form action={saveStaff} className="grid gap-3 sm:grid-cols-2">
      <input type="hidden" name="id" value={s?.id ?? ""} />
      <div><label className="label">Name</label><input className="input" name="name" defaultValue={s?.name ?? ""} required /></div>
      <div><label className="label">Title / role</label><input className="input" name="title" defaultValue={s?.title ?? ""} placeholder="e.g. Head Coach, Owner, Physiotherapist" /></div>
      <div><label className="label">Photo</label><input className="input" type="file" name="photo" accept="image/*" /></div>
      <div><label className="label">Linked login account (for coaches)</label>
        <select className="input" name="userId" defaultValue={s?.userId ?? ""}>
          <option value="">None</option>
          {coachAccounts.map((u) => <option key={u.id} value={u.id}>{u.name} — {u.role.replace(/_/g, " ")}</option>)}
        </select>
      </div>
      <div className="sm:col-span-2"><label className="label">Biography</label><textarea className="input" name="biography" rows={2} defaultValue={s?.biography ?? ""} /></div>
      <div className="sm:col-span-2"><button className="btn-primary !px-4 !py-2 text-sm">{s ? "Save" : "Appoint staff member"}</button></div>
    </form>
  );

  return (
    <div className="space-y-6">
      <PortalTitle title="Staff & coaches" sub="Coaching staff, club leadership and other appointments. Link a coach's login account so they can use the coaching portal." />
      <section className="card"><h2 className="mb-3 font-display font-bold">Appoint a staff member</h2><StaffForm /></section>
      {staff.length === 0 ? (
        <p className="card text-sm text-gray-500">No staff appointed yet. Approved coaching applications appear here, or appoint someone directly above.</p>
      ) : (
        staff.map((s) => (
          <section key={s.id} className="card space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-display font-bold">{s.name} <span className="ml-1 text-sm font-medium text-gray-500">{s.title}</span></p>
              <form action={deleteStaff}><input type="hidden" name="id" value={s.id} /><button className="text-sm font-semibold text-red-600">Remove</button></form>
            </div>
            <details><summary className="cursor-pointer text-sm font-semibold text-gray-600">Edit</summary><div className="mt-3"><StaffForm s={s} /></div></details>
          </section>
        ))
      )}
    </div>
  );
}

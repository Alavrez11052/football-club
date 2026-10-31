import { db } from "@/lib/db";
import { deleteUser, setUserRole } from "@/lib/actions/auth";

export const dynamic = "force-dynamic";
const ROLES = ["OWNER", "ADMIN", "HEAD_COACH", "ASSISTANT_COACH", "PLAYER"] as const;

export default async function AccountsList() {
  const users = await db.user.findMany({ orderBy: [{ role: "asc" }, { name: "asc" }] });
  return (
    <section className="card">
      <h2 className="mb-3 font-display font-bold">All accounts ({users.length})</h2>
      <ul className="divide-y">
        {users.map((u) => (
          <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
            <div>
              <p className="font-semibold">{u.name}</p>
              <p className="text-xs text-gray-500">{u.email} · joined {new Date(u.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="flex items-center gap-2">
              <form action={setUserRole} className="flex items-center gap-2">
                <input type="hidden" name="userId" value={u.id} />
                <select className="input !w-44 !py-1.5" name="role" defaultValue={u.role}>
                  {ROLES.map((r) => <option key={r} value={r}>{r.replace(/_/g, " ")}</option>)}
                </select>
                <button className="btn-outline !px-3 !py-1.5 text-xs">Set role</button>
              </form>
              <form action={deleteUser}>
                <input type="hidden" name="userId" value={u.id} />
                <button className="text-sm font-semibold text-red-600">Delete</button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

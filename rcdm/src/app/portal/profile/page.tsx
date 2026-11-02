import { SavedBanner } from "@/components/ui";
import { updateMyProfileAction } from "@/lib/actions";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ROLE_LABEL } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function MyProfilePage({ searchParams }: { searchParams: { saved?: string; error?: string } }) {
  const session = await requireUser();
  const me = await db.user.findUnique({ where: { id: session.id } });
  if (!me) return null;
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-navy-900">My Profile</h1>
      <p className="mt-1 text-sm text-slate-500">Rank, position and role are set by an administrator — contact one if they need changing.</p>
      <SavedBanner show={searchParams.saved} error={searchParams.error} />

      <div className="card mt-6">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div><dt className="label">Full name</dt><dd className="font-medium text-navy-900">{me.name}</dd></div>
          <div><dt className="label">Email</dt><dd className="font-medium text-navy-900">{me.email}</dd></div>
          <div><dt className="label">Rank</dt><dd className="font-medium text-navy-900">{me.rank || "—"}</dd></div>
          <div><dt className="label">Position</dt><dd className="font-medium text-navy-900">{me.position || "—"}</dd></div>
          <div><dt className="label">Role</dt><dd className="font-medium text-navy-900">{ROLE_LABEL[me.role]}</dd></div>
          <div><dt className="label">Status</dt><dd className="font-medium text-navy-900">{me.status}</dd></div>
        </dl>
      </div>

      <form action={updateMyProfileAction} className="card mt-5">
        <h2 className="font-bold text-navy-900">Contact details</h2>
        <div className="mt-4 grid gap-4">
          <div>
            <label className="label" htmlFor="phone">Phone</label>
            <input className="input" id="phone" name="phone" defaultValue={me.phone} />
          </div>
          <div>
            <label className="label" htmlFor="bio">Bio / notes</label>
            <textarea className="input min-h-24" id="bio" name="bio" defaultValue={me.bio} />
          </div>
        </div>
        <button className="btn-primary mt-5" type="submit">Save changes</button>
      </form>
    </div>
  );
}

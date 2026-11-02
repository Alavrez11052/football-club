import Link from "next/link";
import { redirect } from "next/navigation";
import { claimAdminAction } from "@/lib/actions";
import { getSettings, hasAnyUser } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function SetupPage({ searchParams }: { searchParams: { error?: string } }) {
  const [settings, anyUser] = await Promise.all([getSettings(), hasAnyUser()]);
  if (anyUser) redirect("/login");
  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-950 px-4 py-10">
      <div className="animate-fade-up w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <p className="text-sm font-bold uppercase tracking-widest text-navy-600">First-run setup</p>
        <h1 className="mt-2 text-2xl font-bold text-navy-900">Create the administrator account</h1>
        <p className="mt-1 text-sm text-slate-500">
          This is a one-time step for {settings.orgName}. After this, all employee accounts are created from the admin portal.
        </p>
        {searchParams.error && (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            Check the details — password needs at least 10 characters.
          </p>
        )}
        <form action={claimAdminAction} className="mt-6 space-y-4">
          <div>
            <label className="label" htmlFor="name">Your full name</label>
            <input className="input" id="name" name="name" required />
          </div>
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input className="input" id="email" name="email" type="email" required />
          </div>
          <div>
            <label className="label" htmlFor="password">Password (10+ characters)</label>
            <input className="input" id="password" name="password" type="password" required minLength={10} />
          </div>
          <button className="btn-primary w-full" type="submit">Create administrator & log in</button>
        </form>
        <p className="mt-4 text-center text-sm">
          <Link href="/" className="text-slate-500 hover:underline">← Back to the public site</Link>
        </p>
      </div>
    </div>
  );
}

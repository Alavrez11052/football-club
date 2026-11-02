import Link from "next/link";
import { loginAction } from "@/lib/actions";
import { getSettings, hasAnyUser } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  const [settings, anyUser] = await Promise.all([getSettings(), hasAnyUser()]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-950 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <p className="text-sm font-bold uppercase tracking-widest text-navy-600">{settings.shortName}</p>
        <h1 className="mt-2 text-2xl font-bold text-navy-900">Employee login</h1>
        <p className="mt-1 text-sm text-slate-500">
          Accounts are created by an administrator — there is no public sign-up.
        </p>
        {searchParams.error && (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            Email or password didn&apos;t match, or the account is inactive.
          </p>
        )}
        <form action={loginAction} className="mt-6 space-y-4">
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input className="input" id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input className="input" id="password" name="password" type="password" required autoComplete="current-password" />
          </div>
          <button className="btn-primary w-full" type="submit">Log in</button>
        </form>
        {!anyUser && (
          <p className="mt-5 text-center text-sm text-slate-500">
            First time here?{" "}
            <Link href="/setup" className="font-semibold text-navy-700 hover:underline">
              Set up the first administrator account
            </Link>
          </p>
        )}
        <p className="mt-4 text-center text-sm">
          <Link href="/" className="text-slate-500 hover:underline">← Back to the public site</Link>
        </p>
      </div>
    </div>
  );
}

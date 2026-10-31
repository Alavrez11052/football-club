"use client";

import { useFormState } from "react-dom";
import { PortalTitle } from "@/components/PortalShell";
import type { FormState } from "@/lib/actions/public";
// This page mixes a client form with server data, so data is loaded via a child server component pattern:
// the accounts list is rendered by AccountsList (server) imported below.
import AccountsList from "./AccountsList";
import { createAccount } from "@/lib/actions/auth";

const initial: FormState = {};
const ROLES = [
  { value: "ADMIN", label: "Administrator — applications, players, staff, news" },
  { value: "HEAD_COACH", label: "Head Coach — manage assigned teams" },
  { value: "ASSISTANT_COACH", label: "Assistant Coach — assist on assigned teams" },
  { value: "PLAYER", label: "Player — own profile, team info, availability" },
  { value: "OWNER", label: "Owner — complete control (use sparingly)" },
];

export default function AccountsPage() {
  const [state, action] = useFormState(createAccount, initial);
  return (
    <div className="space-y-6">
      <PortalTitle title="Accounts & roles" sub="Create logins for administrators, coaches and players, and control exactly what each role can do." />
      <section className="card">
        <h2 className="mb-3 font-display font-bold">Create an account</h2>
        <form action={action} className="grid gap-3 sm:grid-cols-2">
          <div><label className="label">Full name</label><input className="input" name="name" required /></div>
          <div><label className="label">Email</label><input className="input" name="email" type="email" required /></div>
          <div><label className="label">Temporary password (10+ characters)</label><input className="input" name="password" type="password" required minLength={10} /></div>
          <div><label className="label">Role</label>
            <select className="input" name="role">{ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}</select>
          </div>
          <div className="sm:col-span-2">
            {state.error ? <p className="mb-2 rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{state.error}</p> : null}
            {state.ok ? <p className="mb-2 rounded-md bg-green-50 px-3 py-2 text-sm font-medium text-green-700">Account created. It appears in the list below.</p> : null}
            <button className="btn-primary !px-4 !py-2 text-sm">Create account</button>
          </div>
        </form>
        <div className="mt-4 rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
          <p className="font-semibold text-gray-800">How permissions work</p>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            <li><strong>Owner</strong> — everything, including branding, setup, milestones and accounts.</li>
            <li><strong>Administrator</strong> — applications, players, staff, teams, fixtures, news and inquiries.</li>
            <li><strong>Coaches</strong> — only the teams you assign them to (Teams page), nothing else.</li>
            <li><strong>Players</strong> — only their own profile once linked on the Players page.</li>
          </ul>
          <p className="mt-2">All checks are enforced on the server, not just hidden in the interface.</p>
        </div>
      </section>
      <AccountsList />
    </div>
  );
}

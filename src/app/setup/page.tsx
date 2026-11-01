"use client";

import { useFormState } from "react-dom";
import { claimOwnership } from "@/lib/actions/auth";
import type { FormState } from "@/lib/actions/public";

const initial: FormState = {};

export default function SetupClaimPage() {
  const [state, action] = useFormState(claimOwnership, initial);
  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-4">
      <form action={action} className="card w-full max-w-md space-y-4">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold">Found your club</h1>
          <p className="mt-1 text-sm text-gray-500">
            This installation has no accounts yet. Create the founding owner account to take control of the platform.
          </p>
        </div>
        <div>
          <label className="label" htmlFor="name">Your name</label>
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
        {state.error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{state.error}</p> : null}
        <button type="submit" className="btn-primary w-full">Claim ownership &amp; start setup</button>
      </form>
    </main>
  );
}

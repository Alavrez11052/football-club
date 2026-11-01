"use client";

import { useFormState } from "react-dom";
import { login } from "@/lib/actions/auth";
import type { FormState } from "@/lib/actions/public";

const initial: FormState = {};

export default function LoginPage() {
  const [state, action] = useFormState(login, initial);
  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-4">
      <form action={action} className="card w-full max-w-sm space-y-4">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold">Club sign in</h1>
          <p className="mt-1 text-sm text-gray-500">Ownership, staff, coaches and players.</p>
        </div>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input className="input" id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input className="input" id="password" name="password" type="password" required autoComplete="current-password" />
        </div>
        {state.error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{state.error}</p> : null}
        <button type="submit" className="btn-primary w-full">Sign in</button>
      </form>
    </main>
  );
}

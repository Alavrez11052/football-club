import Link from "next/link";
import type { Role } from "@prisma/client";
import { logout } from "@/lib/actions/auth";
import { Crest } from "./ui";
import type { Club } from "@prisma/client";

export type NavItem = { href: string; label: string; ownerOnly?: boolean };

export default function PortalShell({
  club, userName, role, area, nav, children,
}: {
  club: Club; userName: string; role: Role; area: string; nav: NavItem[]; children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col bg-gray-900 text-white md:flex">
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
          <Crest club={club} size={36} />
          <div className="leading-tight">
            <p className="font-display text-sm font-bold">{club.name || "Football Club"}</p>
            <p className="text-xs text-white/60">{area}</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {nav.filter((n) => !n.ownerOnly || role === "OWNER").map((n) => (
            <Link key={n.href} href={n.href} className="block rounded-md px-3 py-2 text-sm font-medium text-white/85 hover:bg-white/10">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-white/10 px-5 py-4 text-sm">
          <p className="font-semibold">{userName}</p>
          <p className="text-xs text-white/60">{role.replace(/_/g, " ")}</p>
          <div className="mt-3 flex gap-2">
            <Link href="/" className="rounded-md bg-white/10 px-3 py-1.5 text-xs font-semibold hover:bg-white/20">View website</Link>
            <form action={logout}><button className="rounded-md bg-white/10 px-3 py-1.5 text-xs font-semibold hover:bg-white/20">Sign out</button></form>
          </div>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between bg-gray-900 px-4 py-3 text-white md:hidden">
          <span className="font-display text-sm font-bold">{club.name || "Football Club"} · {area}</span>
          <form action={logout}><button className="text-xs font-semibold underline">Sign out</button></form>
        </div>
        <nav className="flex gap-1 overflow-x-auto bg-white px-3 py-2 shadow-sm md:hidden">
          {nav.filter((n) => !n.ownerOnly || role === "OWNER").map((n) => (
            <Link key={n.href} href={n.href} className="whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-100">{n.label}</Link>
          ))}
        </nav>
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
      </div>
    </div>
  );
}

export function PortalTitle({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-gray-900">{title}</h1>
        {sub ? <p className="mt-1 text-sm text-gray-500">{sub}</p> : null}
      </div>
      {action}
    </div>
  );
}

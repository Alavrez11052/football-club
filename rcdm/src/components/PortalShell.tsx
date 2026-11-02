import Link from "next/link";
import { logoutAction } from "@/lib/actions";
import { canManage, type SessionUser } from "@/lib/auth";
import { ROLE_LABEL } from "@/lib/types";

const NAV = [
  { href: "/portal", label: "Dashboard" },
  { href: "/portal/profile", label: "My Profile" },
  { href: "/portal/directory", label: "Employee Directory" },
  { href: "/portal/announcements", label: "Announcements" },
  { href: "/portal/operations", label: "Operations & Assignments" },
  { href: "/portal/training", label: "Training Records" },
];

const ADMIN_NAV = [
  { href: "/portal/admin/personnel", label: "Personnel & Accounts" },
  { href: "/portal/admin/announcements", label: "Manage Announcements" },
  { href: "/portal/admin/operations", label: "Manage Operations" },
  { href: "/portal/admin/settings", label: "Website Settings" },
];

export default function PortalShell({
  user,
  orgName,
  shortName,
  children,
}: {
  user: SessionUser;
  orgName: string;
  shortName: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <aside className="w-full shrink-0 bg-navy-950 text-white lg:min-h-screen lg:w-72">
        <div className="p-5">
          <Link href="/portal" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sm font-black text-navy-900">
              {shortName.slice(0, 4)}
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-bold">{orgName}</span>
              <span className="block text-xs text-navy-300">Employee Portal</span>
            </span>
          </Link>
        </div>
        <nav className="space-y-1 px-3 pb-3">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="block rounded-xl px-3.5 py-2.5 text-sm font-medium text-navy-100 transition-all duration-200 hover:translate-x-0.5 hover:bg-white/10 hover:text-white">
              {item.label}
            </Link>
          ))}
          {canManage(user.role) && (
            <>
              <p className="px-3.5 pb-1 pt-5 text-xs font-bold uppercase tracking-widest text-navy-400">
                {user.role === "ADMIN" ? "Administration" : "Management"}
              </p>
              {(user.role === "ADMIN" ? ADMIN_NAV : ADMIN_NAV.filter((i) => i.href !== "/portal/admin/personnel" && i.href !== "/portal/admin/settings")).map((item) => (
                <Link key={item.href} href={item.href} className="block rounded-xl px-3.5 py-2.5 text-sm font-medium text-navy-100 transition-all duration-200 hover:translate-x-0.5 hover:bg-white/10 hover:text-white">
                  {item.label}
                </Link>
              ))}
            </>
          )}
        </nav>
        <div className="mt-auto p-5">
          <div className="rounded-2xl bg-white/5 p-4">
            <p className="text-sm font-bold">{user.name}</p>
            <p className="mt-0.5 text-xs text-navy-300">
              {[user.rank, user.position].filter(Boolean).join(" · ") || ROLE_LABEL[user.role]}
            </p>
            <p className="mt-0.5 text-xs text-navy-400">{ROLE_LABEL[user.role]}</p>
            <div className="mt-3 flex gap-2">
              <Link href="/" className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold hover:bg-white/20">Public site</Link>
              <form action={logoutAction}>
                <button className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-navy-900 hover:bg-navy-100" type="submit">Log out</button>
              </form>
            </div>
          </div>
        </div>
      </aside>
      <main className="animate-fade-in mx-auto w-full max-w-5xl flex-1 px-4 py-8 lg:px-8">{children}</main>
    </div>
  );
}

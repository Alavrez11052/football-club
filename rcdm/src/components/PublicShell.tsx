import Link from "next/link";
import type { SiteSettingsData } from "@/lib/types";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/operations", label: "Operations" },
  { href: "/contact", label: "Contact" },
];

export default function PublicShell({
  settings,
  children,
}: {
  settings: SiteSettingsData;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-navy-800 bg-navy-900/95 text-white backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3.5">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sm font-black tracking-tight text-navy-900">
              {settings.shortName.slice(0, 4)}
            </span>
            <span className="leading-tight">
              <span className="block text-[15px] font-bold">{settings.orgName}</span>
              <span className="block text-xs text-navy-200">{settings.tagline}</span>
            </span>
          </Link>
          <nav className="ml-auto flex flex-wrap items-center gap-1.5">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="nav-link rounded-full px-3.5 py-2 text-sm font-medium text-navy-100 transition hover:bg-white/10 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
            <Link href="/login" className="ml-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-navy-900 transition hover:bg-navy-100">
              Employee Login
            </Link>
          </nav>
        </div>
      </header>

      <main className="animate-fade-in mx-auto w-full max-w-6xl flex-1 px-4 py-10">{children}</main>

      <footer className="bg-navy-950 text-navy-200">
        <div className="mx-auto flex max-w-6xl flex-wrap gap-x-10 gap-y-4 px-4 py-8 text-sm">
          <div>
            <p className="font-bold text-white">{settings.orgName}</p>
            <p className="mt-1 max-w-sm text-navy-300">{settings.footerNote}</p>
          </div>
          <div className="ml-auto space-y-1">
            {settings.address && <p>{settings.address}</p>}
            {settings.contactEmail && <p>{settings.contactEmail}</p>}
            {settings.contactPhone && <p>{settings.contactPhone}</p>}
          </div>
        </div>
      </footer>
    </div>
  );
}

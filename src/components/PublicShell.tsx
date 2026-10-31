import Link from "next/link";
import type { Club } from "@prisma/client";
import { Crest, SocialLinks } from "./ui";
import { clubDisplayName } from "@/lib/club";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/squad", label: "Squad" },
  { href: "/staff", label: "Staff" },
  { href: "/fixtures", label: "Fixtures" },
  { href: "/news", label: "News" },
  { href: "/contact", label: "Contact" },
];

export default function PublicShell({ club, children }: { club: Club; children: React.ReactNode }) {
  const name = clubDisplayName(club.name);
  const founded = club.foundingDate ? new Date(club.foundingDate).getFullYear() : null;
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" className="flex items-center gap-3">
            <Crest club={club} size={44} />
            <span className="leading-tight">
              <span className="block font-display text-lg font-extrabold tracking-tight text-gray-900">{name}</span>
              <span className="block text-xs font-medium uppercase tracking-widest text-gray-500">
                {club.location || "Football Club"}{founded ? ` · Est. ${founded}` : ""}
              </span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="rounded-md px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100">
                {n.label}
              </Link>
            ))}
            <Link href="/apply" className="btn-accent ml-2 !px-4 !py-2 text-sm">Join the Club</Link>
            <Link href="/login" className="ml-1 rounded-md px-3 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-100">Sign in</Link>
          </nav>
          <Link href="/apply" className="btn-accent !px-4 !py-2 text-sm md:hidden">Join</Link>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-2 md:hidden">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-100">
              {n.label}
            </Link>
          ))}
          <Link href="/login" className="whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-semibold text-gray-500">Sign in</Link>
        </nav>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-16 text-white" style={{ background: "var(--club-primary)" }}>
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-3">
              <Crest club={club} size={40} />
              <p className="font-display text-lg font-bold">{name}</p>
            </div>
            {club.description ? <p className="mt-3 text-sm text-white/75">{club.description}</p> : null}
            <SocialLinks club={club} className="mt-4" />
          </div>
          <div>
            <h4 className="font-display font-bold">Explore</h4>
            <ul className="mt-3 space-y-2 text-sm text-white/80">
              {NAV.map((n) => (
                <li key={n.href}><Link className="hover:text-white" href={n.href}>{n.label}</Link></li>
              ))}
              <li><Link className="hover:text-white" href="/apply">Player &amp; coach applications</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-bold">Contact</h4>
            <ul className="mt-3 space-y-2 text-sm text-white/80">
              {club.location ? <li>{club.location}</li> : null}
              {club.address ? <li>{club.address}</li> : null}
              {club.contactEmail ? <li><a className="hover:text-white" href={`mailto:${club.contactEmail}`}>{club.contactEmail}</a></li> : null}
              {club.contactPhone ? <li>{club.contactPhone}</li> : null}
              {!club.location && !club.contactEmail ? <li>Contact details will be published soon.</li> : null}
            </ul>
          </div>
        </div>
        <div className="border-t border-white/15 py-4 text-center text-xs text-white/60">
          © {new Date().getFullYear()} {name}{founded ? ` · Founded ${founded}` : ""}
        </div>
      </footer>
    </div>
  );
}

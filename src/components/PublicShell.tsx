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
      <header className="sticky top-0 z-40 bg-cream/90 shadow-[0_1px_0_rgba(23,23,23,0.07)] backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" className="flex items-center gap-3">
            <Crest club={club} size={44} />
            <span className="leading-tight">
              <span className="block font-display text-lg font-extrabold tracking-tight text-ink">{name}</span>
              <span className="block text-xs font-medium uppercase tracking-widest text-ink/50">
                {club.location || "Football Club"}{founded ? ` · Est. ${founded}` : ""}
              </span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="rounded-full px-3.5 py-2 text-sm font-semibold text-ink/75 hover:bg-ink/5">
                {n.label}
              </Link>
            ))}
            <Link href="/apply" className="btn-accent ml-2 !px-5 !py-2 text-sm">Join the Club</Link>
            <Link href="/login" className="ml-1 rounded-full px-3.5 py-2 text-sm font-semibold text-ink/55 hover:bg-ink/5">Sign in</Link>
          </nav>
          <Link href="/apply" className="btn-accent !px-4 !py-2 text-sm md:hidden">Join</Link>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-2 md:hidden">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-semibold text-ink/75 hover:bg-ink/5">
              {n.label}
            </Link>
          ))}
          <Link href="/login" className="whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-semibold text-ink/55">Sign in</Link>
        </nav>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-16 bg-ink text-cream">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-3">
              <Crest club={club} size={40} />
              <p className="font-display text-lg font-bold">{name}</p>
            </div>
            {club.description ? <p className="mt-3 text-sm text-cream/70">{club.description}</p> : null}
            <SocialLinks club={club} className="mt-4" />
          </div>
          <div>
            <h4 className="font-display font-bold">Explore</h4>
            <ul className="mt-3 space-y-2 text-sm text-cream/75">
              {NAV.map((n) => (
                <li key={n.href}><Link className="hover:text-cream" href={n.href}>{n.label}</Link></li>
              ))}
              <li><Link className="hover:text-cream" href="/apply">Player &amp; coach applications</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-bold">Contact</h4>
            <ul className="mt-3 space-y-2 text-sm text-cream/75">
              {club.location ? <li>{club.location}</li> : null}
              {club.address ? <li>{club.address}</li> : null}
              {club.contactEmail ? <li><a className="hover:text-cream" href={`mailto:${club.contactEmail}`}>{club.contactEmail}</a></li> : null}
              {club.contactPhone ? <li>{club.contactPhone}</li> : null}
              {!club.location && !club.contactEmail ? <li>Contact details will be published soon.</li> : null}
            </ul>
          </div>
        </div>
        <div className="border-t border-cream/15 py-4 text-center text-xs text-cream/55">
          © {new Date().getFullYear()} {name}{founded ? ` · Founded ${founded}` : ""}
        </div>
      </footer>
    </div>
  );
}

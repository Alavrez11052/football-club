# Football Club Website & Management System

A complete public website and private management platform for a **newly founded, independent football club**. The platform starts empty — no fabricated players, results, trophies, sponsors, or history — and grows with the club: founding setup, recruitment, squad and staff management, fixtures, news, milestones, and day-to-day coaching tools.

Built with **Next.js 14 (App Router) · TypeScript · Tailwind CSS · PostgreSQL · Prisma ORM**.

---

## What is included

### Public website
- **Homepage** — crest, club name, founding year, welcome message, mission & philosophy, player and coaching recruitment announcements, contact details and social links. The sponsors section is hidden until a sponsor is added; fixtures, results, squad and news sections only appear once real content exists (never empty statistics or invented data).
- **About** — club introduction, founding story, mission, values, philosophy, ambitions, location, published ownership, and a milestone timeline that fills in as the club confirms milestones.
- **Squad** — honest recruiting empty state until players are registered, then automatic player profiles (photo, name, position, squad number, biography).
- **Coaching staff** — recruitment message until staff are appointed, then staff profiles.
- **Fixtures & results** — empty state until fixtures are created, then fixtures with opponent, date/kickoff, venue, competition, status and final scores.
- **News & announcements** — founding announcements, recruitment notices, signings, appointments, match reports.
- **Contact & recruitment** — separate working forms for player applications, coaching applications, general inquiries and sponsorship inquiries. All submissions are stored in the management portal.

### Ownership portal (`/portal`)
- **Setup wizard** — club name, abbreviation, crest upload, primary/secondary colors, founding date, location, description, mission, contact email, social accounts. Every step is optional and can be revisited later; the dashboard tracks setup progress.
- **Dashboard** — real counts of registered players and staff, pending player/staff applications, upcoming fixtures, recent administrative activity (audit log), and setup progress. Helpful empty states instead of fabricated numbers.
- **Website & branding (CMS)** — change the club name, crest, colors, font, homepage banner, and all homepage/About text; manage sponsors and social links. No code editing required; changes go live immediately and can be previewed via “View website”.
- **Applications** — review player and coaching applications; approve (converts to a real player/staff record), reject, or request more info. Approving is the *only* way an applicant becomes a player — applications never auto-register. Under-18 applicants require guardian name, email and consent (safeguarding), which is enforced server-side and flagged in the review screen.
- **Players** — add/edit/remove players, squad numbers, positions, teams, photos, biographies; link a player to a player-portal login account.
- **Staff & coaches** — appoint staff, set titles/bios/photos, link coaching login accounts.
- **Teams** — create teams, assign coaches to teams.
- **Fixtures** — create fixtures, record results.
- **News** — write/publish/unpublish/delete announcements.
- **Inquiries** — general and sponsorship messages from the contact page, with handled/reopen.
- **Club development** — milestone tracker (founded → ownership → first coach → first player → first team → first training → first friendly → league application → league affiliation). Milestones only complete when the owner explicitly confirms them; confirmed ones appear on the public About page.
- **Accounts & roles** — owner-only account creation and role management.

### Coaching portal (`/coach`)
Coaches only see teams they are assigned to (enforced on the server, not just hidden in the UI):
- Assigned teams and rosters, player availability at a glance
- Training sessions: create/schedule, record attendance per player
- Player development: private coaching notes (never visible to players) and 1–10 evaluations
- Matchday: matchday squad selection, formations/lineups, result submission, match reports

### Player portal (`/player`)
- Own profile (photo, position, squad number, editable biography)
- Team information and teammates
- Upcoming training schedule
- Fixture availability (Available / Maybe / Unavailable), visible to coaches on the matchday screen

### Roles & permissions (enforced in server actions on every request)
| Role | Access |
|---|---|
| **Owner** | Complete control: setup, branding/CMS, milestones, accounts & roles, everything below |
| **Administrator** | Applications, players, staff, teams, fixtures, news, inquiries |
| **Head Coach** | Assigned teams: rosters, training, attendance, notes, evaluations, matchday |
| **Assistant Coach** | Same coaching tools, for assigned teams |
| **Player** | Own profile, team info, training schedule, availability |

Other security properties: passwords hashed with bcrypt (cost 12), JWT session cookie (httpOnly, SameSite=Lax, Secure in production), Zod validation on public forms, validated image uploads (type + 5 MB cap, stored under `public/uploads`), an audit log of administrative actions, and no sensitive data exposed to the frontend.

---

## Getting started

### Prerequisites
- Node.js 20+ and npm
- PostgreSQL 14+ — or Docker (a `docker-compose.yml` is included)

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
```
Edit `.env`:
- `DATABASE_URL` — your PostgreSQL connection string
- `AUTH_SECRET` — a long random string (used to sign session tokens)
- `OWNER_EMAIL` / `OWNER_PASSWORD` / `OWNER_NAME` — optional; used by the seed to create the first owner account

### 3. Start the database (skip if you already run PostgreSQL)
```bash
docker compose up -d db
```

### 4. Create the schema and seed the founding data
```bash
npx prisma migrate dev --name init   # creates tables via a migration
npm run db:seed                        # creates the club record + milestone list (+ owner, if configured)
```
The seed deliberately creates **no** players, staff, fixtures, sponsors or news — the club starts genuinely empty.

### 5. Run it
```bash
npm run dev        # development → http://localhost:3000
# or
npm run build && npm run start   # production
```

### 6. First sign-in
- If you set `OWNER_*` in `.env` before seeding, sign in at `/login` with those credentials.
- If not, visit **`/setup`** — while zero accounts exist, the first visitor can claim the owner account there. Do this immediately on a fresh deployment.
- After signing in you are taken to the **setup wizard** (`/portal/setup`) to establish the club's identity.

---

## Day-to-day workflows

- **Recruitment:** public applications arrive in *Portal → Applications*. Approve a player application to create their player record, then set team/squad number under *Portal → Players*.
- **Coaches:** create a coach login under *Accounts & roles*, appoint/link them under *Staff & coaches*, and assign them to a team under *Teams*. They then get the coaching portal.
- **Players' logins:** create a PLAYER account under *Accounts & roles*, then link it to the player record under *Players*.
- **Publishing:** fixtures, results, squad changes and news appear on the public site automatically once saved/published. The sponsors section only appears when *Website & branding → Show sponsors* is on **and** at least one sponsor exists.
- **Milestones:** confirm each one in *Club development* as it genuinely happens; confirmed milestones show on the About page timeline.

## Project structure

```
prisma/schema.prisma        # Data model (club, users, players, staff, teams,
                            # applications, fixtures, news, training, milestones, audit)
prisma/seed.ts              # Founding data: club record + milestones (+ optional owner)
src/app/                    # Public pages, /portal, /coach, /player, /login, /setup
src/lib/actions/            # Server actions (all mutations, permission-checked)
src/lib/auth.ts             # bcrypt + JWT sessions, role helpers
src/lib/coach-data.ts       # Team-visibility rules for coaches
public/uploads/             # Uploaded crests, photos, banners, sponsor logos
```

## Deployment notes

- Any Node.js host works (Vercel, a VPS, etc.) with a PostgreSQL database (Neon, Supabase, RDS, or the included Docker service).
- Set `DATABASE_URL` and a strong `AUTH_SECRET` in the host's environment; run `npx prisma migrate deploy` on deploy, then `npm run db:seed` once.
- Uploaded images are written to `public/uploads` on local disk — on ephemeral/serverless hosts, mount a persistent volume there or swap `src/lib/upload.ts` for object storage (S3/Cloudinary) later; the rest of the app is storage-agnostic.
- The schema is multi-team and multi-competition ready (fixtures carry competition + team, players/staff are independent records), so the club can add teams, departments and competitions without a rebuild.

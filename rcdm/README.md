# Ridgeway County Disaster Management (RCDM)

A clean, simple website + employee portal for Ridgeway County Disaster Management.
Built on the same stack as the Riverside FC platform: Next.js 14, Tailwind, Prisma + PostgreSQL, bcrypt + JWT sessions. No Supabase.

## Public pages
- `/` Home — hero, mission, active public operations, public announcements
- `/about` About Us
- `/operations` Operations (public ones)
- `/contact` Contact info + message form (messages land in the `Inquiry` table)

All public text (org name, tagline, mission, about, contact details) is editable
in the admin portal under **Website Settings** — nothing is hard-coded per page.

## Employee portal (`/login`, then `/portal`)
- Personalized dashboard (my assignments, training count, latest announcements)
- My Profile (rank/position shown; phone + bio editable)
- Employee Directory
- Internal Announcements
- Operations & Assignments (employees can confirm/complete their own assignments)
- Training Records

## Admin portal
- **Personnel & Accounts** (admins only): create employee accounts, set rank,
  position, role (Employee / Supervisor / Administrator), status, reset passwords.
  There is no public registration — accounts are admin-controlled.
- **Manage Announcements** (supervisors + admins): internal or public, pinnable.
- **Manage Operations** (supervisors + admins): create deployments, public or
  internal, assign employees with a role on the operation.
- **Training Records** (supervisors + admins manage from the Training page).
- **Website Settings** (admins only).

First run: visit `/setup` once to create the first administrator account.
That page disables itself as soon as any account exists.

## Setup
1. Create a free PostgreSQL database (e.g. Neon) and set `DATABASE_URL`.
2. Set `AUTH_SECRET` to a long random string.
3. `npm install`
4. `npx prisma db push` (creates the tables)
5. `npm run build && npm start`, then visit `/setup`.

## Deploy (Netlify, like the FC site)
- This project deploys from the repo root netlify.toml, which sets base directory `rcdm` and runs `prisma generate && prisma migrate deploy && next build`.
- Env vars: `DATABASE_URL`, `AUTH_SECRET`.

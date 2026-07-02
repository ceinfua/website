# CEINFUA Website

Internet portal for the Centro de Estudiantes de Ingenieria Informatica de la Universidad Americana (CEINFUA) — publishes news, updates, and events for the student center. Also tracks student center membership with role-based access (student registration, staff roster management, and role administration).

## Prerequisites

- Node.js (v20+ recommended)
- Docker + Docker Compose (for local Postgres)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy the environment file and adjust if needed:
   ```bash
   cp .env.example .env
   ```

   In addition to `DATABASE_URL`, the following env vars are required for auth/email:
   - `NEXTAUTH_SECRET` — random secret used to sign session tokens. Generate one locally with `openssl rand -base64 32`.
   - `NEXTAUTH_URL` — base URL of the app (`http://localhost:3000` in dev).
   - `RESEND_API_KEY` — API key for [Resend](https://resend.com), used to send verification/claim-account emails. Leave blank locally: `lib/email.ts` detects a missing key and logs the email to the console instead of sending it, so registration/invite flows still work end-to-end without a real Resend account.
   - `EMAIL_FROM` — the "from" address used for outgoing email.

3. Start the local Postgres database:
   ```bash
   docker compose up -d
   ```

4. Apply database migrations:
   ```bash
   npx prisma migrate dev
   ```

5. Seed the first admin account (bootstrap):
   ```bash
   npx prisma db seed
   ```
   Creates `admin@ceinfua.local` (password `ChangeMe123!`, see `prisma/seed.ts`) with role `ADMIN` and a linked `Student` record. This is the only way to get an initial admin — change the password after first login. Safe to re-run (upsert).

## Running the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

Pages available:
- `/` (Home), `/news`, `/events`
- `/register` — student self-registration (creates an unverified account + sends a verification email)
- `/login` — sign in with email/password
- `/claim-account?token=...` — for students added manually by staff; sets a password to activate the account (link comes from the invite email)
- `/profile` — signed-in student's own record (edit `telefono`/`estado`)
- `/students` — full roster (`CEINFUA_MEMBER`/`ADMIN`) or limited lookup (`EXTERNAL_PARTNER`: nombre, apellido, cedula, telefono only)
- `/admin/roles` — admin-only role management

If port 3000 is already in use, run on an alternate port:

```bash
npm run dev -- -p 3001
```

### Staff-created student flow

A `CEINFUA_MEMBER` or `ADMIN` can create a `Student` record on someone's behalf via `POST /api/students` without that person self-registering. The new account has no password; the system sends a claim-account invite email (or logs it locally if `RESEND_API_KEY` is unset) with a link to `/claim-account?token=...` where the student sets their own password to activate login.

## Tech stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Prisma ORM (7.x, new `prisma-client` generator with the `@prisma/adapter-pg` driver adapter) against local Postgres (via Docker Compose)
- Auth.js / NextAuth v5 (beta) with the Credentials provider + `@auth/prisma-adapter`
- Resend for transactional email (verification + claim-account invites)

## Notes

- `DATABASE_URL` lives in `.env` (gitignored); `.env.example` documents the expected shape.
- The Prisma `datasource` provider stays `postgresql` when moving to a managed Postgres (Neon/Supabase) for deployment — only `DATABASE_URL` changes.
- The Prisma client output is generated to `app/generated/prisma` (not the default `@prisma/client` path) — import from `@/app/generated/prisma/client` or `@/app/generated/prisma/enums`, not from `@prisma/client` directly.
- Not yet built (flagged as follow-up, not in scope for this feature): password reset/"forgot password", CSV bulk import of students, audit logging, rate limiting on `/api/register`, multi-factor authentication.

## License

AGPL-3.0-or-later. See [`LICENSE`](./LICENSE).

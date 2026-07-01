# CEINFUA Website

Internet portal for the Centro de Estudiantes de Ingenieria Informatica de la Universidad Americana (CEINFUA) — publishes news, updates, and events for the student center.

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

3. Start the local Postgres database:
   ```bash
   docker compose up -d
   ```

4. Apply database migrations:
   ```bash
   npx prisma migrate dev
   ```

## Running the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site. Pages available: `/` (Home), `/news`, `/events`.

If port 3000 is already in use, run on an alternate port:

```bash
npm run dev -- -p 3001
```

## Tech stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Prisma ORM against local Postgres (via Docker Compose)

## Notes

- `DATABASE_URL` lives in `.env` (gitignored); `.env.example` documents the expected shape.
- The Prisma `datasource` provider stays `postgresql` when moving to a managed Postgres (Neon/Supabase) for deployment — only `DATABASE_URL` changes.

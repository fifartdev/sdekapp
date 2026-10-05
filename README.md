# ΚΕΔ ΟΣΕΚΑ - Εφαρμογή Ορισμών Διαιτητών

Referee assignment app for ΚΕΔ ΟΣΕΚΑ. Admins create match days, add matches, and assign referees/commissioners; referees see their own assignments and can declare per-match availability.

## Stack

- Next.js 16 (App Router, Server Components + Server Actions), TypeScript
- Supabase (self-hosted) - Postgres + Auth
- Drizzle ORM
- Tailwind CSS + shadcn-style components (Radix primitives) + Framer Motion
- Nodemailer for match/availability notification emails

## Getting started

```bash
npm install
cp .env.local.example .env.local   # fill in Supabase + SMTP values
npm run db:push                    # push the schema to Postgres
npm run db:seed                    # create a bootstrap admin account
npm run dev
```

Env vars needed in `.env.local`:

| Var | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Auth (browser + server) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only, used to create referee accounts |
| `DATABASE_URL` | Pooled Postgres connection (app runtime queries, via Drizzle) |
| `DIRECT_URL` | Session-mode Postgres connection (schema push/migrations) |
| `SMTP_EMAIL` / `SMTP_PASSWORD` / `SMTP_HOST` | Nodemailer, server-only |

## Database

Schema lives in `lib/db/schema.ts`. After changing it:

```bash
npm run db:push      # apply to the connected Postgres instance
npm run db:studio    # browse data via Drizzle Studio
```

## Migrating from the old Appwrite version

`scripts/migrate-from-appwrite.ts` is a one-off script that reads the legacy Appwrite collections (refs, teams, arenas, dates, matches) and writes them into this schema. It needs `APPWRITE_API_KEY` plus the legacy `NEXT_PUBLIC_APPWRITE_*` vars in `.env.local`. Always dry-run first:

```bash
npm run migrate:appwrite -- --dry-run
npm run migrate:appwrite -- --commit
```

Referee passwords cannot be carried over from Appwrite - migrated referees get a random password and need to use "forgot password" to set their own.

## Deploy

Standard Next.js app - deploy on Vercel (or any Node host) with the env vars above set.

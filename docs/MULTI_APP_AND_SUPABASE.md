# Multi-app credentials + Supabase

## Your idea (correct)

```text
Many apps (Cossap, Turify, …)
   │
   ▼
Admin Dashboard (http://localhost:3002)
   │  each app has its own Google/GitHub clientId + secret
   ▼
Auth API encrypts secrets → PostgreSQL (local or Supabase)
```

`.env` must **not** hold one shared `GOOGLE_CLIENT_ID` for everyone.  
Those values are entered **per application** in the dashboard.

## What goes in `.env` (bootstrap only)

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` / `DIRECT_URL` | Postgres (local Docker **or** Supabase) |
| `SUPABASE_URL` / `SUPABASE_ANON_KEY` | Supabase project metadata (API), not Prisma |
| `ADMIN_API_KEY` | Admin dashboard login |
| `MASTER_ENCRYPTION_KEY` | Encrypt OAuth secrets at rest |
| `BETTER_AUTH_SECRET` | Auth engine secret |

## Supabase setup (required next step from you)

The key you shared (`sb_publishable_…`) is a **publishable/anon API key**.  
Prisma needs the **Database connection string** (with DB password).

1. Open [Supabase Dashboard](https://supabase.com/dashboard/project/vstkwyisxywyehzfvbkp)
2. Click **Connect** (or **Project Settings → Database**)
3. Copy:
   - **Transaction pooler** URI (port `6543`) → `DATABASE_URL`
   - **Session** URI (port `5432`) → `DIRECT_URL`
4. Paste into root `.env` (replace the local Docker URLs)
5. Run:

```bash
npx prisma migrate deploy
npm run start:dev
```

Then create App A / App B in the dashboard and paste each app’s Google/GitHub secrets there.

## Security note

You posted a Supabase key in chat. For a real project, rotate it in Supabase → **Settings → API** after testing.

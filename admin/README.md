# Universal Auth Admin Console

Next.js dashboard for managing applications and social login providers against the NestJS auth API.

## Run

1. Start the auth API (port 3001):

```bash
# from repo root
npm run start:dev
```

2. Start the admin console (port 3002):

```bash
cd admin
npm install
npm run dev
```

3. Open [http://localhost:3002](http://localhost:3002)

4. Sign in with:
   - **Admin API key:** `test-admin-key` (from root `.env` `ADMIN_API_KEY`)
   - Requests go through same-origin `/api-proxy` → Nest on port 3001
   - **Admin API key:** value of `ADMIN_API_KEY` from the root `.env`

## What you can manage

- Create applications → get `clientId` + one-time `clientSecret`
- Enable/disable apps, rotate client secrets
- Configure **Google** / **GitHub** client ID + secret (encrypted at rest)
- Copy provider callback URLs for Google/GitHub consoles

## Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS

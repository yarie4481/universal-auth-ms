# Universal Authentication Microservice

Self-hosted authentication platform built with **NestJS + Hexagonal Architecture**, using **Better Auth** as the authentication engine.

Clients (Flutter, Go, Python, React, etc.) talk only to this service’s stable REST API. They never install or depend on Better Auth.

## Phase 1 (implemented)

- NestJS + TypeScript hexagonal layout (`domain` / `application` / `infrastructure` / `adapters`)
- PostgreSQL via Prisma
- Better Auth adapter (email/password, sessions, bearer tokens, JWT + JWKS)
- REST API: register, login, logout, refresh, me
- `GET /.well-known/jwks.json` and OpenID discovery stub
- Swagger at `/api/docs`
- Health checks
- Docker Compose

## Phase 2 (implemented)

- Multi-application management (clientId / clientSecret)
- Google + GitHub OAuth provider config per application
- AES-256-GCM secret encryption at rest (`MASTER_ENCRYPTION_KEY`)
- Admin API secured with `x-admin-api-key`
- Dynamic Better Auth reload when providers change
- Public OAuth start: `GET /api/v1/oauth/:provider`
- **Next.js Admin Console** in `admin/` (port 3002)

## Quick start

### 1. Start Postgres

```bash
docker compose -f docker-compose.dev.yml up -d
```

### 2. Install & migrate

```bash
cp .env.example .env
npm install
npx prisma migrate dev --name init
npm run start:dev
```

### 3. Try the API

Swagger: [http://localhost:3001/api/docs](http://localhost:3001/api/docs)

```bash
# Register
curl -s -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Ada","email":"ada@example.com","password":"Str0ngPass!"}'

# Login
curl -s -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ada@example.com","password":"Str0ngPass!"}'

# Me (use accessToken from response)
curl -s http://localhost:3001/api/v1/auth/me \
  -H "Authorization: Bearer <accessToken>"

# JWKS for cross-language JWT verification
curl -s http://localhost:3001/.well-known/jwks.json
```

### 4. Admin — create an app + enable Google

```bash
# Create application (save clientSecret — shown once)
curl -s -X POST http://localhost:3001/api/v1/admin/applications \
  -H "Content-Type: application/json" \
  -H "x-admin-api-key: $ADMIN_API_KEY" \
  -d '{
    "name":"Cossap Mobile",
    "type":"MOBILE",
    "environment":"development",
    "redirectUris":["http://localhost:3001/auth/callback"],
    "allowedProviders":["google","github"]
  }'

# Configure Google (secret encrypted in Postgres)
curl -s -X POST http://localhost:3001/api/v1/admin/applications/<appId>/providers \
  -H "Content-Type: application/json" \
  -H "x-admin-api-key: $ADMIN_API_KEY" \
  -d '{
    "provider":"google",
    "enabled":true,
    "clientId":"<GOOGLE_CLIENT_ID>",
    "clientSecret":"<GOOGLE_CLIENT_SECRET>",
    "scopes":["openid","email","profile"]
  }'

# Start OAuth (any client tech)
curl -s "http://localhost:3001/api/v1/oauth/google?clientId=<CLIENT_ID>&callbackURL=http://localhost:3001/auth/callback"
```

Google/GitHub console callback URL:

`http://localhost:3001/api/auth/callback/google`  
`http://localhost:3001/api/auth/callback/github`

### 5. Admin dashboard (Next.js)

```bash
npm run admin:dev
# open http://localhost:3002
# sign in with ADMIN_API_KEY from .env
```

## Token model

| Token | Purpose |
| --- | --- |
| `accessToken` | Opaque session token for calling **this** auth service (`Authorization: Bearer …`) |
| `jwt` | Signed JWT for **your** APIs — verify locally with JWKS, no round-trip required |

## Architecture rules (enforced)

1. Better Auth lives only under `infrastructure/auth/better-auth`
2. Use cases depend on `AuthEnginePort`, never on Better Auth types
3. Controllers are thin HTTP adapters
4. Domain has no NestJS / Prisma / Redis / Kafka imports

## Roadmap

| Phase | Focus |
| --- | --- |
| 1 | Core auth + JWT/JWKS + Docker |
| 2 | Admin API, applications, Google/GitHub OAuth, secret encryption (this) |
| 3 | Roles/permissions, sessions admin, audit logs |
| 4 | Redis, Kafka, webhooks, rate limiting, MFA |
| 5 | Developer portal, SDKs, CLI, organizations |

## Docs

- Integration examples: `docs/examples/`
- Architecture notes: `docs/ARCHITECTURE.md`

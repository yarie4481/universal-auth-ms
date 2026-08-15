# Phase 2 — Applications, Providers & Encrypted Secrets

## Value

Admins configure apps and OAuth providers through the API — no code deploys or env edits for Google/GitHub credentials.

## Flow

```text
Admin API (x-admin-api-key)
   │
   ├─ POST /api/v1/admin/applications
   │     → clientId + one-time clientSecret
   │
   └─ POST /api/v1/admin/applications/:id/providers
         → Google/GitHub credentials encrypted (AES-256-GCM)
         → Better Auth instance cache invalidated

Client (Flutter / Go / …)
   │
   └─ GET /api/v1/oauth/google?clientId=…&callbackURL=…
         → authorization URL (Better Auth socialProviders)
         → cookie oauth_app_id for callback routing
         → /api/auth/callback/google (Better Auth handler)
```

## Security notes

- Application `clientSecret` is hashed (SHA-256); plaintext shown once.
- OAuth `clientSecret` is encrypted at rest with `MASTER_ENCRYPTION_KEY`.
- Admin routes require `x-admin-api-key` (`ADMIN_API_KEY`).
- Provider responses always mask secrets as `****************`.

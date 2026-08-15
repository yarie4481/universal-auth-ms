# Node.js / TypeScript

```ts
const baseUrl = 'http://localhost:3001';

async function login(email: string, password: string) {
  const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<{
    tokens: { accessToken: string; jwt: string };
    user: { id: string; email: string };
  }>;
}

async function me(accessToken: string) {
  const res = await fetch(`${baseUrl}/api/v1/auth/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.json();
}

// Verify JWT in your own API with jose + JWKS (no call to auth service):
import { createRemoteJWKSet, jwtVerify } from 'jose';

const JWKS = createRemoteJWKSet(
  new URL('http://localhost:3001/.well-known/jwks.json'),
);

export async function verifyJwt(token: string) {
  const { payload } = await jwtVerify(token, JWKS, {
    issuer: 'http://localhost:3001',
    audience: 'http://localhost:3001',
  });
  return payload;
}
```

const API = import.meta.env.VITE_AUTH_API_URL ?? "http://localhost:3001";
export const CLIENT_ID = import.meta.env.VITE_CLIENT_ID ?? "";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
};

export type AuthTokens = {
  accessToken: string;
  jwt: string;
  tokenType: string;
  expiresAt: string;
};

export type AuthResult = {
  user: AuthUser;
  tokens: AuthTokens;
};

const TOKEN_KEY = "auth.accessToken";
const JWT_KEY = "auth.jwt";

export function getStoredAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredJwt(): string | null {
  return localStorage.getItem(JWT_KEY);
}

export function storeTokens(tokens: AuthTokens): void {
  localStorage.setItem(TOKEN_KEY, tokens.accessToken);
  localStorage.setItem(JWT_KEY, tokens.jwt);
}

export function clearTokens(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(JWT_KEY);
}

async function readError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { message?: string; error?: string };
    return data.message ?? data.error ?? `${res.status} ${res.statusText}`;
  } catch {
    return `${res.status} ${res.statusText}`;
  }
}

export async function register(
  name: string,
  email: string,
  password: string,
): Promise<AuthResult> {
  const res = await fetch(`${API}/api/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json() as Promise<AuthResult>;
}

export async function login(
  email: string,
  password: string,
): Promise<AuthResult> {
  const res = await fetch(`${API}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json() as Promise<AuthResult>;
}

export async function me(accessToken: string): Promise<{ user: AuthUser }> {
  const res = await fetch(`${API}/api/v1/auth/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json() as Promise<{ user: AuthUser }>;
}

export async function logout(accessToken: string): Promise<void> {
  await fetch(`${API}/api/v1/auth/logout`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function startOAuth(
  provider: "google" | "github",
): Promise<void> {
  if (!CLIENT_ID) {
    throw new Error("Missing VITE_CLIENT_ID in clients/react-demo/.env");
  }

  const callbackURL = `${window.location.origin}/callback`;
  const qs = new URLSearchParams({ clientId: CLIENT_ID, callbackURL });
  // Navigate (do not fetch) so the API can set the OAuth state cookie, then 302 to Google.
  window.location.href = `${API}/api/v1/oauth/${provider}?${qs}`;
}

export async function getBrowserSession(): Promise<{
  user?: AuthUser;
  session?: { token?: string };
} | null> {
  const res = await fetch(`${API}/api/auth/get-session`, {
    credentials: "include",
  });
  if (!res.ok) return null;
  return res.json() as Promise<{
    user?: AuthUser;
    session?: { token?: string };
  }>;
}

export async function refreshJwt(accessToken: string): Promise<string | null> {
  const res = await fetch(`${API}/api/v1/auth/refresh`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { token?: string; jwt?: string };
  return data.token ?? data.jwt ?? null;
}

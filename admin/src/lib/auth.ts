const STORAGE_KEY = "ua_admin_api_key";
const API_URL_KEY = "ua_admin_api_url";

/** Browser calls same-origin proxy to avoid CORS / hung direct calls. */
export const DEFAULT_API_URL = "/api-proxy";

export function getApiKey(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(STORAGE_KEY);
}

export function setApiKey(key: string): void {
  sessionStorage.setItem(STORAGE_KEY, key);
}

export function clearApiKey(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}

export function getApiUrl(): string {
  if (typeof window === "undefined") return DEFAULT_API_URL;
  return sessionStorage.getItem(API_URL_KEY) ?? DEFAULT_API_URL;
}

export function setApiUrl(url: string): void {
  const cleaned = url.replace(/\/$/, "");
  sessionStorage.setItem(API_URL_KEY, cleaned || DEFAULT_API_URL);
}

export function isAuthenticated(): boolean {
  return Boolean(getApiKey());
}

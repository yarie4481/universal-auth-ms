"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DEFAULT_API_URL,
  clearApiKey,
  setApiKey,
  setApiUrl,
} from "@/lib/auth";
import { verifyAdminAccess, ApiError } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [apiKey, setApiKeyState] = useState("test-admin-key");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // Always use same-origin proxy after the hung direct-call issue
    setApiUrl(DEFAULT_API_URL);
    clearApiKey();
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const key = apiKey.trim();
    if (!key) {
      setError("Admin API key is required");
      setBusy(false);
      return;
    }

    try {
      setApiUrl(DEFAULT_API_URL);
      setApiKey(key);
      await verifyAdminAccess();
      router.replace("/dashboard");
    } catch (err) {
      clearApiKey();
      if (err instanceof ApiError) {
        setError(
          err.status === 401
            ? "Invalid admin API key"
            : err.message || "Could not reach the auth API",
        );
      } else {
        setError(
          "Cannot reach the auth API via /api-proxy. Keep `npm run start:dev` running on port 3001.",
        );
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-ink-900 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(15,138,122,0.35),transparent_40%),radial-gradient(circle_at_80%_70%,rgba(255,255,255,0.08),transparent_35%)]" />
      <div className="pointer-events-none absolute inset-0 bg-grid-mist bg-grid opacity-10" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16 md:px-10">
        <div className="max-w-xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-accent-soft/80">
            Self-hosted authentication
          </p>
          <h1 className="font-display text-5xl leading-[1.05] tracking-tight md:text-6xl">
            Universal Auth
          </h1>
          <p className="mt-4 max-w-md text-base text-white/70 md:text-lg">
            Manage applications, social login credentials, and encrypted
            provider secrets from one console.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="mt-10 w-full max-w-md rounded-2xl border border-white/10 bg-white p-6 text-ink-900 shadow-panel"
        >
          <h2 className="font-display text-2xl">Admin access</h2>
          <p className="mt-1 text-sm text-ink-600/75">
            Enter <code className="font-mono text-xs">ADMIN_API_KEY</code> from
            the auth service <code className="font-mono text-xs">.env</code>.
          </p>

          <div className="mt-6 space-y-4">
            <div>
              <label htmlFor="apiKey" className="label">
                Admin API key
              </label>
              <input
                id="apiKey"
                className="field font-mono"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKeyState(e.target.value)}
                placeholder="test-admin-key"
                required
                autoFocus
              />
              <p className="mt-1.5 text-xs text-ink-600/70">
                Dev default: <code className="font-mono">test-admin-key</code>
              </p>
            </div>
          </div>

          {error ? (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <button type="submit" className="btn-primary mt-6 w-full" disabled={busy}>
            {busy ? "Connecting…" : "Enter console"}
          </button>
        </form>
      </div>
    </div>
  );
}

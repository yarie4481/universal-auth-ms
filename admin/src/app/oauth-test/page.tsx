"use client";

import { FormEvent, useMemo, useState } from "react";

const DEFAULT_CLIENT_ID = "app_337e19c81c23c241a3c9183a8adc97fe";

export default function OAuthTestPage() {
  const callbackURL = useMemo(() => {
    if (typeof window === "undefined") {
      return "http://localhost:3002/oauth-test/callback";
    }
    return `${window.location.origin}/oauth-test/callback`;
  }, []);

  const [clientId, setClientId] = useState(DEFAULT_CLIENT_ID);
  const [provider, setProvider] = useState<"google" | "github">("google");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [lastUrl, setLastUrl] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setLastUrl(null);

    try {
      const qs = new URLSearchParams({
        clientId: clientId.trim(),
        callbackURL,
      });
      const res = await fetch(`/api-proxy/api/v1/oauth/${provider}?${qs}`, {
        credentials: "include",
      });
      const data = (await res.json().catch(() => ({}))) as {
        url?: string;
        message?: string;
      };

      if (!res.ok || !data.url) {
        setError(
          data.message ??
            `OAuth start failed (${res.status}). Add the ${provider} provider in Admin → Applications → Providers first.`,
        );
        return;
      }

      setLastUrl(data.url);
      window.location.href = data.url;
    } catch {
      setError(
        "Cannot reach auth API. Keep npm run start:dev running on port 3001.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-mist-100 px-6 py-16 text-ink-900">
      <div className="mx-auto max-w-lg">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
          Client-side OAuth test
        </p>
        <h1 className="mt-2 font-display text-4xl tracking-tight">
          Test social login
        </h1>
        <p className="mt-3 text-sm text-ink-600">
          Uses your app <code className="font-mono text-xs">clientId</code> the
          same way a Flutter/React app would. Provider credentials must already
          be saved in the admin console.
        </p>

        <form
          onSubmit={onSubmit}
          className="mt-8 space-y-4 rounded-2xl border border-mist-200 bg-white p-6 shadow-panel"
        >
          <div>
            <label className="label" htmlFor="clientId">
              Application clientId
            </label>
            <input
              id="clientId"
              className="field font-mono"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="label" htmlFor="provider">
              Provider
            </label>
            <select
              id="provider"
              className="field"
              value={provider}
              onChange={(e) =>
                setProvider(e.target.value as "google" | "github")
              }
            >
              <option value="google">Google</option>
              <option value="github">GitHub</option>
            </select>
          </div>

          <div>
            <label className="label">callbackURL (allow-listed)</label>
            <p className="rounded-lg border border-mist-200 bg-mist-50 px-3 py-2 font-mono text-xs text-ink-700">
              {callbackURL}
            </p>
          </div>

          {error ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          {lastUrl ? (
            <p className="break-all rounded-lg bg-mist-50 px-3 py-2 font-mono text-[11px] text-ink-600">
              Redirecting to: {lastUrl}
            </p>
          ) : null}

          <button type="submit" className="btn-primary w-full" disabled={busy}>
            {busy ? "Starting…" : `Continue with ${provider}`}
          </button>
        </form>

        <ol className="mt-8 list-decimal space-y-2 pl-5 text-sm text-ink-600">
          <li>
            Open Admin → app <strong>dsds</strong> → add Google (or GitHub)
            client id + secret.
          </li>
          <li>
            In Google Cloud / GitHub OAuth app, set Authorized redirect URI to{" "}
            <code className="font-mono text-xs">
              http://localhost:3001/api/auth/callback/google
            </code>{" "}
            (or <code className="font-mono text-xs">…/github</code>).
          </li>
          <li>Come back here and click Continue.</li>
        </ol>
      </div>
    </div>
  );
}

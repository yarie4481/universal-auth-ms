"use client";

import { FormEvent, useMemo, useState } from "react";

const DEFAULT_CLIENT_ID = "app_a2b60f96675365fc261b87c1001226f8";
const AUTH_API = process.env.NEXT_PUBLIC_AUTH_API_ORIGIN ?? "http://localhost:3001";

export default function OAuthTestPage() {
  const callbackURL = useMemo(() => {
    if (typeof window === "undefined") {
      return "http://localhost:3002/oauth-test/callback";
    }
    return `${window.location.origin}/oauth-test/callback`;
  }, []);

  const [clientId, setClientId] = useState(DEFAULT_CLIENT_ID);
  const [provider, setProvider] = useState<"google" | "github">("google");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const qs = new URLSearchParams({
      clientId: clientId.trim(),
      callbackURL,
    });
    window.location.href = `${AUTH_API}/api/v1/oauth/${provider}?${qs}`;
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

          <button type="submit" className="btn-primary w-full">
            Continue with {provider}
          </button>
        </form>

        <ol className="mt-8 list-decimal space-y-2 pl-5 text-sm text-ink-600">
          <li>
            Open Admin → your application → add Google (or GitHub)
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

"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function CallbackInner() {
  const params = useSearchParams();
  const entries = Array.from(params.entries());

  return (
    <div className="min-h-screen bg-mist-100 px-6 py-16 text-ink-900">
      <div className="mx-auto max-w-lg rounded-2xl border border-mist-200 bg-white p-6 shadow-panel">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
          OAuth callback
        </p>
        <h1 className="mt-2 font-display text-3xl tracking-tight">
          Returned to your app
        </h1>
        <p className="mt-3 text-sm text-ink-600">
          Better Auth finished the provider handshake and redirected here using
          your app&apos;s allow-listed <code className="font-mono text-xs">callbackURL</code>.
        </p>

        {entries.length === 0 ? (
          <p className="mt-6 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            Callback reached with no error query params — social login flow
            completed for this browser session.
          </p>
        ) : (
          <pre className="mt-6 overflow-auto rounded-lg bg-mist-50 p-3 font-mono text-xs text-ink-800">
            {JSON.stringify(Object.fromEntries(entries), null, 2)}
          </pre>
        )}

        <div className="mt-6 flex gap-3">
          <Link href="/oauth-test" className="btn-primary">
            Test again
          </Link>
          <Link href="/applications" className="btn-secondary">
            Back to apps
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OAuthTestCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-ink-600">
          Loading callback…
        </div>
      }
    >
      <CallbackInner />
    </Suspense>
  );
}

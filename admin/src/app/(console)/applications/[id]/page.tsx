"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { CopyButton } from "@/components/copy-button";
import { ApplicationForm } from "@/components/application-form";
import { ProviderForm } from "@/components/provider-form";
import {
  deleteApplication,
  deleteProvider,
  getApplication,
  listProviders,
  rotateApplicationSecret,
  updateApplication,
  updateProvider,
  upsertProvider,
} from "@/lib/api";
import type {
  Application,
  OAuthProvider,
  OAuthProviderType,
  UpsertProviderPayload,
} from "@/lib/types";

const PROVIDERS: OAuthProviderType[] = ["google", "github"];

/** Public Nest API origin for OAuth redirect URIs (not the admin proxy). */
const PUBLIC_API_ORIGIN =
  process.env.NEXT_PUBLIC_AUTH_API_ORIGIN ?? "http://localhost:3001";

export default function ApplicationDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [app, setApp] = useState<Application | null>(null);
  const [providers, setProviders] = useState<OAuthProvider[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [rotatedSecret, setRotatedSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const apiBase = useMemo(() => PUBLIC_API_ORIGIN.replace(/\/$/, ""), []);

  async function reload() {
    const [application, providerList] = await Promise.all([
      getApplication(id),
      listProviders(id),
    ]);
    setApp(application);
    setProviders(providerList);
  }

  useEffect(() => {
    reload()
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load"),
      )
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function saveProvider(payload: UpsertProviderPayload) {
    const existing = providers.find((p) => p.provider === payload.provider);
    if (existing && !payload.clientSecret) {
      await updateProvider(existing.id, {
        enabled: payload.enabled,
        clientId: payload.clientId,
        scopes: payload.scopes,
        redirectUri: payload.redirectUri,
      });
    } else {
      await upsertProvider(id, payload);
    }
    await reload();
  }

  if (loading) {
    return <p className="text-sm text-ink-600/70">Loading application…</p>;
  }

  if (!app) {
    return (
      <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
        {error ?? "Application not found"}
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/applications"
          className="text-sm font-semibold text-accent-dark hover:underline"
        >
          ← Applications
        </Link>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl tracking-tight">{app.name}</h1>
            <p className="mt-2 text-sm text-ink-600/75">
              {app.environment} · {app.type} · {app.status}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn-secondary"
              onClick={async () => {
                const next =
                  app.status === "active" ? "disabled" : "active";
                const updated = await updateApplication(app.id, {
                  status: next,
                });
                setApp(updated);
              }}
            >
              {app.status === "active" ? "Disable" : "Enable"}
            </button>
            <button
              type="button"
              className="btn-danger"
              onClick={async () => {
                if (!window.confirm(`Delete ${app.name}?`)) return;
                await deleteApplication(app.id);
                router.push("/applications");
              }}
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <section className="panel space-y-4 p-6">
        <h2 className="font-display text-2xl">Credentials</h2>
        <div>
          <p className="label">Client ID</p>
          <div className="flex flex-wrap items-center gap-2">
            <code className="rounded-lg bg-mist-50 px-3 py-2 font-mono text-sm">
              {app.clientId}
            </code>
            <CopyButton value={app.clientId} />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="btn-secondary"
            onClick={async () => {
              const result = await rotateApplicationSecret(app.id);
              setRotatedSecret(result.clientSecret);
            }}
          >
            Rotate client secret
          </button>
          {rotatedSecret ? (
            <div className="flex flex-wrap items-center gap-2">
              <code className="rounded-lg bg-warn-soft px-3 py-2 font-mono text-sm text-warn">
                {rotatedSecret}
              </code>
              <CopyButton value={rotatedSecret} />
            </div>
          ) : null}
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="font-display text-2xl">Application settings</h2>
          <p className="mt-1 text-sm text-ink-600/75">
            Edit name, callback URLs, and allowed origins for this app.
          </p>
        </div>
        <ApplicationForm
          key={app.id}
          initial={{
            name: app.name,
            type: app.type,
            environment: app.environment,
            redirectUris: app.redirectUris,
            allowedOrigins: app.allowedOrigins,
            allowedProviders: app.allowedProviders,
          }}
          lockEnvironment
          submitLabel="Save changes"
          onSubmit={async (payload) => {
            const updated = await updateApplication(app.id, {
              name: payload.name,
              type: payload.type,
              redirectUris: payload.redirectUris,
              allowedOrigins: payload.allowedOrigins,
              allowedProviders: payload.allowedProviders,
            });
            setApp(updated);
            setError(null);
          }}
        />
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-display text-3xl tracking-tight">
            Social login providers
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-ink-600/75">
            Paste Google/GitHub client ID and secret here. Values are encrypted
            at rest by the auth service. Register the callback URL in each
            provider console.
          </p>
        </div>

        <div className="grid gap-6">
          {PROVIDERS.map((provider) => {
            const existing =
              providers.find((p) => p.provider === provider) ?? null;
            return (
              <ProviderForm
                key={provider}
                provider={provider}
                existing={existing}
                defaultRedirectUri={`${apiBase}/api/auth/callback/${provider}`}
                onSubmit={saveProvider}
                onDelete={
                  existing
                    ? async () => {
                        await deleteProvider(existing.id);
                        await reload();
                      }
                    : undefined
                }
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}

"use client";

import { useState } from "react";
import { SecretField } from "@/components/secret-field";
import type { OAuthProvider, OAuthProviderType, UpsertProviderPayload } from "@/lib/types";

interface ProviderFormProps {
  provider: OAuthProviderType;
  existing?: OAuthProvider | null;
  defaultRedirectUri: string;
  onSubmit: (payload: UpsertProviderPayload) => Promise<void>;
  onDelete?: () => Promise<void>;
}

export function ProviderForm({
  provider,
  existing,
  defaultRedirectUri,
  onSubmit,
  onDelete,
}: ProviderFormProps) {
  const [enabled, setEnabled] = useState(existing?.enabled ?? true);
  const [clientId, setClientId] = useState(existing?.clientId ?? "");
  const [clientSecret, setClientSecret] = useState("");
  const [scopes, setScopes] = useState(
    (existing?.scopes ?? defaultScopes(provider)).join(", "),
  );
  const [redirectUri, setRedirectUri] = useState(
    existing?.redirectUri ?? defaultRedirectUri,
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setSuccess(null);

    if (!clientId.trim()) {
      setError("Client ID is required");
      setBusy(false);
      return;
    }

    if (!existing && !clientSecret.trim()) {
      setError("Client secret is required for first-time setup");
      setBusy(false);
      return;
    }

    try {
      await onSubmit({
        provider,
        enabled,
        clientId: clientId.trim(),
        clientSecret: clientSecret.trim(),
        scopes: scopes
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        redirectUri: redirectUri.trim() || undefined,
      });
      setClientSecret("");
      setSuccess(
        existing
          ? "Provider updated."
          : "Provider saved. Secret encrypted at rest.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save provider");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="panel space-y-5 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl capitalize text-ink-900">
            {provider}
          </h2>
          <p className="mt-1 text-sm text-ink-600/75">
            Credentials are encrypted in PostgreSQL. The dashboard never shows the
            raw secret after save.
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold text-ink-800">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="size-4 accent-accent"
          />
          Enabled
        </label>
      </div>

      <div>
        <label htmlFor={`${provider}-client-id`} className="label">
          Client ID
        </label>
        <input
          id={`${provider}-client-id`}
          className="field font-mono"
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          placeholder={`${provider}-client-id`}
          required
        />
      </div>

      <SecretField
        id={`${provider}-client-secret`}
        label="Client secret"
        value={clientSecret}
        onChange={setClientSecret}
        placeholder={
          existing ? "Enter secret to replace stored value" : "Paste provider secret"
        }
        hint={
          existing
            ? `Stored secret is masked as ${existing.clientSecret}. Leave blank to keep it; enter a new value to rotate.`
            : "Will be encrypted with MASTER_ENCRYPTION_KEY before storage."
        }
        required={!existing}
      />

      <div>
        <label htmlFor={`${provider}-scopes`} className="label">
          Scopes
        </label>
        <input
          id={`${provider}-scopes`}
          className="field"
          value={scopes}
          onChange={(e) => setScopes(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor={`${provider}-redirect`} className="label">
          Redirect URI (register this in Google/GitHub console)
        </label>
        <input
          id={`${provider}-redirect`}
          className="field font-mono"
          value={redirectUri}
          onChange={(e) => setRedirectUri(e.target.value)}
        />
      </div>

      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}
      {success ? (
        <p className="rounded-lg bg-accent-soft px-3 py-2 text-sm text-accent-dark">
          {success}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button type="submit" className="btn-primary" disabled={busy}>
          {busy ? "Saving…" : existing ? "Update provider" : "Save provider"}
        </button>
        {existing && onDelete ? (
          <button
            type="button"
            className="btn-danger"
            disabled={busy}
            onClick={async () => {
              if (!window.confirm(`Remove ${provider} configuration?`)) return;
              setBusy(true);
              try {
                await onDelete();
              } catch (err) {
                setError(err instanceof Error ? err.message : "Delete failed");
              } finally {
                setBusy(false);
              }
            }}
          >
            Remove
          </button>
        ) : null}
      </div>
    </form>
  );
}

function defaultScopes(provider: OAuthProviderType): string[] {
  if (provider === "google") return ["openid", "email", "profile"];
  return ["read:user", "user:email"];
}

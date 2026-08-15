"use client";

import { useState } from "react";
import type { ApplicationType, AppEnvironment, CreateApplicationPayload } from "@/lib/types";

const TYPES: ApplicationType[] = [
  "WEB",
  "SPA",
  "MOBILE",
  "BACKEND",
  "MACHINE_TO_MACHINE",
];

const ENVS: AppEnvironment[] = ["development", "staging", "production"];

interface ApplicationFormProps {
  initial?: Partial<CreateApplicationPayload>;
  submitLabel?: string;
  lockEnvironment?: boolean;
  onSubmit: (payload: CreateApplicationPayload) => Promise<void>;
}

export function ApplicationForm({
  initial,
  submitLabel = "Create application",
  lockEnvironment = false,
  onSubmit,
}: ApplicationFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState<ApplicationType>(initial?.type ?? "WEB");
  const [environment, setEnvironment] = useState<AppEnvironment>(
    initial?.environment ?? "development",
  );
  const [redirectUris, setRedirectUris] = useState(
    (initial?.redirectUris ?? []).join("\n"),
  );
  const [allowedOrigins, setAllowedOrigins] = useState(
    (initial?.allowedOrigins ?? []).join("\n"),
  );
  const [allowedProviders, setAllowedProviders] = useState(
    (initial?.allowedProviders ?? ["google", "github"]).join(", "),
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      await onSubmit({
        name: name.trim(),
        type,
        environment,
        redirectUris: splitLines(redirectUris),
        allowedOrigins: splitLines(allowedOrigins),
        allowedProviders: splitCsv(allowedProviders),
      });
      if (lockEnvironment) {
        setSuccess("Application updated.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="panel space-y-5 p-6">
      <div>
        <label htmlFor="name" className="label">
          Application name
        </label>
        <input
          id="name"
          className="field"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Cossap Mobile"
          required
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="type" className="label">
            Type
          </label>
          <select
            id="type"
            className="field"
            value={type}
            onChange={(e) => setType(e.target.value as ApplicationType)}
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="environment" className="label">
            Environment
          </label>
          <select
            id="environment"
            className="field"
            value={environment}
            disabled={lockEnvironment}
            onChange={(e) => setEnvironment(e.target.value as AppEnvironment)}
          >
            {ENVS.map((env) => (
              <option key={env} value={env}>
                {env}
              </option>
            ))}
          </select>
          {lockEnvironment ? (
            <p className="mt-1.5 text-xs text-ink-600/70">
              Environment cannot be changed after create.
            </p>
          ) : null}
        </div>
      </div>

      <div>
        <label htmlFor="redirects" className="label">
          Redirect URIs
        </label>
        <textarea
          id="redirects"
          className="field min-h-24 font-mono"
          value={redirectUris}
          onChange={(e) => setRedirectUris(e.target.value)}
          placeholder={
            "http://localhost:5173/callback\nhttp://localhost:3002/oauth-test/callback"
          }
        />
        <p className="mt-1.5 text-xs text-ink-600/70">
          One URI per line. React test app:{" "}
          <code>http://localhost:5173/callback</code>
        </p>
      </div>

      <div>
        <label htmlFor="origins" className="label">
          Allowed origins
        </label>
        <textarea
          id="origins"
          className="field min-h-20 font-mono"
          value={allowedOrigins}
          onChange={(e) => setAllowedOrigins(e.target.value)}
          placeholder="http://localhost:3000"
        />
      </div>

      <div>
        <label htmlFor="providers" className="label">
          Allowed providers
        </label>
        <input
          id="providers"
          className="field"
          value={allowedProviders}
          onChange={(e) => setAllowedProviders(e.target.value)}
          placeholder="google, github"
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

      <button type="submit" className="btn-primary" disabled={busy}>
        {busy ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}

function splitLines(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function splitCsv(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listApplications } from "@/lib/api";
import type { Application } from "@/lib/types";

export default function DashboardPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listApplications()
      .then(setApps)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load"),
      )
      .finally(() => setLoading(false));
  }, []);

  const active = apps.filter((a) => a.status === "active").length;
  const production = apps.filter((a) => a.environment === "production").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl tracking-tight text-ink-900">
          Overview
        </h1>
        <p className="mt-2 text-ink-600/75">
          Configure applications and social login providers without editing env
          files.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Stat label="Applications" value={loading ? "—" : String(apps.length)} />
        <Stat label="Active" value={loading ? "—" : String(active)} />
        <Stat label="Production" value={loading ? "—" : String(production)} />
      </div>

      <section className="panel p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-display text-2xl">Quick actions</h2>
          <Link href="/applications/new" className="btn-primary">
            New application
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <ActionCard
            title="Applications"
            body="Create client IDs for Flutter, web, Go, and more."
            href="/applications"
          />
          <ActionCard
            title="Social providers"
            body="Open an application to add Google or GitHub client secrets."
            href="/applications"
          />
        </div>
      </section>

      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <section className="panel overflow-hidden">
        <div className="border-b border-mist-200 px-6 py-4">
          <h2 className="font-display text-2xl">Recent applications</h2>
        </div>
        {loading ? (
          <p className="px-6 py-8 text-sm text-ink-600/70">Loading…</p>
        ) : apps.length === 0 ? (
          <p className="px-6 py-8 text-sm text-ink-600/70">
            No applications yet. Create one to start configuring OAuth.
          </p>
        ) : (
          <ul className="divide-y divide-mist-200">
            {apps.slice(0, 5).map((app) => (
              <li key={app.id}>
                <Link
                  href={`/applications/${app.id}`}
                  className="flex items-center justify-between gap-4 px-6 py-4 transition hover:bg-mist-50"
                >
                  <div>
                    <p className="font-semibold text-ink-900">{app.name}</p>
                    <p className="font-mono text-xs text-ink-600/65">
                      {app.clientId}
                    </p>
                  </div>
                  <div className="text-right text-xs font-semibold uppercase tracking-wide text-ink-600/70">
                    <p>{app.environment}</p>
                    <p>{app.type}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="panel p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-600/65">
        {label}
      </p>
      <p className="mt-2 font-display text-4xl text-ink-900">{value}</p>
    </div>
  );
}

function ActionCard({
  title,
  body,
  href,
}: {
  title: string;
  body: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-mist-200 bg-mist-50/70 p-4 transition hover:border-accent/40 hover:bg-accent-soft/40"
    >
      <p className="font-semibold text-ink-900">{title}</p>
      <p className="mt-1 text-sm text-ink-600/75">{body}</p>
    </Link>
  );
}

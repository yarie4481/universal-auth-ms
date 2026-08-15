"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listApplications } from "@/lib/api";
import type { Application } from "@/lib/types";

export default function ApplicationsPage() {
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl tracking-tight">Applications</h1>
          <p className="mt-2 text-ink-600/75">
            Each application gets a client ID for Flutter, web, Go, and other
            clients.
          </p>
        </div>
        <Link href="/applications/new" className="btn-primary">
          New application
        </Link>
      </div>

      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <section className="panel overflow-hidden">
        {loading ? (
          <p className="px-6 py-8 text-sm text-ink-600/70">Loading…</p>
        ) : apps.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="font-display text-2xl">No applications yet</p>
            <p className="mt-2 text-sm text-ink-600/70">
              Create one to configure Google or GitHub login.
            </p>
            <Link href="/applications/new" className="btn-primary mt-6 inline-flex">
              Create application
            </Link>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-mist-200 bg-mist-50/80 text-xs uppercase tracking-[0.08em] text-ink-600/70">
              <tr>
                <th className="px-6 py-3 font-semibold">Name</th>
                <th className="px-6 py-3 font-semibold">Environment</th>
                <th className="px-6 py-3 font-semibold">Type</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold">Client ID</th>
                <th className="px-6 py-3 font-semibold"> </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mist-200">
              {apps.map((app) => (
                <tr key={app.id} className="hover:bg-mist-50/70">
                  <td className="px-6 py-4">
                    <Link
                      href={`/applications/${app.id}`}
                      className="font-semibold text-ink-900 hover:text-accent-dark"
                    >
                      {app.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 capitalize">{app.environment}</td>
                  <td className="px-6 py-4">{app.type}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        app.status === "active"
                          ? "bg-accent-soft text-accent-dark"
                          : "bg-mist-100 text-ink-600"
                      }`}
                    >
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-ink-600/80">
                    {app.clientId}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/applications/${app.id}`}
                      className="text-sm font-semibold text-accent-dark hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

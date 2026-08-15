"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ApplicationForm } from "@/components/application-form";
import { CopyButton } from "@/components/copy-button";
import { createApplication } from "@/lib/api";
import type { CreateApplicationPayload } from "@/lib/types";

export default function NewApplicationPage() {
  const router = useRouter();
  const [created, setCreated] = useState<{
    id: string;
    clientId: string;
    clientSecret: string;
    warning: string;
  } | null>(null);

  async function onSubmit(payload: CreateApplicationPayload) {
    const result = await createApplication(payload);
    setCreated({
      id: result.application.id,
      clientId: result.application.clientId,
      clientSecret: result.clientSecret,
      warning: result.warning,
    });
  }

  if (created) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="font-display text-4xl tracking-tight">
            Application created
          </h1>
          <p className="mt-2 text-warn">
            Copy the client secret now — it will not be shown again.
          </p>
        </div>

        <div className="panel space-y-4 p-6">
          <div>
            <p className="label">Client ID</p>
            <div className="flex flex-wrap items-center gap-2">
              <code className="rounded-lg bg-mist-50 px-3 py-2 font-mono text-sm">
                {created.clientId}
              </code>
              <CopyButton value={created.clientId} />
            </div>
          </div>
          <div>
            <p className="label">Client secret</p>
            <div className="flex flex-wrap items-center gap-2">
              <code className="rounded-lg bg-warn-soft px-3 py-2 font-mono text-sm text-warn">
                {created.clientSecret}
              </code>
              <CopyButton value={created.clientSecret} />
            </div>
            <p className="mt-2 text-xs text-ink-600/70">{created.warning}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="btn-primary"
            onClick={() => router.push(`/applications/${created.id}`)}
          >
            Configure social providers
          </button>
          <Link href="/applications" className="btn-secondary">
            Back to list
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/applications"
          className="text-sm font-semibold text-accent-dark hover:underline"
        >
          ← Applications
        </Link>
        <h1 className="mt-3 font-display text-4xl tracking-tight">
          New application
        </h1>
        <p className="mt-2 text-ink-600/75">
          Issue credentials for a consuming app (mobile, SPA, backend, …).
        </p>
      </div>
      <ApplicationForm onSubmit={onSubmit} />
    </div>
  );
}

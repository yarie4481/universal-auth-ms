"use client";

import { RequireAuth } from "@/components/require-auth";
import { Shell } from "@/components/shell";

export default function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth>
      <Shell>{children}</Shell>
    </RequireAuth>
  );
}

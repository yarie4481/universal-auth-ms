"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearApiKey } from "@/lib/auth";

const NAV = [
  { href: "/dashboard", label: "Overview" },
  { href: "/applications", label: "Applications" },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  function logout() {
    clearApiKey();
    router.replace("/login");
  }

  return (
    <div className="min-h-screen bg-mist-100 bg-grid-mist bg-grid text-ink-900">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(15,138,122,0.12),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(18,50,71,0.12),transparent_40%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl gap-6 px-4 py-6 md:px-8">
        <aside className="panel hidden w-64 shrink-0 flex-col p-5 md:flex">
          <div className="mb-8">
            <p className="font-display text-2xl tracking-tight text-ink-900">
              Universal Auth
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.14em] text-ink-600/70">
              Admin Console
            </p>
          </div>

          <nav className="flex flex-1 flex-col gap-1">
            {NAV.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                    active
                      ? "bg-accent-soft text-accent-dark"
                      : "text-ink-700 hover:bg-mist-50"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 border-t border-mist-200 pt-4">
            <button type="button" onClick={logout} className="btn-secondary w-full">
              Sign out
            </button>
          </div>
        </aside>

        <main className="relative min-w-0 flex-1">
          <header className="panel mb-6 flex items-center justify-between px-5 py-4 md:hidden">
            <p className="font-display text-xl">Universal Auth</p>
            <button type="button" onClick={logout} className="btn-secondary">
              Sign out
            </button>
          </header>

          <div className="mb-4 flex gap-2 md:hidden">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="btn-secondary">
                {item.label}
              </Link>
            ))}
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}

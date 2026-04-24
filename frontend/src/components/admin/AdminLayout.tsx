"use client";

/**
 * AdminLayout — admin sekcijos layout'as (sidebar + turinys).
 *
 * Sprint 5.1 atkūrimas (senas failas buvo nupjautas ant emoji).
 *
 * Funkcijos:
 *   - Auto-redirect į /admin/login jei neprisijungęs
 *   - Sidebar su navigacija (Dashboard, Produktai, Užsakymai, Kategorijos)
 *   - Aktyvus link'as — paryškintas oranžiniu
 *   - Apačioje — admin info + atsijungimas
 *   - Login puslapyje layout'as neveikia (nes nėra sidebar'o)
 *
 * Stilius — TRUEWERK (cream fonas, ink sidebar, oranžinis akcentas)
 */

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/authStore";

const navItems = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
  },
  {
    href: "/admin/uzsakymai",
    label: "Užsakymai",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
        />
      </svg>
    ),
  },
  {
    href: "/admin/produktai",
    label: "Produktai",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
      </svg>
    ),
  },
  {
    href: "/admin/kategorijos",
    label: "Kategorijos",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M4 6h16M4 10h16M4 14h16M4 18h16"
        />
      </svg>
    ),
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { token, admin, logout, isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  // Išvengti hydration mismatch — laukiam, kol komponentas sumontuojamas
  useEffect(() => {
    setMounted(true);
  }, []);

  // Auth check — redirect jei neprisijungęs (išskyrus /admin/login puslapį)
  useEffect(() => {
    if (!mounted) return;
    if (pathname === "/admin/login") return;
    if (!isAuthenticated()) {
      router.push("/admin/login");
    }
  }, [mounted, pathname, isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
  };

  // Login puslapis — be sidebar'o
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // Dar ne sumontuotas ARBA neprisijungęs — rodom loading
  if (!mounted || !token) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <p className="text-sm font-display uppercase tracking-widest text-muted">
          Kraunama...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper flex">
      {/* Sidebar */}
      <aside
        className="w-64 flex-shrink-0 flex flex-col"
        style={{ backgroundColor: "var(--color-ink)" }}
      >
        {/* Logo */}
        <Link href="/admin/dashboard" className="p-6 block">
          <span className="text-xl font-display font-semibold tracking-tight">
            <span style={{ color: "var(--color-paper)" }}>e.</span>
            <span style={{ color: "var(--color-accent)" }}>printukas</span>
          </span>
          <div className="text-[10px] font-display uppercase tracking-widest mt-1"
            style={{ color: "rgba(245, 242, 234, 0.5)" }}
          >
            Admin panelė
          </div>
        </Link>

        {/* Navigacija */}
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-sm transition-colors"
                style={{
                  backgroundColor: isActive
                    ? "var(--color-accent)"
                    : "transparent",
                  color: isActive
                    ? "white"
                    : "rgba(245, 242, 234, 0.7)",
                }}
              >
                {item.icon}
                <span className="text-sm font-display font-medium">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Admin info + atsijungimas */}
        <div className="p-4 border-t" style={{ borderColor: "rgba(245, 242, 234, 0.1)" }}>
          {admin && (
            <div className="mb-3 px-2">
              <p
                className="text-sm font-display font-medium truncate"
                style={{ color: "var(--color-paper)" }}
              >
                {admin.name}
              </p>
              <p
                className="text-[10px] font-display uppercase tracking-widest truncate"
                style={{ color: "rgba(245, 242, 234, 0.5)" }}
              >
                {admin.email}
              </p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-xs font-display uppercase tracking-widest rounded-sm transition-colors"
            style={{
              color: "rgba(245, 242, 234, 0.5)",
            }}
          >
            ← Atsijungti
          </button>
        </div>
      </aside>

      {/* Pagrindinis turinys */}
      <main className="flex-1 overflow-auto">
        <div className="p-8 lg:p-10">{children}</div>
      </main>
    </div>
  );
}

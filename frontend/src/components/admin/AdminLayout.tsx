"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/authStore";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/admin/produktai", label: "Produktai", icon: "👕" },
  { href: "/admin/kategorijos", label: "Kategorijos", icon: "📁" },
  { href: "/admin/uzsakymai", label: "Užsakymai", icon: "📦" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { admin, isAuthenticated, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Login puslapiui nerodyti sidebar
  if (pathname === "/admin/login") return <>{children}</>;

  // Kol neprikrovė — nerodyti
  if (!mounted) return null;

  // Jei neprisijungęs — nukreipti į login
  if (!isAuthenticated()) {
    router.push("/admin/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-64 bg-gray-900 text-white flex flex-col shrink-0">
        <div className="p-6 border-b border-gray-800">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <span className="text-xl">🖨️</span>
            <span className="font-bold">e.printukas <span className="text-emerald-400 text-xs">ADMIN</span></span>
          </Link>
        </div>

        <nav className="flex-1 py-4">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-6 py-3 text-sm transition-colors ${
                pathname === item.href ? "bg-gray-800 text-emerald-400 border-r-2 border-emerald-400" : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="text-sm text-gray-400 mb-2">{admin?.email}</div>
          <div className="flex gap-4">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">Svetainė ↗</Link>
            <button onClick={() => { logout(); router.push("/admin/login"); }}
              className="text-sm text-red-400 hover:text-red-300 transition-colors">Atsijungti</button>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}


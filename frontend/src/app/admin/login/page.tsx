"use client";

/**
 * Admin prisijungimo puslapis — /admin/login
 *
 * Sprint 5.1 atkūrimas (senas failas buvo nupjautas ant emoji 🔐).
 *
 * Kaip veikia:
 *   1. Vartotojas įveda email + slaptažodį
 *   2. POST /api/backend/auth/login (per proxy)
 *   3. Backend'as patikrina bcrypt + grąžina JWT token + admin info
 *   4. Token išsaugomas localStorage'e per Zustand persist
 *   5. Redirect į /admin/dashboard
 *
 * Stilius — TRUEWERK light (cream fonas, Space Grotesk, oranžinis akcentas)
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/authStore";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/backend/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Prisijungimo klaida");
        setLoading(false);
        return;
      }

      login(data.token, data.admin);
      router.push("/admin/dashboard");
    } catch {
      setError("Serverio klaida. Patikrinkite ar backend veikia.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo + antraštė */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <span className="text-2xl font-display font-semibold tracking-tight">
              <span style={{ color: "var(--color-ink)" }}>e.</span>
              <span style={{ color: "var(--color-accent)" }}>printukas</span>
            </span>
          </Link>

          <div className="flex items-center gap-2 justify-center mb-3">
            <span className="w-8 h-px bg-accent" aria-hidden="true" />
            <span className="text-xs font-display font-medium uppercase tracking-widest text-accent">
              Administratoriaus sritis
            </span>
            <span className="w-8 h-px bg-accent" aria-hidden="true" />
          </div>

          <h1
            className="text-3xl font-display font-semibold tracking-tight"
            style={{ color: "var(--color-ink)" }}
          >
            Prisijunkite
          </h1>
        </div>

        {/* Forma */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-line rounded-md p-8 space-y-5"
        >
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-display font-semibold uppercase tracking-widest text-ink mb-2"
            >
              El. paštas
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full px-4 py-3 border border-line-strong rounded-sm bg-white focus:outline-none focus:border-accent transition-colors text-sm font-display"
              style={{ color: "var(--color-ink)" }}
              placeholder="admin@eprintukas.lt"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-display font-semibold uppercase tracking-widest text-ink mb-2"
            >
              Slaptažodis
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full px-4 py-3 border border-line-strong rounded-sm bg-white focus:outline-none focus:border-accent transition-colors text-sm font-display"
              style={{ color: "var(--color-ink)" }}
            />
          </div>

          {error && (
            <div
              className="text-sm font-display p-3 rounded-sm border"
              style={{
                color: "var(--color-error)",
                borderColor: "var(--color-error)",
                backgroundColor: "rgba(163, 45, 45, 0.05)",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full font-display font-medium tracking-tight rounded-md transition-all text-base px-6 py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: "var(--color-accent)",
              color: "white",
            }}
          >
            {loading ? "Prisijungiama..." : "Prisijungti"}
          </button>
        </form>

        <p className="text-center mt-6 text-xs font-display uppercase tracking-widest text-muted">
          <Link href="/" className="hover:text-accent transition-colors">
            ← Grįžti į svetainę
          </Link>
        </p>
      </div>
    </div>
  );
}

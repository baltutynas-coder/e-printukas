/**
 * Admin autentifikacijos store — Zustand + JWT
 *
 * Sprint 5.1 fix:
 *   - Anksčiau naudojo hardcoded `http://localhost:4000` — veikė tik kai
 *     backend'as paleistas lokaliai. Deploy'inus į Vercel — neveikė.
 *   - Dabar naudoja `/api/backend/` proxy route (tas pats, ką naudoja kategorijos
 *     puslapis). Vienas truth source — viskas keliauja per Next.js serverį,
 *     kuris fetch'ina Railway.
 *
 * Kaip veikia:
 *   - `login(token, admin)` — išsaugo JWT token + admin info localStorage'e
 *     (per Zustand persist)
 *   - `adminFetch(endpoint, options)` — helper'is, kuris automatiškai prideda
 *     Authorization header'į ir redirect'ina į /admin/login jei 401
 *   - `logout()` — išvalo token + redirect
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Admin {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthStore {
  token: string | null;
  admin: Admin | null;
  isAuthenticated: () => boolean;
  login: (token: string, admin: Admin) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      token: null,
      admin: null,
      isAuthenticated: () => !!get().token,
      login: (token, admin) => set({ token, admin }),
      logout: () => set({ token: null, admin: null }),
    }),
    { name: "eprintukas-admin" }
  )
);

/**
 * API helper su auth header'iu.
 * Naudoja /api/backend/ proxy — tas pats, ką naudoja public puslapiai.
 * Tai išsprendžia CORS ir deploy problemas.
 */
export async function adminFetch(
  endpoint: string,
  options: RequestInit = {}
) {
  const token = useAuthStore.getState().token;

  // Jei endpoint'as prasideda /, tai relatyvus — proxy jį
  const url = endpoint.startsWith("/")
    ? `/api/backend${endpoint}`
    : `/api/backend/${endpoint}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    useAuthStore.getState().logout();
    if (typeof window !== "undefined") {
      window.location.href = "/admin/login";
    }
    throw new Error("Sesija pasibaigė");
  }

  return res;
}

// ============================================
// Admin autentifikacijos store
// ============================================

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

// API helper su auth header
export async function adminFetch(endpoint: string, options: RequestInit = {}) {
  const token = useAuthStore.getState().token;
  const res = await fetch(`http://localhost:4000/api${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    useAuthStore.getState().logout();
    window.location.href = "/admin/login";
    throw new Error("Sesija pasibaigė");
  }

  return res;
}

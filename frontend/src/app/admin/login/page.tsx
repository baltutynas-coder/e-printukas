"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
      const res = await fetch("http://localhost:4000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) { setError(data.error || "Prisijungimo klaida"); setLoading(false); return; }

      login(data.token, data.admin);
      router.push("/admin/dashboard");
    } catch {
      setError("Serverio klaida. Patikrinkite ar backend veikia.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-4xl">🖨️</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">e.<span className="text-gray-900">printukas</span>.lt</h1>
          <p className="text-gray-500 mt-2">Admin prisijungimas</p>
        </div>

        <div className="bg-white  shadow-sm border border-gray-200 p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3  mb-6">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">El. paštas</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@eprintukas.lt" required
                className="w-full px-4 py-2.5 border border-gray-300  focus:ring-2 focus:ring-gray-900 focus:border-black outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slaptažodis</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required
                className="w-full px-4 py-2.5 border border-gray-300  focus:ring-2 focus:ring-gray-900 focus:border-black outline-none" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-black hover:bg-gray-800 disabled:bg-gray-300 text-white font-semibold py-3  transition-colors">
              {loading ? "Jungiamasi..." : "Prisijungti"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}




"use client";

/**
 * Admin dashboard — /admin/dashboard
 *
 * Sprint 5.1 atkūrimas (senas failas buvo nupjautas ant emoji).
 *
 * Rodoma:
 *   - 3 statistikos kortelės (produktai, užsakymai, bendros pajamos)
 *   - 5 naujausi užsakymai (link į pilną sąrašą)
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { adminFetch } from "@/lib/authStore";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Laukia",
  PAID: "Apmokėta",
  PROCESSING: "Ruošiama",
  SHIPPED: "Išsiųsta",
  DELIVERED: "Pristatyta",
  CANCELLED: "Atšaukta",
};

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  PENDING: { bg: "rgba(184, 117, 31, 0.1)", color: "var(--color-warning)" },
  PAID: { bg: "rgba(15, 110, 86, 0.1)", color: "var(--color-success)" },
  PROCESSING: { bg: "rgba(208, 89, 30, 0.1)", color: "var(--color-accent)" },
  SHIPPED: { bg: "rgba(208, 89, 30, 0.1)", color: "var(--color-accent)" },
  DELIVERED: { bg: "rgba(14, 14, 14, 0.08)", color: "var(--color-ink)" },
  CANCELLED: { bg: "rgba(163, 45, 45, 0.1)", color: "var(--color-error)" },
};

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [pRes, oRes] = await Promise.all([
          adminFetch("/products?limit=1000"),
          adminFetch("/orders"),
        ]);
        const pData = await pRes.json();
        const oData = await oRes.json();

        const revenue =
          oData.orders
            ?.filter((o: any) => o.status !== "CANCELLED")
            .reduce((sum: number, o: any) => sum + parseFloat(o.total), 0) ||
          0;

        setStats({
          products: pData.pagination?.total || 0,
          orders: oData.pagination?.total || 0,
          revenue,
          recentOrders: oData.orders?.slice(0, 5) || [],
        });
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-20">
        <p className="text-sm font-display uppercase tracking-widest text-muted">
          Kraunama...
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Antraštė */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-8 h-px bg-accent" aria-hidden="true" />
          <span className="text-xs font-display font-medium uppercase tracking-widest text-accent">
            Apžvalga
          </span>
        </div>
        <h1
          className="text-3xl lg:text-4xl font-display font-semibold tracking-tight"
          style={{ color: "var(--color-ink)" }}
        >
          Dashboard
        </h1>
      </div>

      {/* Statistikos kortelės */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        <div className="bg-white border border-line rounded-md p-6">
          <p className="text-xs font-display uppercase tracking-widest text-muted mb-2">
            Produktai
          </p>
          <p
            className="text-3xl font-display font-semibold"
            style={{ color: "var(--color-ink)" }}
          >
            {stats?.products || 0}
          </p>
          <Link
            href="/admin/produktai"
            className="text-xs font-display uppercase tracking-wider text-accent hover:underline mt-3 inline-block"
          >
            Tvarkyti →
          </Link>
        </div>

        <div className="bg-white border border-line rounded-md p-6">
          <p className="text-xs font-display uppercase tracking-widest text-muted mb-2">
            Užsakymai
          </p>
          <p
            className="text-3xl font-display font-semibold"
            style={{ color: "var(--color-ink)" }}
          >
            {stats?.orders || 0}
          </p>
          <Link
            href="/admin/uzsakymai"
            className="text-xs font-display uppercase tracking-wider text-accent hover:underline mt-3 inline-block"
          >
            Peržiūrėti →
          </Link>
        </div>

        <div className="bg-white border border-line rounded-md p-6">
          <p className="text-xs font-display uppercase tracking-widest text-muted mb-2">
            Bendros pajamos
          </p>
          <p className="text-3xl font-display font-semibold text-accent">
            {stats?.revenue.toFixed(2)} €
          </p>
          <p className="text-[10px] font-display uppercase tracking-wider text-muted mt-3">
            Be atšauktų užsakymų
          </p>
        </div>
      </div>

      {/* Naujausi užsakymai */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-lg font-display font-semibold"
            style={{ color: "var(--color-ink)" }}
          >
            Naujausi užsakymai
          </h2>
          <Link
            href="/admin/uzsakymai"
            className="text-xs font-display uppercase tracking-wider text-accent hover:underline"
          >
            Visi užsakymai →
          </Link>
        </div>

        {stats?.recentOrders && stats.recentOrders.length > 0 ? (
          <div className="bg-white border border-line rounded-md overflow-hidden">
            <table className="w-full">
              <thead className="border-b border-line">
                <tr>
                  <th className="px-6 py-3 text-left text-[10px] font-display uppercase tracking-widest text-muted">
                    Nr.
                  </th>
                  <th className="px-6 py-3 text-left text-[10px] font-display uppercase tracking-widest text-muted">
                    Klientas
                  </th>
                  <th className="px-6 py-3 text-right text-[10px] font-display uppercase tracking-widest text-muted">
                    Suma
                  </th>
                  <th className="px-6 py-3 text-center text-[10px] font-display uppercase tracking-widest text-muted">
                    Statusas
                  </th>
                  <th className="px-6 py-3 text-left text-[10px] font-display uppercase tracking-widest text-muted">
                    Data
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {stats.recentOrders.map((o: any) => {
                  const style =
                    STATUS_STYLES[o.status] || STATUS_STYLES.PENDING;
                  return (
                    <tr key={o.id} className="hover:bg-paper-soft transition-colors">
                      <td className="px-6 py-3 text-sm font-display font-semibold text-ink">
                        {o.orderNumber}
                      </td>
                      <td className="px-6 py-3">
                        <div className="text-sm font-display text-ink">
                          {o.customerName}
                        </div>
                        <div className="text-xs text-muted">
                          {o.customerEmail}
                        </div>
                      </td>
                      <td className="px-6 py-3 text-sm font-display font-semibold text-right text-accent">
                        {parseFloat(o.total).toFixed(2)} €
                      </td>
                      <td className="px-6 py-3 text-center">
                        <span
                          className="inline-block px-2.5 py-1 rounded-sm text-[10px] font-display font-medium uppercase tracking-widest"
                          style={{
                            backgroundColor: style.bg,
                            color: style.color,
                          }}
                        >
                          {STATUS_LABELS[o.status] || o.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-xs text-muted font-display">
                        {new Date(o.createdAt).toLocaleDateString("lt-LT")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white border border-line rounded-md p-10 text-center">
            <p className="text-sm font-display text-muted">
              Užsakymų dar nėra
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/authStore";

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

        const revenue = oData.orders
          ?.filter((o: any) => o.status !== "CANCELLED")
          .reduce((sum: number, o: any) => sum + parseFloat(o.total), 0) || 0;

        setStats({
          products: pData.pagination?.total || 0,
          orders: oData.pagination?.total || 0,
          revenue,
          recentOrders: oData.orders?.slice(0, 5) || [],
        });
      } catch (e) { console.error(e); }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="text-center py-20 text-gray-400">Kraunama...</div>;

  const statusLabels: Record<string, string> = { PENDING: "Laukia", PAID: "Apmokėta", PROCESSING: "Ruošiama", SHIPPED: "Išsiųsta", DELIVERED: "Pristatyta", CANCELLED: "Atšaukta" };
  const statusColors: Record<string, string> = { PENDING: "bg-yellow-100 text-yellow-800", PAID: "bg-green-100 text-green-800", PROCESSING: "bg-blue-100 text-blue-800", SHIPPED: "bg-purple-100 text-purple-800", DELIVERED: "bg-gray-100 text-gray-800", CANCELLED: "bg-red-100 text-red-800" };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="border  p-6 bg-gray-50 border-gray-200">
          <div className="text-2xl mb-2">👕</div>
          <div className="text-sm text-gray-600">Produktai</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{stats?.products || 0}</div>
        </div>
        <div className="border  p-6 bg-blue-50 border-blue-200">
          <div className="text-2xl mb-2">📦</div>
          <div className="text-sm text-gray-600">Užsakymai</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{stats?.orders || 0}</div>
        </div>
        <div className="border  p-6 bg-amber-50 border-amber-200">
          <div className="text-2xl mb-2">💰</div>
          <div className="text-sm text-gray-600">Pajamos</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{(stats?.revenue || 0).toFixed(2)} €</div>
        </div>
      </div>

      <div className="bg-white border border-gray-200  overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Paskutiniai užsakymai</h2>
        </div>
        {stats?.recentOrders?.length > 0 ? (
          <table className="w-full">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-3 text-left">Nr.</th>
                <th className="px-6 py-3 text-left">Klientas</th>
                <th className="px-6 py-3 text-left">Statusas</th>
                <th className="px-6 py-3 text-right">Suma</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats.recentOrders.map((o: any) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm font-mono">{o.orderNumber}</td>
                  <td className="px-6 py-3 text-sm">{o.customerName}</td>
                  <td className="px-6 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded ${statusColors[o.status] || ""}`}>
                      {statusLabels[o.status] || o.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm text-right font-semibold">{parseFloat(o.total).toFixed(2)} €</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="px-6 py-10 text-center text-gray-400">Užsakymų dar nėra</div>
        )}
      </div>
    </div>
  );
}




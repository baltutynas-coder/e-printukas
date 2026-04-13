"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/authStore";

const statuses = [
  { value: "PENDING", label: "Laukia", color: "bg-yellow-100 text-yellow-800" },
  { value: "PAID", label: "Apmokėta", color: "bg-green-100 text-green-800" },
  { value: "PROCESSING", label: "Ruošiama", color: "bg-blue-100 text-blue-800" },
  { value: "SHIPPED", label: "Išsiųsta", color: "bg-purple-100 text-purple-800" },
  { value: "DELIVERED", label: "Pristatyta", color: "bg-emerald-100 text-emerald-800" },
  { value: "CANCELLED", label: "Atšaukta", color: "bg-red-100 text-red-800" },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const load = async () => {
    try { const res = await adminFetch("/orders"); const data = await res.json(); setOrders(data.orders || []); } catch (e) { console.error(e); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const changeStatus = async (orderId: string, status: string) => {
    try { await adminFetch(`/orders/${orderId}/status`, { method: "PUT", body: JSON.stringify({ status }) }); load(); } catch (e) { console.error(e); }
  };

  const getStatus = (s: string) => statuses.find((x) => x.value === s);

  if (loading) return <div className="text-center py-20 text-gray-400">Kraunama...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Užsakymai ({orders.length})</h1>

      {orders.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center text-gray-400">Užsakymų dar nėra</div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-3 text-left">Nr.</th>
                <th className="px-6 py-3 text-left">Klientas</th>
                <th className="px-6 py-3 text-left">Miestas</th>
                <th className="px-6 py-3 text-center">Prekės</th>
                <th className="px-6 py-3 text-right">Suma</th>
                <th className="px-6 py-3 text-center">Statusas</th>
                <th className="px-6 py-3 text-left">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedOrder(selectedOrder?.id === o.id ? null : o)}>
                  <td className="px-6 py-3 text-sm font-mono font-medium">{o.orderNumber}</td>
                  <td className="px-6 py-3">
                    <div className="text-sm font-medium text-gray-900">{o.customerName}</div>
                    <div className="text-xs text-gray-400">{o.customerEmail}</div>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600">{o.shippingCity}</td>
                  <td className="px-6 py-3 text-sm text-center">{o.items?.length || 0}</td>
                  <td className="px-6 py-3 text-sm text-right font-semibold">{parseFloat(o.total).toFixed(2)} €</td>
                  <td className="px-6 py-3 text-center">
                    <select value={o.status} onClick={(e) => e.stopPropagation()}
                      onChange={(e) => { e.stopPropagation(); changeStatus(o.id, e.target.value); }}
                      className={`text-xs font-medium px-2 py-1 rounded border-0 cursor-pointer ${getStatus(o.status)?.color || ""}`}>
                      {statuses.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </td>
                  <td className="px-6 py-3 text-xs text-gray-500">{new Date(o.createdAt).toLocaleDateString("lt-LT")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedOrder && (
        <div className="mt-6 bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Užsakymas {selectedOrder.orderNumber}</h2>
          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div><span className="text-gray-500">Klientas:</span> {selectedOrder.customerName}</div>
            <div><span className="text-gray-500">El. paštas:</span> {selectedOrder.customerEmail}</div>
            <div><span className="text-gray-500">Telefonas:</span> {selectedOrder.customerPhone || "—"}</div>
            <div><span className="text-gray-500">Miestas:</span> {selectedOrder.shippingCity}</div>
            <div className="col-span-2"><span className="text-gray-500">Adresas:</span> {selectedOrder.shippingAddress}, {selectedOrder.shippingZip}</div>
          </div>
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-500 uppercase border-b">
              <tr><th className="py-2 text-left">Prekė</th><th className="py-2 text-center">Kiekis</th><th className="py-2 text-right">Kaina</th></tr>
            </thead>
            <tbody>
              {selectedOrder.items?.map((item: any) => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="py-2">{item.product?.name || "—"}</td>
                  <td className="py-2 text-center">{item.quantity}</td>
                  <td className="py-2 text-right">{parseFloat(item.price).toFixed(2)} €</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

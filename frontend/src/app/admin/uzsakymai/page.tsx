"use client";

/**
 * Admin užsakymų puslapis — /admin/uzsakymai
 *
 * Sprint 5.3 redesign (TRUEWERK DNR):
 *   - Cream aplinka, baltos kortelės/lentelės
 *   - Oranžinis akcentas status dropdown'uose
 *   - Space Grotesk antraštės
 *   - Aiškūs status badge'ai pagal TRUEWERK spalvų sistemą
 *
 * Logika nekeista:
 *   - adminFetch("/orders") — gauna sąrašą
 *   - changeStatus() — PUT /orders/:id/status
 *   - Eilutės išskleidimas rodo užsakymo detales (prekės, adresas)
 */

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/authStore";

const STATUSES = [
  { value: "PENDING", label: "Laukia", bg: "rgba(184, 117, 31, 0.1)", color: "var(--color-warning)" },
  { value: "PAID", label: "Apmokėta", bg: "rgba(15, 110, 86, 0.1)", color: "var(--color-success)" },
  { value: "PROCESSING", label: "Ruošiama", bg: "rgba(208, 89, 30, 0.1)", color: "var(--color-accent)" },
  { value: "SHIPPED", label: "Išsiųsta", bg: "rgba(208, 89, 30, 0.15)", color: "var(--color-accent-dark)" },
  { value: "DELIVERED", label: "Pristatyta", bg: "rgba(14, 14, 14, 0.08)", color: "var(--color-ink)" },
  { value: "CANCELLED", label: "Atšaukta", bg: "rgba(163, 45, 45, 0.1)", color: "var(--color-error)" },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const load = async () => {
    try {
      const res = await adminFetch("/orders");
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const changeStatus = async (orderId: string, status: string) => {
    try {
      await adminFetch(`/orders/${orderId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      load();
    } catch (e) {
      console.error(e);
    }
  };

  const getStatus = (s: string) => STATUSES.find((x) => x.value === s) || STATUSES[0];

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
            Valdymas
          </span>
        </div>
        <h1
          className="text-3xl lg:text-4xl font-display font-semibold tracking-tight"
          style={{ color: "var(--color-ink)" }}
        >
          Užsakymai
        </h1>
        <p className="mt-2 text-sm text-muted font-display uppercase tracking-wider">
          {orders.length} {orders.length === 1 ? "užsakymas" : "užsakymų"}
        </p>
      </div>

      {/* Sąrašas */}
      {orders.length === 0 ? (
        <div className="bg-white border border-line rounded-md p-12 text-center">
          <p className="text-sm font-display text-muted">
            Užsakymų dar nėra
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white border border-line rounded-md overflow-hidden">
            <table className="w-full">
              <thead className="border-b border-line bg-paper-soft">
                <tr>
                  <th className="px-6 py-3 text-left text-[10px] font-display uppercase tracking-widest text-muted">
                    Nr.
                  </th>
                  <th className="px-6 py-3 text-left text-[10px] font-display uppercase tracking-widest text-muted">
                    Klientas
                  </th>
                  <th className="px-6 py-3 text-left text-[10px] font-display uppercase tracking-widest text-muted">
                    Miestas
                  </th>
                  <th className="px-6 py-3 text-center text-[10px] font-display uppercase tracking-widest text-muted">
                    Prekės
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
                {orders.map((o) => {
                  const status = getStatus(o.status);
                  return (
                    <tr
                      key={o.id}
                      className="hover:bg-paper-soft cursor-pointer transition-colors"
                      onClick={() =>
                        setSelectedOrder(selectedOrder?.id === o.id ? null : o)
                      }
                    >
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
                      <td className="px-6 py-3 text-sm font-display text-ink">
                        {o.shippingCity}
                      </td>
                      <td className="px-6 py-3 text-sm text-center font-display text-ink">
                        {o.items?.length || 0}
                      </td>
                      <td className="px-6 py-3 text-sm text-right font-display font-semibold text-accent">
                        {parseFloat(o.total).toFixed(2)} €
                      </td>
                      <td className="px-6 py-3 text-center">
                        <select
                          value={o.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            e.stopPropagation();
                            changeStatus(o.id, e.target.value);
                          }}
                          className="text-[10px] font-display font-medium uppercase tracking-widest px-2.5 py-1 rounded-sm border-0 cursor-pointer"
                          style={{
                            backgroundColor: status.bg,
                            color: status.color,
                          }}
                        >
                          {STATUSES.map((s) => (
                            <option
                              key={s.value}
                              value={s.value}
                              style={{ backgroundColor: "white", color: "var(--color-ink)" }}
                            >
                              {s.label}
                            </option>
                          ))}
                        </select>
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

          {/* Užsakymo detalės — jei pasirinktas */}
          {selectedOrder && (
            <div className="mt-6 bg-white border border-line rounded-md p-6">
              <div className="flex items-center justify-between mb-5">
                <h2
                  className="text-lg font-display font-semibold"
                  style={{ color: "var(--color-ink)" }}
                >
                  Užsakymas {selectedOrder.orderNumber}
                </h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-xs font-display uppercase tracking-widest text-muted hover:text-accent transition-colors"
                >
                  Uždaryti ×
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm font-display mb-6 pb-6 border-b border-line">
                <div>
                  <span className="text-[10px] font-display uppercase tracking-widest text-muted block mb-1">
                    Klientas
                  </span>
                  <span className="text-ink">{selectedOrder.customerName}</span>
                </div>
                <div>
                  <span className="text-[10px] font-display uppercase tracking-widest text-muted block mb-1">
                    El. paštas
                  </span>
                  <a
                    href={`mailto:${selectedOrder.customerEmail}`}
                    className="text-accent hover:underline"
                  >
                    {selectedOrder.customerEmail}
                  </a>
                </div>
                <div>
                  <span className="text-[10px] font-display uppercase tracking-widest text-muted block mb-1">
                    Telefonas
                  </span>
                  <span className="text-ink">
                    {selectedOrder.customerPhone || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-display uppercase tracking-widest text-muted block mb-1">
                    Miestas
                  </span>
                  <span className="text-ink">{selectedOrder.shippingCity}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] font-display uppercase tracking-widest text-muted block mb-1">
                    Adresas
                  </span>
                  <span className="text-ink">
                    {selectedOrder.shippingAddress}, {selectedOrder.shippingZip}
                  </span>
                </div>
              </div>

              {/* Prekių sąrašas */}
              <h3 className="text-xs font-display font-semibold uppercase tracking-widest text-ink mb-3">
                Prekės užsakyme
              </h3>
              <table className="w-full text-sm font-display">
                <thead className="border-b border-line">
                  <tr>
                    <th className="py-2 text-left text-[10px] font-display uppercase tracking-widest text-muted">
                      Prekė
                    </th>
                    <th className="py-2 text-center text-[10px] font-display uppercase tracking-widest text-muted">
                      Kiekis
                    </th>
                    <th className="py-2 text-right text-[10px] font-display uppercase tracking-widest text-muted">
                      Kaina
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items?.map((item: any) => (
                    <tr key={item.id} className="border-b border-line">
                      <td className="py-2.5 text-ink">
                        {item.product?.name || "—"}
                      </td>
                      <td className="py-2.5 text-center text-ink">
                        {item.quantity}
                      </td>
                      <td className="py-2.5 text-right font-semibold text-accent">
                        {parseFloat(item.price).toFixed(2)} €
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

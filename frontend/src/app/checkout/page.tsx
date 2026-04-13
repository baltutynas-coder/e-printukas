"use client";

import { useState } from "react";
import { useCartStore } from "@/lib/cartStore";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    shippingAddress: "",
    shippingCity: "",
    shippingZip: "",
  });

  const shippingCost = totalPrice() >= 50 ? 0 : 4.99;
  const total = totalPrice() + shippingCost;

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-6">🛒</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Krepšelis tuščias</h1>
        <Link href="/" className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8 py-3 rounded-lg">
          Grįžti į parduotuvę
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:4000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Užsakymo klaida");
        setLoading(false);
        return;
      }

      // Užsakymas sukurtas — išvalyti krepšelį ir nukreipti
      clearCart();
      router.push(`/uzsakymas/patvirtintas?order=${data.order.orderNumber}`);
    } catch (err) {
      setError("Serverio klaida. Bandykite vėliau.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Atsiskaitymas</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Forma */}
        <div className="lg:col-span-2">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Kontaktinė informacija</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vardas, Pavardė *</label>
                  <input
                    type="text" required
                    value={form.customerName}
                    onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                    placeholder="Jonas Jonaitis"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">El. paštas *</label>
                  <input
                    type="email" required
                    value={form.customerEmail}
                    onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                    placeholder="jonas@email.lt"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefonas</label>
                  <input
                    type="tel"
                    value={form.customerPhone}
                    onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                    placeholder="+370 600 00000"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Pristatymo adresas</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adresas *</label>
                  <input
                    type="text" required
                    value={form.shippingAddress}
                    onChange={(e) => setForm({ ...form, shippingAddress: e.target.value })}
                    placeholder="Gatvė 1-2"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Miestas *</label>
                  <input
                    type="text" required
                    value={form.shippingCity}
                    onChange={(e) => setForm({ ...form, shippingCity: e.target.value })}
                    placeholder="Vilnius"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pašto kodas *</label>
                  <input
                    type="text" required
                    value={form.shippingZip}
                    onChange={(e) => setForm({ ...form, shippingZip: e.target.value })}
                    placeholder="LT-01001"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-semibold py-4 rounded-xl text-lg transition-colors"
            >
              {loading ? "Apdorojama..." : `Pateikti užsakymą — ${total.toFixed(2)} €`}
            </button>

            <p className="text-center text-xs text-gray-400">
              Mokėjimo instrukcijos bus atsiųstos el. paštu
            </p>
          </form>
        </div>

        {/* Užsakymo santrauka */}
        <div>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 sticky top-24">
            <h2 className="font-semibold text-gray-900 mb-4">Jūsų užsakymas</h2>

            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={`${item.productId}-${item.color}-${item.size}`} className="flex justify-between text-sm">
                  <div>
                    <span className="text-gray-900">{item.name}</span>
                    <span className="text-gray-400 block text-xs">{item.color} / {item.size} × {item.quantity}</span>
                  </div>
                  <span className="text-gray-900 font-medium">{(item.price * item.quantity).toFixed(2)} €</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-3 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Prekės</span>
                <span>{totalPrice().toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Pristatymas</span>
                <span>{shippingCost === 0 ? "Nemokamas" : `${shippingCost.toFixed(2)} €`}</span>
              </div>
              {shippingCost > 0 && (
                <p className="text-xs text-emerald-600">
                  Nemokamas pristatymas nuo 50 €
                </p>
              )}
              <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-900">
                <span>Viso</span>
                <span>{total.toFixed(2)} €</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

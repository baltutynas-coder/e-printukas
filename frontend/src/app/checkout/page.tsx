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
        <p className="text-gray-500 mb-8">Pridėkite prekių iš katalogo</p>
        <Link href="/" className="inline-block bg-black hover:bg-gray-800 text-white font-bold px-8 py-3 uppercase tracking-wider text-sm transition-colors">
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
      const res = await fetch("https://TAVO-RAILWAY-URL/api/orders", {
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

      clearCart();
      router.push(`/uzsakymas/patvirtintas?order=${data.order.orderNumber}`);
    } catch (err) {
      setError("Serverio klaida. Bandykite vėliau.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-gray-400 mb-6">
        <Link href="/" className="hover:text-black transition-colors">🏠</Link>
        <span>›</span>
        <Link href="/krepselis" className="hover:text-black transition-colors">Krepšelis</Link>
        <span>›</span>
        <span className="text-black font-medium">Atsiskaitymas</span>
      </nav>

      <h1 className="text-3xl font-black uppercase tracking-tight mb-8">Atsiskaitymas</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Forma */}
        <div className="lg:col-span-2">
          {error && (
            <div className="bg-red-50 border border-red-300 text-red-700 text-sm px-4 py-3 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Kontaktinė informacija */}
            <div className="border border-gray-200 p-6">
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-5">Kontaktinė informacija</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Vardas, Pavardė *</label>
                  <input
                    type="text" required
                    value={form.customerName}
                    onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                    placeholder="Jonas Jonaitis"
                    className="w-full px-4 py-3 border border-gray-200 text-sm focus:border-black focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">El. paštas *</label>
                  <input
                    type="email" required
                    value={form.customerEmail}
                    onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                    placeholder="jonas@email.lt"
                    className="w-full px-4 py-3 border border-gray-200 text-sm focus:border-black focus:outline-none transition-colors"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Telefonas</label>
                  <input
                    type="tel"
                    value={form.customerPhone}
                    onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                    placeholder="+370 600 00000"
                    className="w-full px-4 py-3 border border-gray-200 text-sm focus:border-black focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Pristatymo adresas */}
            <div className="border border-gray-200 p-6">
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-5">Pristatymo adresas</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Adresas *</label>
                  <input
                    type="text" required
                    value={form.shippingAddress}
                    onChange={(e) => setForm({ ...form, shippingAddress: e.target.value })}
                    placeholder="Gatvė 1-2"
                    className="w-full px-4 py-3 border border-gray-200 text-sm focus:border-black focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Miestas *</label>
                  <input
                    type="text" required
                    value={form.shippingCity}
                    onChange={(e) => setForm({ ...form, shippingCity: e.target.value })}
                    placeholder="Vilnius"
                    className="w-full px-4 py-3 border border-gray-200 text-sm focus:border-black focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Pašto kodas *</label>
                  <input
                    type="text" required
                    value={form.shippingZip}
                    onChange={(e) => setForm({ ...form, shippingZip: e.target.value })}
                    placeholder="LT-01001"
                    className="w-full px-4 py-3 border border-gray-200 text-sm focus:border-black focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Pateikti mygtukas */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black hover:bg-gray-800 disabled:bg-gray-300 text-white font-bold py-4 text-sm uppercase tracking-wider transition-colors"
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
          <div className="border border-gray-200 p-6 sticky top-20">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-5">Jūsų užsakymas</h2>

            <div className="space-y-4 mb-5 pb-5 border-b border-gray-100">
              {items.map((item) => (
                <div key={`${item.productId}-${item.color}-${item.size}`} className="flex gap-3">
                  {item.image && (
                    <div className="w-14 h-14 bg-gray-50 flex-shrink-0 flex items-center justify-center overflow-hidden">
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <span className="text-sm font-bold text-gray-900">{item.name}</span>
                      <span className="text-sm font-bold text-gray-900">{(item.price * item.quantity).toFixed(2)} €</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: item.colorHex }} />
                      <span className="text-xs text-gray-400">{item.color} / {item.size} × {item.quantity}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Prekės</span>
                <span>{totalPrice().toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Pristatymas</span>
                <span>{shippingCost === 0 ? "Nemokamas" : `${shippingCost.toFixed(2)} €`}</span>
              </div>
              {shippingCost > 0 && (
                <p className="text-xs text-gray-400">
                  Nemokamas pristatymas nuo 50 €
                </p>
              )}
              <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between">
                <span className="text-sm font-black text-gray-900 uppercase">Viso</span>
                <span className="text-lg font-black text-gray-900">{total.toFixed(2)} €</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


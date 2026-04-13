"use client";

import Link from "next/link";
import { useCartStore } from "@/lib/cartStore";

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-6">🛒</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Krepšelis tuščias</h1>
        <p className="text-gray-500 mb-8">Pridėkite prekių iš katalogo</p>
        <Link href="/" className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors">
          Grįžti į parduotuvę
        </Link>
      </div>
    );
  }

  const shippingCost = totalPrice() >= 50 ? 0 : 4.99;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Krepšelis</h1>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={`${item.productId}-${item.color}-${item.size}`}
            className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl p-4">
            <Link href={`/produktas/${item.slug}`} className="shrink-0">
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-8 h-8 text-gray-300">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                  </svg>
                )}
              </div>
            </Link>

            <div className="flex-1 min-w-0">
              <Link href={`/produktas/${item.slug}`} className="font-semibold text-gray-900 hover:text-emerald-600 transition-colors">
                {item.name}
              </Link>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: item.colorHex }} />
                <span className="text-sm text-gray-500">{item.color} / {item.size}</span>
              </div>
            </div>

            <div className="flex items-center border border-gray-300 rounded-lg">
              <button onClick={() => updateQuantity(item.productId, item.color, item.size, item.quantity - 1)} className="px-2 py-1 text-gray-600 hover:text-gray-900 text-sm">−</button>
              <span className="px-3 py-1 text-sm font-medium">{item.quantity}</span>
              <button onClick={() => updateQuantity(item.productId, item.color, item.size, item.quantity + 1)} className="px-2 py-1 text-gray-600 hover:text-gray-900 text-sm">+</button>
            </div>

            <div className="text-right shrink-0 w-20">
              <span className="font-bold text-gray-900">{(item.price * item.quantity).toFixed(2)} €</span>
            </div>

            <button onClick={() => removeItem(item.productId, item.color, item.size)} className="text-gray-400 hover:text-red-500 transition-colors shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Suma */}
      <div className="mt-8 bg-gray-50 border border-gray-200 rounded-xl p-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Prekės</span>
          <span>{totalPrice().toFixed(2)} €</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600 mb-4">
          <span>Pristatymas</span>
          <span>{shippingCost === 0 ? "Nemokamas" : `${shippingCost.toFixed(2)} €`}</span>
        </div>
        {shippingCost > 0 && (
          <p className="text-xs text-emerald-600 mb-4">
            Nemokamas pristatymas nuo 50 € (trūksta {(50 - totalPrice()).toFixed(2)} €)
          </p>
        )}
        <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
          <span className="text-lg font-bold text-gray-900">Viso</span>
          <span className="text-2xl font-bold text-gray-900">{(totalPrice() + shippingCost).toFixed(2)} €</span>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={clearCart} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm">
            Išvalyti
          </button>
          <Link href="/checkout" className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-lg text-center transition-colors">
            Pereiti prie apmokėjimo
          </Link>
        </div>
      </div>
    </div>
  );
}

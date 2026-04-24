"use client";

/**
 * Krepšelio puslapis — /krepselis
 *
 * Sprint 4.2 atkūrimas (senas failas buvo nupjautas ant emoji 🛒).
 *
 * Dizainas (TRUEWERK DNR):
 *   - Cream fonas, Space Grotesk antraštės, oranžinis akcentas
 *   - Tuščio krepšelio būsena — centruotas pakvietimas naršyti
 *   - Prekių sąrašas — balta kortelė su produkto foto, info ir veiksmais
 *   - Sumos blokas — aiškus su subtotal, pristatymu ir bendra suma
 *
 * Logika (iš seno cartStore — nekeista):
 *   - updateQuantity — min 1, max = maxStock (jei norėsim min 10 visiems —
 *     atskiras Sprint 4.3)
 *   - removeItem — spustelėjus × mygtuką
 *   - clearCart — spustelėjus „Išvalyti"
 *   - Pristatymas nemokamas nuo 50 €
 */

import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/lib/cartStore";
import { Button } from "@/components/primitives/Button";

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalPrice } =
    useCartStore();

  const subtotal = totalPrice();
  const shippingCost = subtotal >= 50 ? 0 : 4.99;
  const grandTotal = subtotal + shippingCost;

  // Tuščias krepšelis
  if (items.length === 0) {
    return (
      <div className="bg-paper min-h-screen">
        <div className="container-content py-16 lg:py-24">
          <div className="max-w-lg mx-auto text-center">
            <div className="flex items-center gap-2 justify-center mb-4">
              <span className="w-8 h-px bg-accent" aria-hidden="true" />
              <span className="text-xs font-display font-medium uppercase tracking-widest text-accent">
                Krepšelis
              </span>
              <span className="w-8 h-px bg-accent" aria-hidden="true" />
            </div>

            <h1
              className="text-3xl lg:text-4xl font-display font-semibold tracking-tight mb-4"
              style={{ color: "var(--color-ink)" }}
            >
              Krepšelis tuščias
            </h1>

            <p className="text-base text-muted mb-8">
              Dar nieko nepasirinkote. Peržiūrėkite mūsų asortimentą — nuo 10
              vnt. pradedame darbą su jūsų logotipu.
            </p>

            <Link href="/">
              <Button intent="primary" size="lg">
                Grįžti į pradžią
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Krepšelyje yra prekių
  return (
    <div className="bg-paper min-h-screen">
      <div className="container-content py-8 lg:py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs mb-6">
          <Link
            href="/"
            className="font-display uppercase tracking-widest text-muted hover:text-accent transition-colors"
          >
            Pradžia
          </Link>
          <span className="text-line-strong">/</span>
          <span className="font-display uppercase tracking-widest text-ink">
            Krepšelis
          </span>
        </nav>

        {/* Antraštė */}
        <div className="mb-8 lg:mb-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-8 h-px bg-accent" aria-hidden="true" />
            <span className="text-xs font-display font-medium uppercase tracking-widest text-accent">
              Jūsų pasirinkimas
            </span>
          </div>
          <h1
            className="text-3xl lg:text-4xl font-display font-semibold tracking-tight"
            style={{ color: "var(--color-ink)" }}
          >
            Krepšelis
          </h1>
          <p className="mt-2 text-sm text-muted font-display uppercase tracking-wider">
            {items.length} {items.length === 1 ? "prekė" : "prekės"} ·{" "}
            {items.reduce((sum, i) => sum + i.quantity, 0)} vnt.
          </p>
        </div>

        {/* Layout: prekių sąrašas + sumos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          {/* Prekių sąrašas */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.color}-${item.size}`}
                className="bg-white border border-line rounded-md p-4 flex gap-4"
              >
                {/* Foto */}
                <Link
                  href={`/produktas/${item.slug}`}
                  className="relative w-24 h-24 lg:w-28 lg:h-28 bg-paper-soft rounded-sm overflow-hidden flex-shrink-0"
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="absolute inset-0 w-full h-full object-contain p-2"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-line-strong">
                      <span className="text-2xl font-display font-bold">
                        {item.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <Link
                        href={`/produktas/${item.slug}`}
                        className="font-display font-semibold text-base text-ink hover:text-accent transition-colors block truncate"
                      >
                        {item.name}
                      </Link>
                      <p className="text-xs font-display uppercase tracking-wider text-muted mt-1">
                        <span>{item.color}</span>
                        <span className="mx-1">·</span>
                        <span>{item.size}</span>
                      </p>
                    </div>

                    {/* Pašalinti */}
                    <button
                      onClick={() =>
                        removeItem(item.productId, item.color, item.size)
                      }
                      className="flex-shrink-0 p-1 text-muted hover:text-error transition-colors"
                      aria-label="Pašalinti iš krepšelio"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18 18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Kiekio stepper + kaina */}
                  <div className="flex items-end justify-between gap-2 mt-3">
                    <div className="flex items-center border border-line-strong rounded-sm bg-white">
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.color,
                            item.size,
                            item.quantity - 1
                          )
                        }
                        className="px-3 py-1.5 text-ink hover:text-accent transition-colors font-display font-semibold"
                        aria-label="Sumažinti kiekį"
                      >
                        −
                      </button>
                      <span className="px-3 py-1.5 text-sm font-display font-semibold min-w-10 text-center border-x border-line-strong text-ink">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.color,
                            item.size,
                            item.quantity + 1
                          )
                        }
                        className="px-3 py-1.5 text-ink hover:text-accent transition-colors font-display font-semibold"
                        aria-label="Padidinti kiekį"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] font-display uppercase tracking-widest text-muted">
                        Suma
                      </div>
                      <div className="text-lg font-display font-semibold text-accent">
                        {(item.price * item.quantity).toFixed(2)} €
                      </div>
                      <div className="text-[10px] text-muted font-display">
                        {item.price.toFixed(2)} € / vnt.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Išvalyti krepšelį */}
            <div className="pt-4">
              <button
                onClick={clearCart}
                className="text-xs font-display uppercase tracking-widest text-muted hover:text-error transition-colors"
              >
                Išvalyti visą krepšelį
              </button>
            </div>
          </div>

          {/* Sumos blokas — sticky */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 bg-white border border-line rounded-md p-6">
              <h2
                className="text-lg font-display font-semibold mb-4"
                style={{ color: "var(--color-ink)" }}
              >
                Užsakymo suvestinė
              </h2>

              <div className="space-y-3 mb-5 pb-5 border-b border-line">
                <div className="flex justify-between text-sm font-display">
                  <span className="text-muted">Prekės</span>
                  <span className="text-ink font-semibold">
                    {subtotal.toFixed(2)} €
                  </span>
                </div>
                <div className="flex justify-between text-sm font-display">
                  <span className="text-muted">Pristatymas</span>
                  <span className="text-ink font-semibold">
                    {shippingCost === 0
                      ? "Nemokamas"
                      : `${shippingCost.toFixed(2)} €`}
                  </span>
                </div>
                {shippingCost > 0 && (
                  <p className="text-xs text-muted leading-relaxed">
                    Nemokamas pristatymas nuo 50 € — trūksta dar{" "}
                    <strong className="text-accent">
                      {(50 - subtotal).toFixed(2)} €
                    </strong>
                  </p>
                )}
              </div>

              <div className="flex justify-between items-baseline mb-6">
                <span className="text-sm font-display font-semibold uppercase tracking-widest text-ink">
                  Viso
                </span>
                <span className="text-2xl font-display font-semibold text-accent">
                  {grandTotal.toFixed(2)} €
                </span>
              </div>

              <Link href="/checkout" className="block">
                <Button intent="primary" size="lg" fullWidth>
                  Pereiti prie apmokėjimo
                </Button>
              </Link>

              <Link
                href="/"
                className="block text-center mt-4 text-xs font-display uppercase tracking-widest text-muted hover:text-accent transition-colors"
              >
                Tęsti apsipirkimą
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

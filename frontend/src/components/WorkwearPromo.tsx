"use client";

/**
 * WorkwearPromo — specializuotų darbo drabužių promo blokas homepage'e.
 *
 * Dizainas (Sprint 2.3 — TRUEWERK DNR):
 *   - `bg-ink` tamsus fonas — sukuria vizualinį ritmą vs cream aplinka,
 *     paryškina šią sekciją kaip svarbią B2B klientams (HORECA, pramonė…)
 *   - Oranžinis `#D0591E` akcentas (ne amber kaip anksčiau)
 *   - Viršutinė/apatinė oranžinė linija — dera su Hero stats juosta
 *   - BE auto-rotate — statinis, aiškus, nesiblaškantis
 *   - 4 kategorijos kaip maži chip'ai (ne milžiniški apskritimai)
 *   - Produktų grid su realiais foto iš backend'o (4 kol, 8 produktai)
 *   - Framer Motion scroll reveal — dera su kitomis sekcijomis
 *
 * Duomenys:
 *   - `products` — jau prefiltruoti iš page.tsx (tik darbo drabužių kategorijos)
 *   - Rodome pirmus 8 — daugiau paraginama per CTA mygtuką
 */

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "./primitives/Button";

interface WorkwearPromoProps {
  products: any[];
}

// Subkategorijos — maži chip'ai po headline'ine
const subcategories = [
  { name: "HORECA", slug: "horeca" },
  { name: "Signaliniai", slug: "signaliniai-drabuziai" },
  { name: "Pramonė", slug: "pramone" },
  { name: "Medicina", slug: "medicina-ir-grozis" },
];

export default function WorkwearPromo({ products }: WorkwearPromoProps) {
  // Rodome pirmus 8 produktus — gražus 4x2 grid'as desktop'e
  const featured = products.slice(0, 8);

  return (
    <section
      className="relative overflow-hidden"
      style={{ backgroundColor: "var(--color-ink)" }}
      aria-labelledby="workwear-heading"
    >
      {/* Viršutinė oranžinė linija */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ backgroundColor: "var(--color-accent)" }}
        aria-hidden="true"
      />

      <div className="container-content py-16 lg:py-24">
        {/* Antraštės dalis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl mb-10 lg:mb-14"
        >
          <div className="flex items-center gap-2 mb-3">
            <span
              className="w-8 h-px"
              style={{ backgroundColor: "var(--color-accent)" }}
              aria-hidden="true"
            />
            <span className="text-xs font-display font-medium uppercase tracking-widest text-accent">
              Specializuotos kategorijos
            </span>
          </div>
          <h2
            id="workwear-heading"
            className="text-4xl lg:text-5xl font-display font-semibold tracking-tight mb-4"
            style={{ color: "var(--color-paper)" }}
          >
            Darbo drabužiai.
          </h2>
          <p
            className="text-base lg:text-lg leading-relaxed"
            style={{ color: "rgba(245, 242, 234, 0.65)" }}
          >
            Saugūs ir patogūs drabužiai profesionalams. Kiekvienai darbo
            aplinkai — nuo statybviečių iki restoranų virtuvių.
          </p>
        </motion.div>

        {/* Subkategorijų chip'ai */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{
            duration: 0.5,
            delay: 0.1,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="flex flex-wrap gap-2 mb-10 lg:mb-12"
        >
          {subcategories.map((sub) => (
            <Link
              key={sub.slug}
              href={`/kategorija/${sub.slug}`}
              className="inline-flex items-center px-4 py-2 text-xs font-display font-medium uppercase tracking-widest rounded-sm border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              style={{
                color: "var(--color-paper)",
                borderColor: "rgba(245, 242, 234, 0.2)",
                backgroundColor: "transparent",
              }}
            >
              <span className="hover:text-accent transition-colors">
                {sub.name}
              </span>
            </Link>
          ))}
        </motion.div>

        {/* Produktų grid'as — 2 kol mobile, 4 desktop */}
        {featured.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{
              duration: 0.5,
              delay: 0.2,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-10 lg:mb-12"
          >
            {featured.map((p: any) => (
              <Link
                key={p.id}
                href={`/produktas/${p.slug}`}
                className="group block rounded-sm overflow-hidden transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                style={{ backgroundColor: "var(--color-graphite)" }}
              >
                {/* Foto konteineris — baltas fonas */}
                <div className="relative aspect-square bg-white overflow-hidden">
                  {p.images?.[0]?.url && (
                    <img
                      src={p.images[0].url}
                      alt={p.name}
                      className="absolute inset-0 w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-500 ease-out"
                      loading="lazy"
                    />
                  )}
                </div>

                {/* Info apačioje */}
                <div className="p-3 lg:p-4">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span
                      className="text-sm font-display font-semibold truncate"
                      style={{ color: "var(--color-paper)" }}
                    >
                      {p.name}
                    </span>
                    <span
                      className="text-[10px] font-display uppercase tracking-wider flex-shrink-0"
                      style={{ color: "rgba(245, 242, 234, 0.4)" }}
                    >
                      {p.sku}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-display font-semibold text-accent">
                      {parseFloat(p.price).toFixed(2)} €
                    </span>
                    {p.comparePrice && (
                      <span
                        className="text-[10px] line-through"
                        style={{ color: "rgba(245, 242, 234, 0.3)" }}
                      >
                        {parseFloat(p.comparePrice).toFixed(2)} €
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </motion.div>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{
            duration: 0.5,
            delay: 0.3,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="flex justify-center"
        >
          <Link href="/kategorija/darbo-drabuziai">
            <Button
              intent="primary"
              size="lg"
              iconRight={
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              }
            >
              Peržiūrėti visus darbo drabužius
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Apatinė oranžinė linija */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ backgroundColor: "var(--color-accent)" }}
        aria-hidden="true"
      />
    </section>
  );
}

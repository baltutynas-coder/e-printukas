"use client";

/**
 * CategoryBento — pagrindinis kategorijų pasirinkimo blokas.
 *
 * Dizaino strategija (TRUEWERK-inspired):
 *   - Tipografinis dizainas be foto (banner'iai nesiderino su aprašymais)
 *   - Tamsus gradient + dideli numeriai (01, 02…) + didelė tipografija
 *   - Kas antra kortelė gauna oranžinį blob hover metu
 *
 * Techninė pastaba:
 *   - h3 naudojame inline style vietoj text-paper Tailwind klasės, nes
 *     globals.css turi `h1-h6 { color: var(--color-ink); }` taisyklę, kurios
 *     specificity aukštesnis už utility klasę. Inline stilius turi aukščiausią
 *     specificity ir patikimai override'ina.
 */

import Link from "next/link";
import { motion } from "framer-motion";

export interface BentoCategory {
  id: string;
  name: string;
  slug: string;
  productCount?: number;
}

const descriptions: Record<string, string> = {
  "marskineliai-ir-polo": "Klasikiniai, polo, sportiniai, su V apykakle",
  dzemperiai: "Su gobtuvu, su užtrauktuku, klasikiniai džemperiai",
  striukes: "Žieminės, pavasarinės, softshell, liemenės",
  "sportine-kolekcija": "Komandoms, treniruotėms, aktyviam gyvenimui",
  kelnes: "Darbo, sportinės, klasikinės kelnės",
  "darbo-drabuziai": "HORECA, pramonė, medicina, signaliniai",
};

const priorityOrder = [
  "marskineliai-ir-polo",
  "dzemperiai",
  "striukes",
  "sportine-kolekcija",
  "kelnes",
  "darbo-drabuziai",
];

interface CategoryBentoProps {
  categories: BentoCategory[];
}

export default function CategoryBento({ categories }: CategoryBentoProps) {
  const sortedCategories = [...categories]
    .filter((cat) => priorityOrder.includes(cat.slug))
    .sort(
      (a, b) =>
        priorityOrder.indexOf(a.slug) - priorityOrder.indexOf(b.slug)
    )
    .slice(0, 6);

  if (sortedCategories.length === 0) return null;

  return (
    <section
      className="bg-paper py-16 lg:py-24"
      aria-labelledby="categories-heading"
    >
      <div className="container-content">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10 lg:mb-14"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="w-8 h-px bg-accent" aria-hidden="true" />
            <span className="text-xs font-display font-medium uppercase tracking-widest text-accent">
              Pirkti pagal kategoriją
            </span>
          </div>
          <h2
            id="categories-heading"
            className="text-4xl lg:text-5xl font-display font-semibold tracking-tight"
            style={{ color: "var(--color-ink)" }}
          >
            Raskite, ko reikia.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedCategories.map((cat, index) => {
            const hasAccent = index % 2 === 0;
            const number = String(index + 1).padStart(2, "0");
            const description = descriptions[cat.slug] || "";

            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.06,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <Link
                  href={`/kategorija/${cat.slug}`}
                  className="group relative block overflow-hidden aspect-[4/5] bg-graphite rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
                >
                  {/* Tamsus gradient fonas */}
                  <div
                    className="absolute inset-0 bg-gradient-to-br from-graphite via-ink to-ink"
                    aria-hidden="true"
                  />

                  {/* Oranžinis blob'as hover metu — kas antrai kortelei */}
                  {hasAccent && (
                    <div
                      className="absolute -top-20 -right-20 w-64 h-64 bg-accent/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      aria-hidden="true"
                    />
                  )}

                  {/* Viršutinė linija — pasikeičia ant hover */}
                  <div
                    className="absolute top-0 left-0 right-0 h-px bg-graphite group-hover:bg-accent transition-colors duration-300"
                    aria-hidden="true"
                  />

                  {/* Didelis numeris viršuje */}
                  <span
                    className="absolute top-6 right-6 text-5xl font-display font-bold group-hover:text-accent/20 transition-colors duration-500 select-none"
                    style={{ color: "rgba(245, 242, 234, 0.05)" }}
                    aria-hidden="true"
                  >
                    {number}
                  </span>

                  {/* Turinys apačioje */}
                  <div className="absolute inset-0 p-6 lg:p-7 flex flex-col justify-end">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-6 h-px bg-accent" aria-hidden="true" />
                      {cat.productCount !== undefined && cat.productCount > 0 ? (
                        <span className="text-[10px] font-display font-medium uppercase tracking-widest text-accent">
                          {cat.productCount} produktų
                        </span>
                      ) : (
                        <span className="text-[10px] font-display font-medium uppercase tracking-widest text-accent">
                          Kategorija {number}
                        </span>
                      )}
                    </div>

                    {/* H3 su inline spalva — override'ina globals.css reset */}
                    <h3
                      className="text-2xl lg:text-3xl font-display font-semibold leading-tight mb-2"
                      style={{ color: "var(--color-paper)" }}
                    >
                      {cat.name}
                    </h3>

                    {description && (
                      <p
                        className="text-sm mb-4 line-clamp-2"
                        style={{ color: "rgba(232, 228, 220, 0.7)" }}
                      >
                        {description}
                      </p>
                    )}

                    <div className="flex items-center gap-2 text-xs font-display font-medium uppercase tracking-widest text-accent">
                      <span>Peržiūrėti</span>
                      <svg
                        className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300"
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
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

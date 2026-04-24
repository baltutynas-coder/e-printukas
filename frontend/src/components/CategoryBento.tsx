"use client";

/**
 * CategoryBento — kategorijų grid homepage'e.
 *
 * Dizainas:
 *   - Šviesios kortelės (paper-soft), foto viršuje (4:3), tekstas apačioje
 *   - Realios produktų nuotraukos iš backend'o
 *   - Hover: border → oranžinis, foto padidėja
 *
 * Įtrauktos kategorijos (tos, kurios turi produktų backend'e):
 *   - Marškinėliai ir polo (74)
 *   - Džemperiai (20)
 *   - Sportinė kolekcija (38)
 *   - Kelnės (38)
 *   - Darbo drabužiai (54)
 *   - Eco (6)
 *   - Kiti produktai (15)
 *
 * Striukės ir paltai — kol nėra produktų DB'e, ši kategorija nerodoma.
 * Kai striukės bus įkeltos per admin panelę, jos atsiras automatiškai.
 */

import Link from "next/link";
import { motion } from "framer-motion";

export interface BentoCategory {
  id: string;
  name: string;
  slug: string;
  productCount?: number;
  heroImage?: string;
  heroProductName?: string;
}

// Aprašymai kiekvienai kategorijai — rodomi po pavadinimu
const descriptions: Record<string, string> = {
  "marskineliai-ir-polo": "Klasikiniai, polo, sportiniai, su V apykakle",
  dzemperiai: "Su gobtuvu, su užtrauktuku, klasikiniai džemperiai",
  "sportine-kolekcija": "Komandoms, treniruotėms, aktyviam gyvenimui",
  kelnes: "Darbo, sportinės, klasikinės kelnės",
  "darbo-drabuziai": "HORECA, pramonė, medicina, signaliniai",
  eco: "Ekologiška tekstilė iš atsakingų šaltinių",
  "kiti-produktai": "Avalynė, aksesuarai ir kiti produktai",
};

// Prioritetinis rikiavimas — svarbiausios pirma (TOP 6 bus rodoma)
const priorityOrder = [
  "marskineliai-ir-polo",
  "dzemperiai",
  "sportine-kolekcija",
  "kelnes",
  "darbo-drabuziai",
  "eco",
  "kiti-produktai",
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {sortedCategories.map((cat, index) => {
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
                  className="group relative block bg-paper-soft border border-line rounded-md overflow-hidden transition-all duration-300 hover:border-accent hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
                >
                  {/* Foto konteineris su baltu fonu */}
                  <div className="relative aspect-[4/3] bg-white overflow-hidden">
                    {cat.heroImage ? (
                      <img
                        src={cat.heroImage}
                        alt={cat.heroProductName || cat.name}
                        className="absolute inset-0 w-full h-full object-contain p-8 group-hover:scale-105 transition-transform duration-500 ease-out"
                        loading="lazy"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-paper-soft to-paper">
                        <span
                          className="text-6xl font-display font-bold select-none"
                          style={{ color: "rgba(14, 14, 14, 0.1)" }}
                        >
                          {cat.name.charAt(0)}
                        </span>
                      </div>
                    )}

                    {/* Produktų skaičius badge */}
                    {cat.productCount !== undefined && cat.productCount > 0 && (
                      <div className="absolute top-3 right-3 bg-ink text-paper px-2.5 py-1 rounded-sm">
                        <span className="text-[10px] font-display font-medium uppercase tracking-widest">
                          {cat.productCount} produktai
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Tekstas apačioje */}
                  <div className="p-5 lg:p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-6 h-px bg-accent" aria-hidden="true" />
                      <span className="text-[10px] font-display font-medium uppercase tracking-widest text-accent">
                        Kategorija
                      </span>
                    </div>

                    <h3
                      className="text-xl lg:text-2xl font-display font-semibold leading-tight mb-2"
                      style={{ color: "var(--color-ink)" }}
                    >
                      {cat.name}
                    </h3>

                    {description && (
                      <p
                        className="text-sm mb-4 line-clamp-2"
                        style={{ color: "var(--color-muted)" }}
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

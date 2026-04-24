"use client";

/**
 * Kategorijos puslapis — /kategorija/[slug]
 *
 * Sprint 3.2 pokyčiai (galutiniai):
 *
 * CORS FIX:
 *   - Dabar naudojam /api/backend/... proxy route'ą vietoj tiesioginių
 *     Railway URL'ų. Next.js serveryje handler'is perduoda request'us į
 *     Railway, browser'ui atrodo, kad fetch'ai iš to paties origin'o
 *
 * SUBCATEGORY FIX:
 *   - Naudojam SUBCATEGORY_MAP (kaip homepage'e) — tėvinei kategorijai
 *     fetch'inam visas subkategorijas atskirai, apjungiam
 *
 * TRUEWERK DIZAINAS:
 *   - Cream fonas, Space Grotesk, oranžinis akcentas
 *   - Real kategorijos pavadinimas (ne slug'as)
 *   - Realūs produktų skaičiai
 *   - Sticky filtrų šoninė juosta
 */

import ProductGrid from "@/components/ProductGrid";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
}

const SUBCATEGORY_MAP: Record<string, string[]> = {
  "marskineliai-ir-polo": ["marskineliai", "polo-marskineliai"],
  dzemperiai: ["su-gobtuvu", "megztiniai"],
  "sportine-kolekcija": [
    "sportiniai-marskineliai",
    "sportines-kelnes",
    "sportiniai-komplektai",
  ],
  kelnes: ["kelnes"],
  "darbo-drabuziai": [
    "horeca",
    "signaliniai-drabuziai",
    "medicina-ir-grozis",
    "pramone",
  ],
  eco: ["eco"],
  "kiti-produktai": ["avalyne"],
};

const COLOR_CODES: Record<string, string> = {
  "#FFFFFF": "01", "#000000": "02", "#001D43": "55", "#DC002E": "60",
  "#0060A9": "05", "#C4DDF1": "86", "#00A0D1": "12", "#008F4F": "83",
  "#004237": "56", "#51A025": "264", "#F08927": "31", "#FFE400": "03",
  "#C4C4C4": "58", "#484E41": "46", "#DC006B": "78", "#F8CCD5": "48",
  "#750D68": "71", "#8C1713": "57", "#573D2A": "67", "#4C6781": "231",
  "#F5F0E1": "132", "#722F37": "116", "#6B7532": "15", "#F0786B": "169",
  "#3D3D3D": "38",
};

const GENDER_MAP: Record<string, string> = {
  MEN: "Vyrams",
  WOMEN: "Moterims",
  UNISEX: "Unisex",
  CHILDREN: "Vaikams",
};

export default function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [slug, setSlug] = useState("");
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("default");

  const [sectionsOpen, setSectionsOpen] = useState({
    sizes: true,
    colors: true,
    types: false,
  });

  useEffect(() => {
    params.then((p) => setSlug(p.slug));
  }, [params]);

  // Per /api/backend/ proxy — ne tiesiai į Railway
  useEffect(() => {
    fetch("/api/backend/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!slug) return;

    setLoading(true);
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedGenders([]);

    const subcategorySlugs = SUBCATEGORY_MAP[slug];
    const slugsToFetch =
      subcategorySlugs && subcategorySlugs.length > 0
        ? subcategorySlugs
        : [slug];

    Promise.all(
      slugsToFetch.map((s) =>
        fetch(`/api/backend/products?category=${s}&limit=100`)
          .then((r) => r.json())
          .then((d) => d.products || [])
          .catch(() => [])
      )
    ).then((results) => {
      const merged = results.flat();
      const unique = Array.from(
        new Map(merged.map((p: any) => [p.id, p])).values()
      );
      const withImages = unique.filter(
        (p: any) => p.images && p.images.length > 0
      );
      setAllProducts(withImages);
      setLoading(false);
    });
  }, [slug]);

  const currentCategory = useMemo(() => {
    if (!slug || categories.length === 0) return null;
    return categories.find((c) => c.slug === slug) || null;
  }, [slug, categories]);

  const categoryName = currentCategory?.name || slug;
  const parentCategories = useMemo(
    () => categories.filter((c) => !c.parentId),
    [categories]
  );

  const availableSizes = useMemo(() => {
    const sizes = new Set<string>();
    allProducts.forEach((p) =>
      p.variants?.forEach((v: any) => sizes.add(v.size))
    );
    const order = [
      "XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL",
      "3/4", "5/6", "7/8", "9/10", "11/12",
    ];
    return [...sizes].sort(
      (a, b) =>
        (order.indexOf(a) === -1 ? 99 : order.indexOf(a)) -
        (order.indexOf(b) === -1 ? 99 : order.indexOf(b))
    );
  }, [allProducts]);

  const availableColors = useMemo(() => {
    const colorMap = new Map<string, { name: string; hex: string }>();
    allProducts.forEach((p) =>
      p.variants?.forEach((v: any) => {
        if (!colorMap.has(v.colorHex)) {
          colorMap.set(v.colorHex, { name: v.color, hex: v.colorHex });
        }
      })
    );
    return [...colorMap.values()];
  }, [allProducts]);

  const availableGenders = useMemo(() => {
    const genders = new Set<string>();
    allProducts.forEach((p) => {
      if (p.gender) genders.add(p.gender);
    });
    return [...genders];
  }, [allProducts]);

  const sizeProductCount = useMemo(() => {
    const counts: Record<string, number> = {};
    allProducts.forEach((p) => {
      const sizes = new Set<string>();
      p.variants?.forEach((v: any) => sizes.add(v.size));
      sizes.forEach((s) => {
        counts[s] = (counts[s] || 0) + 1;
      });
    });
    return counts;
  }, [allProducts]);

  const colorProductCount = useMemo(() => {
    const counts: Record<string, number> = {};
    allProducts.forEach((p) => {
      const colors = new Set<string>();
      p.variants?.forEach((v: any) => colors.add(v.colorHex));
      colors.forEach((c) => {
        counts[c] = (counts[c] || 0) + 1;
      });
    });
    return counts;
  }, [allProducts]);

  const genderProductCount = useMemo(() => {
    const counts: Record<string, number> = {};
    allProducts.forEach((p) => {
      if (p.gender) counts[p.gender] = (counts[p.gender] || 0) + 1;
    });
    return counts;
  }, [allProducts]);

  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    if (selectedSizes.length > 0) {
      result = result.filter((p) =>
        p.variants?.some((v: any) => selectedSizes.includes(v.size))
      );
    }

    if (selectedColors.length > 0) {
      result = result.filter((p) =>
        p.variants?.some((v: any) => selectedColors.includes(v.colorHex))
      );
    }

    if (selectedGenders.length > 0) {
      result = result.filter((p) => selectedGenders.includes(p.gender));
    }

    if (sortBy === "name") result.sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === "price_asc")
      result.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    if (sortBy === "price_desc")
      result.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));

    return result;
  }, [allProducts, selectedSizes, selectedColors, selectedGenders, sortBy]);

  const toggleSize = (s: string) =>
    setSelectedSizes((p) =>
      p.includes(s) ? p.filter((x) => x !== s) : [...p, s]
    );
  const toggleColor = (h: string) =>
    setSelectedColors((p) =>
      p.includes(h) ? p.filter((x) => x !== h) : [...p, h]
    );
  const toggleGender = (g: string) =>
    setSelectedGenders((p) =>
      p.includes(g) ? p.filter((x) => x !== g) : [...p, g]
    );
  const clearAllFilters = () => {
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedGenders([]);
  };
  const toggleSection = (s: keyof typeof sectionsOpen) =>
    setSectionsOpen((p) => ({ ...p, [s]: !p[s] }));

  const hasActiveFilters =
    selectedSizes.length > 0 ||
    selectedColors.length > 0 ||
    selectedGenders.length > 0;

  return (
    <div className="bg-paper min-h-screen">
      <div className="container-content py-8 lg:py-12">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs mb-6">
          <Link
            href="/"
            className="font-display uppercase tracking-widest text-muted hover:text-accent transition-colors"
          >
            Pradžia
          </Link>
          <span className="text-line-strong">/</span>
          <span className="font-display uppercase tracking-widest text-ink">
            {categoryName}
          </span>
        </nav>

        {/* Antraštė ir rūšiavimas */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8 lg:mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-8 h-px bg-accent" aria-hidden="true" />
              <span className="text-xs font-display font-medium uppercase tracking-widest text-accent">
                Kategorija
              </span>
            </div>
            <h1
              className="text-4xl lg:text-5xl font-display font-semibold tracking-tight"
              style={{ color: "var(--color-ink)" }}
            >
              {categoryName}
            </h1>
            <p className="mt-2 text-sm text-muted font-display uppercase tracking-wider">
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1 ? "produktas" : "produktai"}
              {hasActiveFilters && ` iš ${allProducts.length}`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label
              htmlFor="sort"
              className="text-xs font-display font-medium uppercase tracking-widest text-muted"
            >
              Rūšiuoti:
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm font-display border border-line-strong rounded-sm px-3 py-2 bg-white focus:outline-none focus:border-accent transition-colors"
              style={{ color: "var(--color-ink)" }}
            >
              <option value="default">Rekomenduojama</option>
              <option value="name">Pavadinimas (A-Z)</option>
              <option value="price_asc">Kaina (mažiausia)</option>
              <option value="price_desc">Kaina (didžiausia)</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
          {/* Filtrai */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="lg:sticky lg:top-24">
              {hasActiveFilters && (
                <div className="mb-6 pb-4 border-b border-line">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-display font-medium uppercase tracking-widest text-ink">
                      Aktyvūs filtrai
                    </span>
                    <button
                      onClick={clearAllFilters}
                      className="text-xs font-display uppercase tracking-wider text-accent hover:underline"
                    >
                      Išvalyti
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {selectedSizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => toggleSize(s)}
                        className="inline-flex items-center gap-1 text-[10px] font-display uppercase tracking-wider px-2 py-1 bg-ink text-paper rounded-sm hover:bg-accent transition-colors"
                      >
                        {s} ×
                      </button>
                    ))}
                    {selectedColors.map((h) => (
                      <button
                        key={h}
                        onClick={() => toggleColor(h)}
                        className="inline-flex items-center gap-1 text-[10px] font-display uppercase tracking-wider px-2 py-1 bg-ink text-paper rounded-sm hover:bg-accent transition-colors"
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: h }}
                        />
                        ×
                      </button>
                    ))}
                    {selectedGenders.map((g) => (
                      <button
                        key={g}
                        onClick={() => toggleGender(g)}
                        className="inline-flex items-center gap-1 text-[10px] font-display uppercase tracking-wider px-2 py-1 bg-ink text-paper rounded-sm hover:bg-accent transition-colors"
                      >
                        {GENDER_MAP[g] || g} ×
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-6 pb-5 border-b border-line">
                <button
                  onClick={() => toggleSection("sizes")}
                  className="w-full flex items-center justify-between mb-3"
                >
                  <span className="text-sm font-display font-semibold uppercase tracking-widest text-ink">
                    Dydžiai
                  </span>
                  <span className="text-muted text-lg leading-none">
                    {sectionsOpen.sizes ? "−" : "+"}
                  </span>
                </button>
                {sectionsOpen.sizes && (
                  <div className="space-y-1">
                    {availableSizes.map((size) => {
                      const count = sizeProductCount[size] || 0;
                      const isSelected = selectedSizes.includes(size);
                      return (
                        <button
                          key={size}
                          onClick={() => toggleSize(size)}
                          className="flex items-center gap-2 text-xs font-display w-full text-left py-1 hover:text-accent transition-colors"
                          style={{
                            color: isSelected
                              ? "var(--color-accent)"
                              : "var(--color-ink)",
                          }}
                        >
                          <span
                            className="w-4 h-4 border flex items-center justify-center text-[9px] flex-shrink-0 rounded-sm"
                            style={{
                              borderColor: isSelected
                                ? "var(--color-accent)"
                                : "var(--color-line-strong)",
                              backgroundColor: isSelected
                                ? "var(--color-accent)"
                                : "transparent",
                              color: "white",
                            }}
                          >
                            {isSelected && "✓"}
                          </span>
                          <span className="flex-1 uppercase tracking-wider">
                            {size}
                          </span>
                          <span className="text-[10px] text-muted">{count}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="mb-6 pb-5 border-b border-line">
                <button
                  onClick={() => toggleSection("colors")}
                  className="w-full flex items-center justify-between mb-3"
                >
                  <span className="text-sm font-display font-semibold uppercase tracking-widest text-ink">
                    Spalvos
                  </span>
                  <span className="text-muted text-lg leading-none">
                    {sectionsOpen.colors ? "−" : "+"}
                  </span>
                </button>
                {sectionsOpen.colors && (
                  <div className="flex flex-wrap gap-3">
                    {availableColors.map((c) => {
                      const code = COLOR_CODES[c.hex.toUpperCase()] || "";
                      const count = colorProductCount[c.hex] || 0;
                      const isSelected = selectedColors.includes(c.hex);
                      return (
                        <button
                          key={c.hex}
                          onClick={() => toggleColor(c.hex)}
                          title={`${c.name} (${count})`}
                          className="flex flex-col items-center gap-1"
                        >
                          <span
                            className={`w-8 h-8 rounded-full transition-all ${
                              isSelected
                                ? "ring-2 ring-accent ring-offset-2 ring-offset-paper scale-110"
                                : "border border-line-strong hover:scale-105"
                            }`}
                            style={{ backgroundColor: c.hex }}
                          />
                          <span
                            className="text-[9px] leading-none font-display"
                            style={{
                              color: isSelected
                                ? "var(--color-accent)"
                                : "var(--color-muted)",
                            }}
                          >
                            {code || "·"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {availableGenders.length > 0 && (
                <div className="mb-6 pb-5 border-b border-line">
                  <button
                    onClick={() => toggleSection("types")}
                    className="w-full flex items-center justify-between mb-3"
                  >
                    <span className="text-sm font-display font-semibold uppercase tracking-widest text-ink">
                      Tipas
                    </span>
                    <span className="text-muted text-lg leading-none">
                      {sectionsOpen.types ? "−" : "+"}
                    </span>
                  </button>
                  {sectionsOpen.types && (
                    <div className="space-y-1">
                      {availableGenders.map((g) => {
                        const count = genderProductCount[g] || 0;
                        const isSelected = selectedGenders.includes(g);
                        return (
                          <button
                            key={g}
                            onClick={() => toggleGender(g)}
                            className="flex items-center gap-2 text-xs font-display w-full text-left py-1 hover:text-accent transition-colors"
                            style={{
                              color: isSelected
                                ? "var(--color-accent)"
                                : "var(--color-ink)",
                            }}
                          >
                            <span
                              className="w-4 h-4 border flex items-center justify-center text-[9px] flex-shrink-0 rounded-sm"
                              style={{
                                borderColor: isSelected
                                  ? "var(--color-accent)"
                                  : "var(--color-line-strong)",
                                backgroundColor: isSelected
                                  ? "var(--color-accent)"
                                  : "transparent",
                                color: "white",
                              }}
                            >
                              {isSelected && "✓"}
                            </span>
                            <span className="flex-1 uppercase tracking-wider">
                              {GENDER_MAP[g] || g}
                            </span>
                            <span className="text-[10px] text-muted">
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              <div>
                <span className="text-sm font-display font-semibold uppercase tracking-widest text-ink block mb-3">
                  Kitos kategorijos
                </span>
                <div className="space-y-1">
                  {parentCategories
                    .filter((c) => c.slug !== slug)
                    .slice(0, 6)
                    .map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/kategorija/${cat.slug}`}
                        className="block text-xs font-display uppercase tracking-wider text-muted hover:text-accent transition-colors py-1"
                      >
                        {cat.name}
                      </Link>
                    ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Produktai */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="text-center py-20">
                <p className="text-lg font-display text-muted">Kraunama...</p>
              </div>
            ) : filteredProducts.length > 0 ? (
              <ProductGrid products={filteredProducts} />
            ) : (
              <div className="text-center py-20">
                <p className="text-lg font-display text-muted mb-4">
                  Produktų pagal pasirinktus filtrus nerasta
                </p>
                {hasActiveFilters ? (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm font-display uppercase tracking-wider text-accent hover:underline"
                  >
                    Išvalyti filtrus
                  </button>
                ) : (
                  <Link
                    href="/"
                    className="text-sm font-display uppercase tracking-wider text-accent hover:underline"
                  >
                    Grįžti į pradžią
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import ProductGrid from "@/components/ProductGrid";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  children?: Category[];
}

// Spalvų hex → Roly kodų žemėlapis
const COLOR_CODES: Record<string, string> = {
  "#FFFFFF": "01", "#000000": "02", "#001D43": "55", "#DC002E": "60",
  "#0060A9": "05", "#C4DDF1": "86", "#00A0D1": "12", "#008F4F": "83",
  "#004237": "56", "#51A025": "264", "#F08927": "31", "#FFE400": "03",
  "#C4C4C4": "58", "#484E41": "46", "#DC006B": "78", "#F8CCD5": "48",
  "#750D68": "71", "#8C1713": "57", "#573D2A": "67", "#4C6781": "231",
  "#F5F0E1": "132", "#722F37": "116", "#6B7532": "15", "#F0786B": "169",
  "#3D3D3D": "38",
};

// Gender → lietuviškas pavadinimas
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
  const [allProductsGlobal, setAllProductsGlobal] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(true);

  // Filtrai
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("default");

  // Sekcijų išskleidimas
  const [expandedCats, setExpandedCats] = useState<string[]>([]);
  const [sectionsOpen, setSectionsOpen] = useState({
    categories: true,
    sizes: false,
    colors: false,
    types: false,
  });

  useEffect(() => {
    params.then((p) => setSlug(p.slug));
  }, [params]);

  // Gauti kategorijas
  useEffect(() => {
    fetch("https://e-printukas-production.up.railway.app/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []))
      .catch(() => {});
  }, []);

  // Gauti VISUS produktus (skaičiams)
  useEffect(() => {
    fetch("https://e-printukas-production.up.railway.app/api/products?limit=100")
      .then((r) => r.json())
      .then((d) => {
        const withImages = (d.products || []).filter(
          (p: any) => p.images && p.images.length > 0
        );
        setAllProductsGlobal(withImages);
      })
      .catch(() => {});
  }, []);

  // Gauti produktus pagal kategoriją
  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedGenders([]);
    fetch(`https://e-printukas-production.up.railway.app/api/products?category=${slug}&limit=50`)
      .then((r) => r.json())
      .then((d) => {
        const withImages = (d.products || []).filter(
          (p: any) => p.images && p.images.length > 0
        );
        setAllProducts(withImages);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  // Dabartinė kategorija
  const currentCategory = useMemo(() => {
    if (!slug || categories.length === 0) return null;
    for (const cat of categories) {
      if (cat.slug === slug) return cat;
      if (cat.children) {
        const child = cat.children.find((c) => c.slug === slug);
        if (child) return child;
      }
    }
    return null;
  }, [slug, categories]);

  // Išskleisti tėvinę
  useEffect(() => {
    if (!slug || categories.length === 0) return;
    for (const cat of categories) {
      if (cat.slug === slug) { setExpandedCats([cat.id]); return; }
      if (cat.children) {
        const child = cat.children.find((c) => c.slug === slug);
        if (child) { setExpandedCats([cat.id]); return; }
      }
    }
  }, [slug, categories]);

  const categoryName = currentCategory?.name || slug;
  const parentCategories = categories.filter((c) => !c.parentId);

  // Suskaičiuoti produktus pagal kategoriją (iš VISŲ produktų)
  const productCountByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    allProductsGlobal.forEach((p) => {
      if (p.category?.slug) {
        counts[p.category.slug] = (counts[p.category.slug] || 0) + 1;
      }
    });
    // Pagrindinės kategorijos: sumuoti su vaikų
    parentCategories.forEach((parent) => {
      let total = counts[parent.slug] || 0;
      parent.children?.forEach((child) => {
        total += counts[child.slug] || 0;
      });
      counts[`parent_${parent.slug}`] = total;
    });
    return counts;
  }, [allProductsGlobal, parentCategories]);

  // Unikalūs dydžiai
  const availableSizes = useMemo(() => {
    const sizes = new Set<string>();
    allProducts.forEach((p) =>
      p.variants?.forEach((v: any) => sizes.add(v.size))
    );
    const order = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL", "3/4", "5/6", "7/8", "9/10", "11/12"];
    return [...sizes].sort(
      (a, b) => (order.indexOf(a) === -1 ? 99 : order.indexOf(a)) - (order.indexOf(b) === -1 ? 99 : order.indexOf(b))
    );
  }, [allProducts]);

  // Unikalios spalvos
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

  // Unikalūs gender tipai šioje kategorijoje
  const availableGenders = useMemo(() => {
    const genders = new Set<string>();
    allProducts.forEach((p) => {
      if (p.gender) genders.add(p.gender);
    });
    return [...genders];
  }, [allProducts]);

  // Suskaičiuoti kiek produktų kiekvienam filtrui
  const sizeProductCount = useMemo(() => {
    const counts: Record<string, number> = {};
    allProducts.forEach((p) => {
      const sizes = new Set<string>();
      p.variants?.forEach((v: any) => sizes.add(v.size));
      sizes.forEach((s) => { counts[s] = (counts[s] || 0) + 1; });
    });
    return counts;
  }, [allProducts]);

  const colorProductCount = useMemo(() => {
    const counts: Record<string, number> = {};
    allProducts.forEach((p) => {
      const colors = new Set<string>();
      p.variants?.forEach((v: any) => colors.add(v.colorHex));
      colors.forEach((c) => { counts[c] = (counts[c] || 0) + 1; });
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

  // Filtruoti produktus
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
    if (sortBy === "price_asc") result.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    if (sortBy === "price_desc") result.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));

    return result;
  }, [allProducts, selectedSizes, selectedColors, selectedGenders, sortBy]);

  const toggleSize = (s: string) => setSelectedSizes((p) => p.includes(s) ? p.filter((x) => x !== s) : [...p, s]);
  const toggleColor = (h: string) => setSelectedColors((p) => p.includes(h) ? p.filter((x) => x !== h) : [...p, h]);
  const toggleGender = (g: string) => setSelectedGenders((p) => p.includes(g) ? p.filter((x) => x !== g) : [...p, g]);
  const clearAllFilters = () => { setSelectedSizes([]); setSelectedColors([]); setSelectedGenders([]); };
  const toggleSection = (s: keyof typeof sectionsOpen) => setSectionsOpen((p) => ({ ...p, [s]: !p[s] }));
  const toggleExpand = (id: string) => setExpandedCats((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  const hasActiveFilters = selectedSizes.length > 0 || selectedColors.length > 0 || selectedGenders.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-gray-400 mb-6">
        <Link href="/" className="hover:text-black transition-colors">🏠</Link>
        <span>›</span>
        <span className="text-black font-medium">{categoryName}</span>
      </nav>

      {/* Pavadinimas + FILTER + Sort */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black uppercase tracking-tight font-[family-name:var(--font-montserrat)]">
          {categoryName}
        </h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 border border-gray-300 px-5 py-2.5 text-sm font-medium hover:border-black transition-colors"
          >
            FILTRAS
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              {showFilters ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              )}
            </svg>
          </button>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 px-4 py-2.5 text-sm bg-white hover:border-black transition-colors cursor-pointer">
            <option value="default">Numatytasis</option>
            <option value="name">Pavadinimas A–Ž</option>
            <option value="price_asc">Kaina: žemiausia</option>
            <option value="price_desc">Kaina: aukščiausia</option>
          </select>
          <span className="text-sm text-gray-400">{filteredProducts.length} produktų</span>
        </div>
      </div>

      <div className="flex gap-8">
        {/* ŠONINĖ JUOSTA */}
        {showFilters && (
          <aside className="w-64 flex-shrink-0">
            {/* FILTER + Clear */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
              <button onClick={() => setShowFilters(false)}
                className="flex items-center gap-2 border border-gray-300 px-4 py-2 text-sm font-medium hover:border-black transition-colors">
                FILTRAS
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
              </button>
              <button onClick={clearAllFilters} className="text-xs text-gray-500 hover:text-black transition-colors">
                Valyti filtrus
              </button>
            </div>

            {/* Pritaikyti filtrai */}
            <div className="mb-5 pb-4 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Pritaikyti filtrai</h3>
              <div className="flex flex-wrap gap-1.5">
                <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-2.5 py-1.5">
                  {categoryName}
                  <Link href="/" className="text-gray-400 hover:text-black ml-0.5">×</Link>
                </span>
                {selectedSizes.map((s) => (
                  <span key={s} className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-2.5 py-1.5">
                    {s}<button onClick={() => toggleSize(s)} className="text-gray-400 hover:text-black ml-0.5">×</button>
                  </span>
                ))}
                {selectedColors.map((hex) => {
                  const color = availableColors.find((c) => c.hex === hex);
                  return (
                    <span key={hex} className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-2.5 py-1.5">
                      <span className="w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: hex }} />
                      {color?.name}<button onClick={() => toggleColor(hex)} className="text-gray-400 hover:text-black ml-0.5">×</button>
                    </span>
                  );
                })}
                {selectedGenders.map((g) => (
                  <span key={g} className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-2.5 py-1.5">
                    {GENDER_MAP[g]}<button onClick={() => toggleGender(g)} className="text-gray-400 hover:text-black ml-0.5">×</button>
                  </span>
                ))}
              </div>
            </div>

            {/* KATEGORIJOS — su skaičiais */}
            <div className="mb-4 pb-4 border-b border-gray-100">
              <button onClick={() => toggleSection("categories")} className="w-full flex items-center justify-between py-1 text-left">
                <h3 className="text-sm font-bold text-gray-900">Kategorijos</h3>
                <span className="text-gray-400 text-lg leading-none">{sectionsOpen.categories ? "−" : "+"}</span>
              </button>
              {sectionsOpen.categories && (
                <div className="mt-3 space-y-0.5">
                  {parentCategories.map((cat) => {
                    const isExpanded = expandedCats.includes(cat.id);
                    const isActive = cat.slug === slug;
                    const hasChildren = cat.children && cat.children.length > 0;
                    const childActive = cat.children?.some((c) => c.slug === slug);
                    const count = productCountByCategory[`parent_${cat.slug}`] || 0;

                    return (
                      <div key={cat.id}>
                        <div className="flex items-center justify-between">
                          <Link href={`/kategorija/${cat.slug}`}
                            className={`flex items-center gap-2 text-xs py-1.5 transition-colors uppercase tracking-wider flex-1 ${
                              isActive || childActive ? "text-black font-bold" : "text-gray-600 hover:text-black"
                            }`}>
                            <span className={`w-3.5 h-3.5 border flex items-center justify-center text-[8px] flex-shrink-0 ${
                              isActive || childActive ? "border-black bg-black text-white" : "border-gray-300"
                            }`}>
                              {(isActive || childActive) && "✓"}
                            </span>
                            <span className="flex-1">{cat.name.toUpperCase()}</span>
                            <span className="text-[10px] text-gray-400 font-normal">{count}</span>
                          </Link>
                          {hasChildren && (
                            <button onClick={() => toggleExpand(cat.id)} className="p-1 text-gray-400 hover:text-black ml-1">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
                                className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-180" : ""}`}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                              </svg>
                            </button>
                          )}
                        </div>
                        {hasChildren && isExpanded && (
                          <div className="ml-5 space-y-0.5">
                            {cat.children!.map((child) => {
                              const childCount = productCountByCategory[child.slug] || 0;
                              return (
                                <Link key={child.id} href={`/kategorija/${child.slug}`}
                                  className={`flex items-center gap-2 text-xs py-1 transition-colors uppercase tracking-wider ${
                                    child.slug === slug ? "text-black font-bold" : "text-gray-500 hover:text-black"
                                  }`}>
                                  <span className={`w-3.5 h-3.5 border flex items-center justify-center text-[8px] flex-shrink-0 ${
                                    child.slug === slug ? "border-black bg-black text-white" : "border-gray-300"
                                  }`}>
                                    {child.slug === slug && "✓"}
                                  </span>
                                  <span className="flex-1">{child.name.toUpperCase()}</span>
                                  <span className="text-[10px] text-gray-400 font-normal">{childCount}</span>
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* DYDŽIAI — su skaičiais */}
            <div className="mb-4 pb-4 border-b border-gray-100">
              <button onClick={() => toggleSection("sizes")} className="w-full flex items-center justify-between py-1 text-left">
                <h3 className="text-sm font-bold text-gray-900">Dydžiai</h3>
                <span className="text-gray-400 text-lg leading-none">{sectionsOpen.sizes ? "−" : "+"}</span>
              </button>
              {sectionsOpen.sizes && (
                <div className="mt-3 space-y-0.5">
                  {availableSizes.map((size) => {
                    const count = sizeProductCount[size] || 0;
                    return (
                      <button key={size} onClick={() => toggleSize(size)}
                        className={`flex items-center gap-2 text-xs py-1 w-full text-left transition-colors ${
                          selectedSizes.includes(size) ? "text-black font-bold" : "text-gray-600 hover:text-black"
                        }`}>
                        <span className={`w-3.5 h-3.5 border flex items-center justify-center text-[8px] flex-shrink-0 ${
                          selectedSizes.includes(size) ? "border-black bg-black text-white" : "border-gray-300"
                        }`}>
                          {selectedSizes.includes(size) && "✓"}
                        </span>
                        <span className="flex-1">{size}</span>
                        <span className="text-[10px] text-gray-400">{count}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* SPALVOS — su kodais ir skaičiais */}
            <div className="mb-4 pb-4 border-b border-gray-100">
              <button onClick={() => toggleSection("colors")} className="w-full flex items-center justify-between py-1 text-left">
                <h3 className="text-sm font-bold text-gray-900">Spalvos</h3>
                <span className="text-gray-400 text-lg leading-none">{sectionsOpen.colors ? "−" : "+"}</span>
              </button>
              {sectionsOpen.colors && (
                <div className="mt-3 flex flex-wrap gap-3">
                  {availableColors.map((c) => {
                    const code = COLOR_CODES[c.hex.toUpperCase()] || "";
                    const count = colorProductCount[c.hex] || 0;
                    const isSelected = selectedColors.includes(c.hex);
                    return (
                      <button key={c.hex} onClick={() => toggleColor(c.hex)} title={`${c.name} (${count})`}
                        className="flex flex-col items-center gap-0.5">
                        <span className={`w-7 h-7 rounded-full transition-all ${
                          isSelected ? "ring-2 ring-black ring-offset-1 scale-110" : "border border-gray-300 hover:scale-105"
                        }`} style={{ backgroundColor: c.hex }} />
                        <span className={`text-[9px] leading-none ${isSelected ? "text-black font-bold" : "text-gray-400"}`}>
                          {code || "·"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* TIPAS — veikiantis su skaičiais */}
            <div className="mb-4 pb-4 border-b border-gray-100">
              <button onClick={() => toggleSection("types")} className="w-full flex items-center justify-between py-1 text-left">
                <h3 className="text-sm font-bold text-gray-900">Tipas</h3>
                <span className="text-gray-400 text-lg leading-none">{sectionsOpen.types ? "−" : "+"}</span>
              </button>
              {sectionsOpen.types && (
                <div className="mt-3 space-y-0.5">
                  {availableGenders.map((g) => {
                    const count = genderProductCount[g] || 0;
                    const isSelected = selectedGenders.includes(g);
                    return (
                      <button key={g} onClick={() => toggleGender(g)}
                        className={`flex items-center gap-2 text-xs py-1 w-full text-left transition-colors ${
                          isSelected ? "text-black font-bold" : "text-gray-600 hover:text-black"
                        }`}>
                        <span className={`w-3.5 h-3.5 border flex items-center justify-center text-[8px] flex-shrink-0 ${
                          isSelected ? "border-black bg-black text-white" : "border-gray-300"
                        }`}>
                          {isSelected && "✓"}
                        </span>
                        <span className="flex-1">{GENDER_MAP[g] || g}</span>
                        <span className="text-[10px] text-gray-400">{count}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </aside>
        )}

        {/* PRODUKTAI */}
        <div className="flex-1">
          {loading ? (
            <div className="text-center py-20 text-gray-400">Kraunama...</div>
          ) : filteredProducts.length > 0 ? (
            <ProductGrid products={filteredProducts} />
          ) : (
            <div className="text-center py-20 text-gray-400">
              <p>Produktų pagal pasirinktus filtrus nerasta</p>
              {hasActiveFilters && (
                <button onClick={clearAllFilters} className="text-black underline mt-4 inline-block text-sm">Valyti filtrus</button>
              )}
              {!hasActiveFilters && (
                <Link href="/" className="text-black underline mt-4 inline-block text-sm">Grįžti į pradžią</Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

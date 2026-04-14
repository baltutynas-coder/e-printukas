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

export default function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [slug, setSlug] = useState("");
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(true);

  // Filtrai
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("default");

  // Sekcijų išskleidimas
  const [expandedCats, setExpandedCats] = useState<string[]>([]);
  const [sectionsOpen, setSectionsOpen] = useState({
    categories: true,
    sizes: false,
    colors: false,
    types: false,
  });

  // Gauti slug
  useEffect(() => {
    params.then((p) => setSlug(p.slug));
  }, [params]);

  // Gauti kategorijas
  useEffect(() => {
    fetch("http://localhost:4000/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []))
      .catch(() => {});
  }, []);

  // Gauti produktus
  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setSelectedSizes([]);
    setSelectedColors([]);
    fetch(`http://localhost:4000/api/products?category=${slug}&limit=50`)
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

  // Rasti dabartinę kategoriją
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

  // Išskleisti tėvinę kategoriją
  useEffect(() => {
    if (!slug || categories.length === 0) return;
    for (const cat of categories) {
      if (cat.slug === slug) {
        setExpandedCats([cat.id]);
        return;
      }
      if (cat.children) {
        const child = cat.children.find((c) => c.slug === slug);
        if (child) {
          setExpandedCats([cat.id]);
          return;
        }
      }
    }
  }, [slug, categories]);

  const categoryName = currentCategory?.name || slug;
  const parentCategories = categories.filter((c) => !c.parentId);

  // Išgauti unikalius dydžius ir spalvas iš produktų
  const availableSizes = useMemo(() => {
    const sizes = new Set<string>();
    allProducts.forEach((p) =>
      p.variants?.forEach((v: any) => sizes.add(v.size))
    );
    const order = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"];
    return [...sizes].sort(
      (a, b) => (order.indexOf(a) === -1 ? 99 : order.indexOf(a)) - (order.indexOf(b) === -1 ? 99 : order.indexOf(b))
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

    // Rūšiavimas
    if (sortBy === "name") result.sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === "price_asc") result.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    if (sortBy === "price_desc") result.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));

    return result;
  }, [allProducts, selectedSizes, selectedColors, sortBy]);

  // Filtro helpers
  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (hex: string) => {
    setSelectedColors((prev) =>
      prev.includes(hex) ? prev.filter((c) => c !== hex) : [...prev, hex]
    );
  };

  const clearAllFilters = () => {
    setSelectedSizes([]);
    setSelectedColors([]);
  };

  const toggleSection = (section: keyof typeof sectionsOpen) => {
    setSectionsOpen((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleExpand = (catId: string) => {
    setExpandedCats((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  };

  const hasActiveFilters = selectedSizes.length > 0 || selectedColors.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-gray-400 mb-6">
        <Link href="/" className="hover:text-black transition-colors">
          🏠
        </Link>
        <span>›</span>
        <span className="text-black font-medium">{categoryName}</span>
      </nav>

      {/* Pavadinimas + FILTER + Rūšiavimas */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black uppercase tracking-tight">
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

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 px-4 py-2.5 text-sm bg-white hover:border-black transition-colors cursor-pointer"
          >
            <option value="default">Numatytasis</option>
            <option value="name">Pavadinimas A–Ž</option>
            <option value="price_asc">Kaina: žemiausia</option>
            <option value="price_desc">Kaina: aukščiausia</option>
          </select>

          <span className="text-sm text-gray-400">
            {filteredProducts.length} produktų
          </span>
        </div>
      </div>

      <div className="flex gap-8">
        {/* ==========================================
            ŠONINĖ FILTRAVIMO JUOSTA — Roly stilius
           ========================================== */}
        {showFilters && (
          <aside className="w-64 flex-shrink-0">
            {/* FILTER mygtukas + Clear */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
              <button
                onClick={() => setShowFilters(false)}
                className="flex items-center gap-2 border border-gray-300 px-4 py-2 text-sm font-medium hover:border-black transition-colors"
              >
                FILTRAS
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
              </button>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-gray-500 hover:text-black transition-colors"
                >
                  Valyti filtrus
                </button>
              )}
            </div>

            {/* Pritaikyti filtrai */}
            <div className="mb-5 pb-4 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 mb-3">
                Pritaikyti filtrai
              </h3>
              <div className="flex flex-wrap gap-1.5">
                <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-2.5 py-1.5">
                  {categoryName}
                  <Link href="/" className="text-gray-400 hover:text-black ml-0.5">×</Link>
                </span>
                {selectedSizes.map((s) => (
                  <span key={s} className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-2.5 py-1.5">
                    {s}
                    <button onClick={() => toggleSize(s)} className="text-gray-400 hover:text-black ml-0.5">×</button>
                  </span>
                ))}
                {selectedColors.map((hex) => {
                  const color = availableColors.find((c) => c.hex === hex);
                  return (
                    <span key={hex} className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-2.5 py-1.5">
                      <span className="w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: hex }} />
                      {color?.name}
                      <button onClick={() => toggleColor(hex)} className="text-gray-400 hover:text-black ml-0.5">×</button>
                    </span>
                  );
                })}
              </div>
            </div>

            {/* ===== KATEGORIJOS ===== */}
            <div className="mb-4 pb-4 border-b border-gray-100">
              <button
                onClick={() => toggleSection("categories")}
                className="w-full flex items-center justify-between py-1 text-left"
              >
                <h3 className="text-sm font-bold text-gray-900">Kategorijos</h3>
                <span className="text-gray-400 text-lg leading-none">
                  {sectionsOpen.categories ? "−" : "+"}
                </span>
              </button>

              {sectionsOpen.categories && (
                <div className="mt-3 space-y-0.5">
                  {parentCategories.map((cat) => {
                    const isExpanded = expandedCats.includes(cat.id);
                    const isActive = cat.slug === slug;
                    const hasChildren = cat.children && cat.children.length > 0;
                    const childActive = cat.children?.some((c) => c.slug === slug);

                    return (
                      <div key={cat.id}>
                        <div className="flex items-center justify-between">
                          <Link
                            href={`/kategorija/${cat.slug}`}
                            className={`flex items-center gap-2 text-xs py-1.5 transition-colors uppercase tracking-wider ${
                              isActive || childActive
                                ? "text-black font-bold"
                                : "text-gray-600 hover:text-black"
                            }`}
                          >
                            <span
                              className={`w-3.5 h-3.5 border flex items-center justify-center text-[8px] ${
                                isActive || childActive
                                  ? "border-black bg-black text-white"
                                  : "border-gray-300"
                              }`}
                            >
                              {(isActive || childActive) && "✓"}
                            </span>
                            {cat.name.toUpperCase()}
                          </Link>
                          {hasChildren && (
                            <button
                              onClick={() => toggleExpand(cat.id)}
                              className="p-1 text-gray-400 hover:text-black"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
                                className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                              </svg>
                            </button>
                          )}
                        </div>
                        {hasChildren && isExpanded && (
                          <div className="ml-5 space-y-0.5">
                            {cat.children!.map((child) => (
                              <Link
                                key={child.id}
                                href={`/kategorija/${child.slug}`}
                                className={`flex items-center gap-2 text-xs py-1 transition-colors uppercase tracking-wider ${
                                  child.slug === slug
                                    ? "text-black font-bold"
                                    : "text-gray-500 hover:text-black"
                                }`}
                              >
                                <span
                                  className={`w-3.5 h-3.5 border flex items-center justify-center text-[8px] ${
                                    child.slug === slug
                                      ? "border-black bg-black text-white"
                                      : "border-gray-300"
                                  }`}
                                >
                                  {child.slug === slug && "✓"}
                                </span>
                                {child.name.toUpperCase()}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ===== DYDŽIAI ===== */}
            <div className="mb-4 pb-4 border-b border-gray-100">
              <button
                onClick={() => toggleSection("sizes")}
                className="w-full flex items-center justify-between py-1 text-left"
              >
                <h3 className="text-sm font-bold text-gray-900">Dydžiai</h3>
                <span className="text-gray-400 text-lg leading-none">
                  {sectionsOpen.sizes ? "−" : "+"}
                </span>
              </button>

              {sectionsOpen.sizes && (
                <div className="mt-3 space-y-1">
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => toggleSize(size)}
                      className={`flex items-center gap-2 text-xs py-1 w-full text-left transition-colors ${
                        selectedSizes.includes(size)
                          ? "text-black font-bold"
                          : "text-gray-600 hover:text-black"
                      }`}
                    >
                      <span
                        className={`w-3.5 h-3.5 border flex items-center justify-center text-[8px] ${
                          selectedSizes.includes(size)
                            ? "border-black bg-black text-white"
                            : "border-gray-300"
                        }`}
                      >
                        {selectedSizes.includes(size) && "✓"}
                      </span>
                      {size}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ===== SPALVOS ===== */}
            <div className="mb-4 pb-4 border-b border-gray-100">
              <button
                onClick={() => toggleSection("colors")}
                className="w-full flex items-center justify-between py-1 text-left"
              >
                <h3 className="text-sm font-bold text-gray-900">Spalvos</h3>
                <span className="text-gray-400 text-lg leading-none">
                  {sectionsOpen.colors ? "−" : "+"}
                </span>
              </button>

              {sectionsOpen.colors && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {availableColors.map((c) => (
                    <button
                      key={c.hex}
                      onClick={() => toggleColor(c.hex)}
                      title={c.name}
                      className={`w-7 h-7 rounded-full transition-all ${
                        selectedColors.includes(c.hex)
                          ? "ring-2 ring-black ring-offset-1 scale-110"
                          : "border border-gray-300 hover:scale-105"
                      }`}
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* ===== TIPAS ===== */}
            <div className="mb-4 pb-4 border-b border-gray-100">
              <button
                onClick={() => toggleSection("types")}
                className="w-full flex items-center justify-between py-1 text-left"
              >
                <h3 className="text-sm font-bold text-gray-900">Tipas</h3>
                <span className="text-gray-400 text-lg leading-none">
                  {sectionsOpen.types ? "−" : "+"}
                </span>
              </button>

              {sectionsOpen.types && (
                <div className="mt-3 space-y-1">
                  {["Vyrams", "Moterims", "Unisex", "Vaikams"].map((type) => (
                    <div
                      key={type}
                      className="flex items-center gap-2 text-xs text-gray-600 py-1"
                    >
                      <span className="w-3.5 h-3.5 border border-gray-300" />
                      {type}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        )}

        {/* ===== PRODUKTAI ===== */}
        <div className="flex-1">
          {loading ? (
            <div className="text-center py-20 text-gray-400">Kraunama...</div>
          ) : filteredProducts.length > 0 ? (
            <ProductGrid products={filteredProducts} />
          ) : (
            <div className="text-center py-20 text-gray-400">
              <p>Produktų pagal pasirinktus filtrus nerasta</p>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-black underline mt-4 inline-block text-sm"
                >
                  Valyti filtrus
                </button>
              )}
              {!hasActiveFilters && (
                <Link
                  href="/"
                  className="text-black underline mt-4 inline-block text-sm"
                >
                  Grįžti į pradžią
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

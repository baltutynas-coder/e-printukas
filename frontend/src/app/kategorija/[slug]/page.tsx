"use client";

import ProductGrid from "@/components/ProductGrid";
import Link from "next/link";
import { useState, useEffect } from "react";

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  children?: Category[];
  _count?: { products: number };
}

export default function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [slug, setSlug] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(true);
  const [expandedCats, setExpandedCats] = useState<string[]>([]);

  // Gauti slug iš params
  useEffect(() => {
    params.then(p => setSlug(p.slug));
  }, [params]);

  // Gauti kategorijas
  useEffect(() => {
    fetch("http://localhost:4000/api/categories")
      .then(r => r.json())
      .then(d => {
        setCategories(d.categories || []);
      })
      .catch(() => {});
  }, []);

  // Gauti produktus pagal kategoriją
  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`http://localhost:4000/api/products?category=${slug}&limit=50`)
      .then(r => r.json())
      .then(d => {
        const withImages = (d.products || []).filter((p: any) => p.images && p.images.length > 0);
        setProducts(withImages);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  // Rasti dabartinę kategoriją ir išskleisti tėvinę
  useEffect(() => {
    if (!slug || categories.length === 0) return;
    // Ieškoti tarp pagrindinių
    let found = categories.find(c => c.slug === slug);
    if (found) {
      setCurrentCategory(found);
      setExpandedCats([found.id]);
      return;
    }
    // Ieškoti tarp subkategorijų
    for (const parent of categories) {
      if (parent.children) {
        const child = parent.children.find(c => c.slug === slug);
        if (child) {
          setCurrentCategory(child);
          setExpandedCats([parent.id]);
          return;
        }
      }
    }
  }, [slug, categories]);

  const categoryName = currentCategory?.name || slug;

  // Tik pagrindinės kategorijos (be tėvo)
  const parentCategories = categories.filter(c => !c.parentId);

  const toggleExpand = (catId: string) => {
    setExpandedCats(prev =>
      prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-gray-400 mb-6">
        <Link href="/" className="hover:text-black transition-colors">🏠</Link>
        <span>›</span>
        <span className="text-black font-medium">{categoryName}</span>
      </nav>

      {/* Pavadinimas + FILTER mygtukas */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black uppercase tracking-tight">{categoryName}</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 border border-gray-300 px-4 py-2 text-sm font-medium hover:border-black transition-colors"
          >
            FILTRAS
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d={showFilters ? "M6 18 18 6M6 6l12 12" : "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"} />
            </svg>
          </button>
          <span className="text-sm text-gray-400">{products.length} produktų</span>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Šoninė filtravimo juosta */}
        {showFilters && (
          <aside className="w-64 flex-shrink-0">
            {/* Pritaikyti filtrai */}
            <div className="mb-6 pb-4 border-b border-gray-100">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Pritaikyti filtrai</p>
              <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 text-xs px-3 py-1.5 rounded">
                {categoryName}
                <Link href="/" className="text-gray-400 hover:text-black">×</Link>
              </span>
            </div>

            {/* Kategorijos */}
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Kategorijos</p>
              <div className="space-y-1">
                {parentCategories.map(cat => {
                  const isExpanded = expandedCats.includes(cat.id);
                  const isActive = cat.slug === slug;
                  const hasChildren = cat.children && cat.children.length > 0;
                  const childActive = cat.children?.some(c => c.slug === slug);

                  return (
                    <div key={cat.id}>
                      <div className="flex items-center justify-between">
                        <Link
                          href={`/kategorija/${cat.slug}`}
                          className={`flex items-center gap-2 text-sm py-1.5 transition-colors ${
                            isActive || childActive ? "text-black font-bold" : "text-gray-600 hover:text-black"
                          }`}
                        >
                          <span className={`w-4 h-4 border flex items-center justify-center text-[10px] ${
                            isActive || childActive ? "border-black bg-black text-white" : "border-gray-300"
                          }`}>
                            {(isActive || childActive) && "✓"}
                          </span>
                          {cat.name.toUpperCase()}
                        </Link>
                        {hasChildren && (
                          <button
                            onClick={() => toggleExpand(cat.id)}
                            className="p-1 text-gray-400 hover:text-black"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                            </svg>
                          </button>
                        )}
                      </div>
                      {hasChildren && isExpanded && (
                        <div className="ml-6 space-y-1">
                          {cat.children!.map(child => (
                            <Link
                              key={child.id}
                              href={`/kategorija/${child.slug}`}
                              className={`flex items-center gap-2 text-sm py-1 transition-colors ${
                                child.slug === slug ? "text-black font-bold" : "text-gray-500 hover:text-black"
                              }`}
                            >
                              <span className={`w-4 h-4 border flex items-center justify-center text-[10px] ${
                                child.slug === slug ? "border-black bg-black text-white" : "border-gray-300"
                              }`}>
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
            </div>

            {/* Dydžiai */}
            <div className="mb-6 pb-4 border-t border-gray-100 pt-4">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Dydžiai</p>
              <div className="flex flex-wrap gap-1.5">
                {["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"].map(size => (
                  <span key={size} className="text-xs px-2.5 py-1.5 border border-gray-200 text-gray-500">
                    {size}
                  </span>
                ))}
              </div>
            </div>

            {/* Tipas */}
            <div className="mb-6 pb-4 border-t border-gray-100 pt-4">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Tipas</p>
              <div className="space-y-1.5">
                {["Vyrams", "Moterims", "Unisex", "Vaikams"].map(type => (
                  <div key={type} className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="w-4 h-4 border border-gray-300"></span>
                    {type}
                  </div>
                ))}
              </div>
            </div>
          </aside>
        )}

        {/* Produktai */}
        <div className="flex-1">
          {loading ? (
            <div className="text-center py-20 text-gray-400">Kraunama...</div>
          ) : products.length > 0 ? (
            <ProductGrid products={products} />
          ) : (
            <div className="text-center py-20 text-gray-400">
              <p>Šioje kategorijoje prekių dar nėra</p>
              <Link href="/" className="text-black underline mt-4 inline-block text-sm">Grįžti į pradžią</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

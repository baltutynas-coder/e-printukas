"use client";

import ProductGrid from "@/components/ProductGrid";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) { setLoading(false); return; }
    setLoading(true);
    fetch(`https://e-printukas-production.up.railway.app/api/products?search=${encodeURIComponent(query)}&limit=50`)
      .then((r) => r.json())
      .then((d) => {
        const withImages = (d.products || []).filter((p: any) => p.images && p.images.length > 0);
        setProducts(withImages);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [query]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-gray-400 mb-6">
        <Link href="/" className="hover:text-black transition-colors">🏠</Link>
        <span>›</span>
        <span className="text-black font-medium">Paieška: "{query}"</span>
      </nav>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black uppercase tracking-tight">
          Paieškos rezultatai
        </h1>
        <span className="text-sm text-gray-400">
          {loading ? "Ieškoma..." : `${products.length} produktų`}
        </span>
      </div>

      {!query && (
        <div className="text-center py-20 text-gray-400">
          <p>Įveskite paieškos užklausą</p>
        </div>
      )}

      {query && loading && (
        <div className="text-center py-20 text-gray-400">Ieškoma "{query}"...</div>
      )}

      {query && !loading && products.length > 0 && (
        <ProductGrid products={products} />
      )}

      {query && !loading && products.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg mb-2">Nieko nerasta pagal "{query}"</p>
          <p className="text-sm mb-6">Pabandykite kitą paieškos užklausą</p>
          <Link href="/" className="inline-block bg-black hover:bg-gray-800 text-white font-bold px-8 py-3 uppercase tracking-wider text-sm transition-colors">
            Grįžti į pradžią
          </Link>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-20 text-center text-gray-400">Kraunama...</div>}>
      <SearchResults />
    </Suspense>
  );
}


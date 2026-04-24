"use client";

/**
 * Paieškos puslapis — /paieska?q=užklausa
 *
 * Sprint 3.3:
 *   - Naudoja /api/backend/ proxy (CORS fix — kaip kategorijos puslapis)
 *   - TRUEWERK stilius: cream fonas, Space Grotesk, oranžinis akcentas
 *   - Naujas ProductCard su kainomis ir nuolaidų badge'ais
 *   - Suspense wrapper (privaloma naudojantis useSearchParams Next.js App Router'uje)
 *
 * UX sprendimai:
 *   - BE filtrų — paieškos rezultatai, vartotojas nori matyti greitai
 *   - Tuščia užklausa — rodomas pakvietimas į kategorijas
 *   - Nėra rezultatų — pagalbingas pranešimas + link'ai
 *   - Rodomas užklausos tekstas antraštėje („Paieškos rezultatai: marškinėliai")
 */

import ProductGrid from "@/components/ProductGrid";
import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(
      `/api/backend/products?search=${encodeURIComponent(query)}&limit=50`
    )
      .then((r) => r.json())
      .then((d) => {
        const withImages = (d.products || []).filter(
          (p: any) => p.images && p.images.length > 0
        );
        setProducts(withImages);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [query]);

  // Tuščia užklausa — rodom pakvietimą
  if (!query) {
    return (
      <div className="bg-paper min-h-screen">
        <div className="container-content py-16 lg:py-24">
          <div className="max-w-xl mx-auto text-center">
            <div className="flex items-center gap-2 justify-center mb-4">
              <span className="w-8 h-px bg-accent" aria-hidden="true" />
              <span className="text-xs font-display font-medium uppercase tracking-widest text-accent">
                Paieška
              </span>
              <span className="w-8 h-px bg-accent" aria-hidden="true" />
            </div>

            <h1
              className="text-3xl lg:text-4xl font-display font-semibold tracking-tight mb-4"
              style={{ color: "var(--color-ink)" }}
            >
              Ieškokite produkto
            </h1>

            <p className="text-base text-muted mb-8">
              Įveskite produkto pavadinimą viršuje esančiame paieškos lauke arba
              naršykite kategorijas.
            </p>

            <div className="flex flex-wrap gap-2 justify-center">
              <Link
                href="/kategorija/marskineliai-ir-polo"
                className="text-xs font-display uppercase tracking-widest border border-line-strong px-4 py-2 rounded-sm hover:border-accent hover:text-accent transition-colors"
              >
                Marškinėliai ir polo
              </Link>
              <Link
                href="/kategorija/dzemperiai"
                className="text-xs font-display uppercase tracking-widest border border-line-strong px-4 py-2 rounded-sm hover:border-accent hover:text-accent transition-colors"
              >
                Džemperiai
              </Link>
              <Link
                href="/kategorija/darbo-drabuziai"
                className="text-xs font-display uppercase tracking-widest border border-line-strong px-4 py-2 rounded-sm hover:border-accent hover:text-accent transition-colors"
              >
                Darbo drabužiai
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            Paieška
          </span>
        </nav>

        {/* Antraštė */}
        <div className="mb-8 lg:mb-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-8 h-px bg-accent" aria-hidden="true" />
            <span className="text-xs font-display font-medium uppercase tracking-widest text-accent">
              Paieškos rezultatai
            </span>
          </div>
          <h1
            className="text-3xl lg:text-4xl font-display font-semibold tracking-tight"
            style={{ color: "var(--color-ink)" }}
          >
            „{query}"
          </h1>
          {!loading && (
            <p className="mt-2 text-sm text-muted font-display uppercase tracking-wider">
              Rasta {products.length}{" "}
              {products.length === 1 ? "produktas" : "produktų"}
            </p>
          )}
        </div>

        {/* Rezultatai */}
        {loading ? (
          <div className="text-center py-20">
            <p className="text-lg font-display text-muted">Kraunama...</p>
          </div>
        ) : products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <div className="text-center py-20 max-w-md mx-auto">
            <p className="text-lg font-display text-ink mb-2">
              Pagal užklausą „{query}" produktų nerasta
            </p>
            <p className="text-sm text-muted mb-6">
              Pabandykite kitą paieškos terminą arba naršykite pagal kategoriją.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Link
                href="/"
                className="text-sm font-display uppercase tracking-wider text-accent hover:underline"
              >
                Grįžti į pradžią
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-paper min-h-screen">
          <div className="container-content py-20">
            <p className="text-lg font-display text-muted text-center">
              Kraunama...
            </p>
          </div>
        </div>
      }
    >
      <SearchResults />
    </Suspense>
  );
}

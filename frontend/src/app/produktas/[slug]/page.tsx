/**
 * Produkto puslapis — /produktas/[slug]
 *
 * Sprint 4.1 atkūrimas (senas failas buvo nupjautas ant breadcrumb emoji).
 *
 * Server Component — duomenys fetch'inami serveryje, klientas gauna pilną HTML.
 * Todėl nereikia /api/backend/ proxy — serveris tiesiogiai kalba su Railway.
 *
 * Struktūra:
 *   1. Breadcrumb'ai (pilnas kelias: Pradžia / Kategorija / Produktas)
 *   2. ProductDetails komponentas (client — interaktyvus: spalvos, dydžiai, kiekis)
 *   3. Susiję produktai (3 vnt iš tos pačios kategorijos)
 */

import ProductDetails from "@/components/ProductDetails";
import ProductGrid from "@/components/ProductGrid";
import Link from "next/link";
import { notFound } from "next/navigation";

// Subkategorijų → tėvinė mapa (kaip kituose puslapiuose)
const PARENT_OF_SUBCATEGORY: Record<string, string> = {
  marskineliai: "marskineliai-ir-polo",
  "polo-marskineliai": "marskineliai-ir-polo",
  "su-gobtuvu": "dzemperiai",
  megztiniai: "dzemperiai",
  "sportiniai-marskineliai": "sportine-kolekcija",
  "sportines-kelnes": "sportine-kolekcija",
  "sportiniai-komplektai": "sportine-kolekcija",
  horeca: "darbo-drabuziai",
  "signaliniai-drabuziai": "darbo-drabuziai",
  "medicina-ir-grozis": "darbo-drabuziai",
  pramone: "darbo-drabuziai",
  avalyne: "kiti-produktai",
};

// =============================================================================
// SERVER FETCH'AI
// =============================================================================

async function getProduct(slug: string) {
  try {
    const res = await fetch(
      `https://e-printukas-production.up.railway.app/api/products/${slug}`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.product;
  } catch (error) {
    return null;
  }
}

async function getCategories() {
  try {
    const res = await fetch(
      "https://e-printukas-production.up.railway.app/api/categories",
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.categories || [];
  } catch (error) {
    return [];
  }
}

async function getRelatedProducts(categorySlug: string, currentSlug: string) {
  try {
    const res = await fetch(
      `https://e-printukas-production.up.railway.app/api/products?category=${categorySlug}&limit=10`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.products || [])
      .filter(
        (p: any) =>
          p.slug !== currentSlug && p.images && p.images.length > 0
      )
      .slice(0, 3);
  } catch (error) {
    return [];
  }
}

// =============================================================================
// KOMPONENTAS
// =============================================================================

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [product, categories] = await Promise.all([
    getProduct(slug),
    getCategories(),
  ]);

  if (!product) notFound();

  // Rasti tėvinę kategoriją pagal produkto subkategoriją
  const productCatSlug = product.category?.slug;
  const parentSlug = productCatSlug
    ? PARENT_OF_SUBCATEGORY[productCatSlug] || productCatSlug
    : null;

  const parentCategory = parentSlug
    ? categories.find((c: any) => c.slug === parentSlug)
    : null;

  // Gauti susijusius produktus iš tos pačios subkategorijos
  const relatedProducts = productCatSlug
    ? await getRelatedProducts(productCatSlug, slug)
    : [];

  return (
    <div className="bg-paper min-h-screen">
      <div className="container-content py-8 lg:py-12">
        {/* Breadcrumbai */}
        <nav className="flex items-center gap-2 text-xs mb-8">
          <Link
            href="/"
            className="font-display uppercase tracking-widest text-muted hover:text-accent transition-colors"
          >
            Pradžia
          </Link>
          {parentCategory && (
            <>
              <span className="text-line-strong">/</span>
              <Link
                href={`/kategorija/${parentCategory.slug}`}
                className="font-display uppercase tracking-widest text-muted hover:text-accent transition-colors"
              >
                {parentCategory.name}
              </Link>
            </>
          )}
          <span className="text-line-strong">/</span>
          <span className="font-display uppercase tracking-widest text-ink truncate">
            {product.name}
          </span>
        </nav>

        {/* Produkto detalės — client komponentas */}
        <ProductDetails product={product} />

        {/* Susiję produktai */}
        {relatedProducts.length > 0 && (
          <section className="mt-20 lg:mt-28 pt-12 border-t border-line">
            <div className="flex items-center gap-2 mb-8">
              <span className="w-8 h-px bg-accent" aria-hidden="true" />
              <span className="text-xs font-display font-medium uppercase tracking-widest text-accent">
                Galbūt patiks
              </span>
            </div>
            <h2
              className="text-2xl lg:text-3xl font-display font-semibold tracking-tight mb-8"
              style={{ color: "var(--color-ink)" }}
            >
              Panašūs produktai
            </h2>
            <ProductGrid products={relatedProducts} />
          </section>
        )}
      </div>
    </div>
  );
}

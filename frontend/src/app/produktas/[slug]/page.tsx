/**
 * Produkto puslapis — /produktas/[slug]
 *
 * Sprint 9.1 SEO atnaujinimas:
 *   - generateMetadata — kiekvienas produktas gauna UNIKALŲ title, description,
 *     OG image, Twitter Card metadata. Google indeksuos individualiai.
 *   - Schema.org Product JSON-LD — struktūruoti duomenys, kad Google rodytų
 *     rich snippet'us paieškoje (kaina, prekės nuotrauka, prieinamumas)
 *
 * Sprint 4.1 funkcionalumas (nekeistas):
 *   - Server Component — fetch'ai serveryje, nereikia CORS proxy
 *   - Breadcrumb (3 lygiai)
 *   - ProductDetails client komponentas
 *   - Susiję produktai
 */

import ProductDetails from "@/components/ProductDetails";
import ProductGrid from "@/components/ProductGrid";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

const BASE_URL = "https://e-printukas.vercel.app";

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
      `http://localhost:4000/api/products/${slug}`,
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
      "http://localhost:4000/api/categories",
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
      `http://localhost:4000/api/products?category=${categorySlug}&limit=10`,
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
// SEO METADATA — UNIKALI KIEKVIENAM PRODUKTUI
// =============================================================================

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  // Jei produkto nėra — fallback metadata
  if (!product) {
    return {
      title: "Produktas nerastas",
      description: "Produktas, kurio ieškote, nerastas. Peržiūrėkite mūsų asortimentą.",
    };
  }

  // Sudarom title — produkto pavadinimas + kategorija + brand
  const categoryName = product.category?.name || "Reklaminė tekstilė";
  const title = `${product.name} — ${categoryName} su logotipu`;

  // Description — pirmoji aprašymo dalis (max 160 simbolių pagal Google rekomendacijas)
  const description = product.description
    ? product.description.substring(0, 155).trim() +
      (product.description.length > 155 ? "..." : "")
    : `${product.name} — ${categoryName} verslo asortimentui. Užsakymas nuo 10 vnt., pristatymas 3-5 d. Logo spauda garantuojama.`;

  // OG paveikslėlis — pirmas produkto foto
  const ogImage = product.images?.[0]?.url;

  // URL — pilnas
  const productUrl = `${BASE_URL}/produktas/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: productUrl,
    },
    openGraph: {
      title: `${product.name} | e.printukas.lt`,
      description,
      url: productUrl,
      type: "website",
      locale: "lt_LT",
      siteName: "e.printukas.lt",
      images: ogImage
        ? [
            {
              url: ogImage,
              width: 1200,
              height: 1200,
              alt: product.name,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | e.printukas.lt`,
      description,
      images: ogImage ? [ogImage] : [],
    },
    other: {
      "product:price:amount": product.price?.toString() || "",
      "product:price:currency": "EUR",
    },
  };
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

  const productCatSlug = product.category?.slug;
  const parentSlug = productCatSlug
    ? PARENT_OF_SUBCATEGORY[productCatSlug] || productCatSlug
    : null;

  const parentCategory = parentSlug
    ? categories.find((c: any) => c.slug === parentSlug)
    : null;

  const relatedProducts = productCatSlug
    ? await getRelatedProducts(productCatSlug, slug)
    : [];

  // Schema.org Product struktūruoti duomenys (rich snippet'ams Google paieškoje)
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || "",
    sku: product.sku,
    image: product.images?.map((img: any) => img.url) || [],
    brand: {
      "@type": "Brand",
      name: "e.printukas.lt",
    },
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "EUR",
      availability:
        product.variants?.some((v: any) => v.stock > 0)
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: `${BASE_URL}/produktas/${slug}`,
    },
    category: product.category?.name,
  };

  return (
    <div className="bg-paper min-h-screen">
      {/* Schema.org JSON-LD — nematomas vartotojui, bet matomas Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />

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

        <ProductDetails product={product} />

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

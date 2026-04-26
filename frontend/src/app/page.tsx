/**
 * Home Page — homepage'o entry point.
 *
 * Struktūra (Sprint 8.1 atnaujinimas):
 *   1. HeroSlider       — pagrindinis įvadas
 *   2. CategoryBento    — kategorijų grid (tik tos, kurios turi produktų)
 *   3. ValueProps       — 3 B2B value props („Kodėl mes") — NAUJAS
 *   4. Rekomenduojamos  — 9 random produktai
 *   5. WorkwearPromo    — darbo drabužių specialus blokas
 */

import ProductGrid from "@/components/ProductGrid";
import HeroSlider from "@/components/HeroSlider";
import WorkwearPromo from "@/components/WorkwearPromo";
import CategoryBento from "@/components/CategoryBento";
import ValueProps from "@/components/ValueProps";

// =============================================================================
// DUOMENŲ FETCH'AI
// =============================================================================

async function getProducts() {
  try {
    const res = await fetch(
      "https://e-printukas-production.up.railway.app/api/products?limit=300",
      { cache: "no-store" }
    );
    if (!res.ok) throw new Error("Nepavyko gauti produktų");
    const data = await res.json();
    return data.products;
  } catch (error) {
    console.error("Klaida gaunant produktus:", error);
    return [];
  }
}

async function getCategories() {
  try {
    const res = await fetch(
      "https://e-printukas-production.up.railway.app/api/categories",
      { cache: "no-store" }
    );
    if (!res.ok) throw new Error("Nepavyko gauti kategorijų");
    const data = await res.json();
    return data.categories;
  } catch (error) {
    console.error("Klaida gaunant kategorijas:", error);
    return [];
  }
}

// =============================================================================
// HELPER'IAI
// =============================================================================

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
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

function assignHeroImages(parentCategories: any[], products: any[]): any[] {
  return parentCategories.map((cat: any) => {
    const matchingSlugs = [cat.slug, ...(SUBCATEGORY_MAP[cat.slug] || [])];

    const firstProduct = products.find(
      (p: any) =>
        matchingSlugs.includes(p.category?.slug) &&
        p.images &&
        p.images.length > 0
    );

    const productCount = products.filter((p: any) =>
      matchingSlugs.includes(p.category?.slug)
    ).length;

    return {
      ...cat,
      heroImage: firstProduct?.images?.[0]?.url,
      heroProductName: firstProduct?.name,
      productCount,
    };
  });
}

// =============================================================================
// PAGRINDINIS KOMPONENTAS
// =============================================================================

export default async function Home() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  const allProducts = products.filter(
    (p: any) => p.images && p.images.length > 0
  );

  const parentCategories = categories.filter((c: any) => !c.parentId);
  const categoriesWithImages = assignHeroImages(parentCategories, allProducts);

  const visibleCategories = categoriesWithImages.filter(
    (c: any) => c.productCount > 0
  );

  const randomProducts = shuffle(allProducts).slice(0, 9);

  const darboProducts = allProducts.filter((p: any) => {
    const cat = p.category?.slug;
    return (
      cat === "signaliniai-drabuziai" ||
      cat === "horeca" ||
      cat === "pramone" ||
      cat === "medicina-ir-grozis"
    );
  });

  return (
    <div>
      <HeroSlider />

      <CategoryBento categories={visibleCategories} />

      {/* SPRINT 8.1 — Nauja sekcija */}
      <ValueProps />

      <section
        id="produktai"
        className="container-content py-14 lg:py-20"
        aria-labelledby="products-heading"
      >
        <div className="flex items-end justify-between mb-8 lg:mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-8 h-px bg-accent" aria-hidden="true" />
              <span className="text-xs font-display font-medium uppercase tracking-widest text-accent">
                Rekomenduojamos
              </span>
            </div>
            <h2
              id="products-heading"
              className="text-3xl lg:text-4xl font-display font-semibold tracking-tight text-ink"
            >
              Populiariausios prekės
            </h2>
          </div>
          <span className="text-sm text-muted font-display uppercase tracking-wider">
            {randomProducts.length} produktų
          </span>
        </div>
        <ProductGrid products={randomProducts} />
      </section>

      <WorkwearPromo products={darboProducts} />
    </div>
  );
}

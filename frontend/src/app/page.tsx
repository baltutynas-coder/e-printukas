/**
 * Home Page — homepage'o entry point.
 *
 * Server Component (pagal Next.js 16 App Router konvenciją) — duomenys
 * fetch'inami serveryje, HTML ateina pilnai paruoštas naršyklei.
 *
 * Struktūra (po Sprint 2.2 pertvarkos):
 *   1. HeroSlider       — pagrindinis įvadas (Sprint 2.1)
 *   2. CategoryBento    — 6 kategorijų grid (Sprint 2.2, pakeičia 2 dubliuotas sekcijas)
 *   3. Rekomenduojamos  — 9 random produktai (bus perrašyta Sprint 3)
 *   4. WorkwearPromo    — darbo drabužių specialus blokas (bus perrašytas Sprint 2.3)
 *
 * Pašalinta:
 *   - Senas 4-kategorijų bento (jau atspindima CategoryBento)
 *   - Kategorijų mygtukų juosta (tos pačios kategorijos, dubliavimas)
 *   - „Ko negalima praleisti" 3 kortelės (trečias tos pačios info kartojimas)
 */

import ProductGrid from "@/components/ProductGrid";
import HeroSlider from "@/components/HeroSlider";
import WorkwearPromo from "@/components/WorkwearPromo";
import CategoryBento from "@/components/CategoryBento";

// =============================================================================
// DUOMENŲ FETCH'AI — serverio pusėje
// =============================================================================

/**
 * Visų produktų gavimas (limit 50 — pakanka homepage rekomendacijoms).
 * `cache: "no-store"` — visada šviežūs duomenys (nereikia ISR dėl produkto
 * keitimosi dažnumo).
 */
async function getProducts() {
  try {
    const res = await fetch(
      "https://e-printukas-production.up.railway.app/api/products?limit=50",
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

/**
 * Visų kategorijų gavimas — gauname plokščią sąrašą, po to filtruojame tėvines.
 */
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

/**
 * Fisher–Yates shuffle — tvarkingas masyvo maišymas.
 * Kiekvienas elementas turi vienodą tikimybę patekti į bet kurią poziciją.
 */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// =============================================================================
// PAGRINDINIS KOMPONENTAS
// =============================================================================

export default async function Home() {
  // Lygiagretus duomenų gavimas — greičiau nei vienas po kito
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  // Filtruojam tik tuos produktus, kurie turi nuotraukų
  const allProducts = products.filter(
    (p: any) => p.images && p.images.length > 0
  );

  // Tėvinės kategorijos (be parentId) — naudojamos Bento grid'e
  const parentCategories = categories.filter((c: any) => !c.parentId);

  // Paimam 9 atsitiktinius produktus rekomendacijoms
  const randomProducts = shuffle(allProducts).slice(0, 9);

  // Darbo drabužių produktai — WorkwearPromo sekcijai
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
      {/* 1. HERO — pagrindinis įvadas */}
      <HeroSlider />

      {/* 2. CATEGORY BENTO — 6 kategorijos, TRUEWERK „Shop by" stilius */}
      <CategoryBento categories={parentCategories} />

      {/* 3. REKOMENDUOJAMOS PREKĖS — 9 atsitiktiniai produktai */}
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

      {/* 4. DARBO DRABUŽIAI — specialus promo blokas */}
      <WorkwearPromo products={darboProducts} />
    </div>
  );
}

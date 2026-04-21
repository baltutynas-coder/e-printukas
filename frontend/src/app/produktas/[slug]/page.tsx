import ProductDetails from "@/components/ProductDetails";
import ProductGrid from "@/components/ProductGrid";
import Link from "next/link";
import { notFound } from "next/navigation";

async function getProduct(slug: string) {
  try {
    const res = await fetch(`https://e-printukas-production.up.railway.app/api/products/${slug}`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return data.product;
  } catch (error) {
    return null;
  }
}

async function getCategories() {
  try {
    const res = await fetch("https://e-printukas-production.up.railway.app/api/categories", { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.categories || [];
  } catch (error) {
    return [];
  }
}

async function getRelatedProducts(categorySlug: string, currentSlug: string) {
  try {
    const res = await fetch(`https://e-printukas-production.up.railway.app/api/products?category=${categorySlug}&limit=6`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.products || [])
      .filter((p: any) => p.slug !== currentSlug && p.images && p.images.length > 0)
      .slice(0, 3);
  } catch (error) {
    return [];
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [product, categories] = await Promise.all([getProduct(slug), getCategories()]);

  if (!product) notFound();

  // Rasti pilną kategorijų kelią (parent > child)
  let parentCategory = null;
  let childCategory = null;

  if (product.category) {
    // Ieškoti ar produkto kategorija yra subkategorija
    for (const cat of categories) {
      if (cat.children) {
        const child = cat.children.find((c: any) => c.slug === product.category.slug);
        if (child) {
          parentCategory = cat;
          childCategory = child;
          break;
        }
      }
      // Arba pati pagrindinė kategorija
      if (cat.slug === product.category.slug) {
        parentCategory = cat;
        break;
      }
    }
  }

  // Gauti panašius produktus iš tos pačios kategorijos
  const parentSlug = parentCategory?.slug || product.category?.slug || "";
  const relatedProducts = await getRelatedProducts(parentSlug, slug);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumbs — pilnas Roly kelias */}
      <nav className="flex items-center gap-2 text-xs text-gray-400 mb-8">
        <Link href="/" className="hover:text-black transition-colors">🏠</Link>
        {parentCategory && (
          <>
            <span>›</span>
            <Link href={`/kategorija/${parentCategory.slug}`} className="hover:text-black transition-colors">
              {parentCategory.name}
            </Link>
          </>
        )}
        {childCategory && (
          <>
            <span>›</span>
            <Link href={`/kategorija/${childCategory.slug}`} className="hover:text-black transition-colors">
              {childCategory.name}
            </Link>
          </>
        )}
        <span>›</span>
        <span className="text-black font-medium">{product.name}</span>
      </nav>

      {/* Produkto detalės */}
      <ProductDetails product={product} />

      {/* Siūlomi produktai */}
      {relatedProducts.length > 0 && (
        <section className="mt-20 pt-10 border-t border-gray-100">
          <h2 className="text-xl font-black uppercase tracking-tight mb-8">Panašūs produktai</h2>
          <ProductGrid products={relatedProducts} />
        </section>
      )}
    </div>
  );
}
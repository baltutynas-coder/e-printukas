import ProductGrid from "@/components/ProductGrid";
import Link from "next/link";
import { notFound } from "next/navigation";

async function getCategoryProducts(slug: string) {
  try {
    const res = await fetch(`http://localhost:4000/api/products?category=${slug}&limit=50`, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    return null;
  }
}

async function getCategories() {
  try {
    const res = await fetch("http://localhost:4000/api/categories", { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.categories || [];
  } catch (error) {
    return [];
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [data, categories] = await Promise.all([getCategoryProducts(slug), getCategories()]);

  if (!data) notFound();

  const currentCategory = categories.find((c: any) => c.slug === slug);
  const categoryName = currentCategory?.name || slug;
  const productsWithImages = (data.products || []).filter((p: any) => p.images && p.images.length > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-gray-400 mb-8">
        <Link href="/" className="hover:text-black transition-colors">🏠</Link>
        <span>›</span>
        <span className="text-black font-medium">{categoryName}</span>
      </nav>

      {/* Pavadinimas + filtras */}
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-3xl font-black uppercase tracking-tight">{categoryName}</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">{productsWithImages.length} produktų</span>
        </div>
      </div>

      {/* Kategorijų filtrai */}
      <div className="flex flex-wrap gap-2 mb-10 border-b border-gray-100 pb-6">
        <Link
          href="/"
          className="text-xs px-4 py-2 border border-gray-200 text-gray-500 hover:border-black hover:text-black transition-all uppercase tracking-wider"
        >
          Visos
        </Link>
        {categories.map((cat: any) => (
          <Link
            key={cat.id}
            href={`/kategorija/${cat.slug}`}
            className={`text-xs px-4 py-2 border uppercase tracking-wider transition-all ${
              cat.slug === slug
                ? "border-black bg-black text-white"
                : "border-gray-200 text-gray-500 hover:border-black hover:text-black"
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {/* Produktai */}
      {productsWithImages.length > 0 ? (
        <ProductGrid products={productsWithImages} />
      ) : (
        <div className="text-center py-20 text-gray-400">
          <p>Šioje kategorijoje prekių dar nėra</p>
          <Link href="/" className="text-black underline mt-4 inline-block text-sm">
            Grįžti į pradžią
          </Link>
        </div>
      )}
    </div>
  );
}
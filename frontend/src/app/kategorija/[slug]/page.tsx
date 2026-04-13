import ProductGrid from "@/components/ProductGrid";
import Link from "next/link";
import { notFound } from "next/navigation";

async function getCategoryProducts(slug: string) {
  try {
    const res = await fetch(`http://localhost:4000/api/products?category=${slug}&limit=50`, {
      cache: "no-store",
    });
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
  const [data, categories] = await Promise.all([
    getCategoryProducts(slug),
    getCategories(),
  ]);

  if (!data) notFound();

  // Rasti dabartinę kategoriją
  const currentCategory = categories.find((c: any) => c.slug === slug);
  const categoryName = currentCategory?.name || slug;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-emerald-600">Pradžia</Link>
        <span>/</span>
        <span className="text-gray-900">{categoryName}</span>
      </nav>

      {/* Kategorijų filtrai */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Link
          href="/"
          className="text-sm px-4 py-2 rounded-full border border-gray-200 text-gray-600 hover:border-emerald-300 hover:text-emerald-600 transition-all"
        >
          Visos
        </Link>
        {categories.map((cat: any) => (
          <Link
            key={cat.id}
            href={`/kategorija/${cat.slug}`}
            className={`text-sm px-4 py-2 rounded-full border transition-all ${
              cat.slug === slug
                ? "border-emerald-500 bg-emerald-50 text-emerald-700 font-medium"
                : "border-gray-200 text-gray-600 hover:border-emerald-300 hover:text-emerald-600"
            }`}
          >
            {cat.name}
            {cat._count?.products > 0 && (
              <span className="ml-1 text-xs opacity-60">({cat._count.products})</span>
            )}
          </Link>
        ))}
      </div>

      {/* Pavadinimas */}
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        {categoryName}
        <span className="text-gray-400 font-normal text-lg ml-2">
          ({data.pagination?.total || 0} prekių)
        </span>
      </h1>

      {/* Produktai */}
      {data.products && data.products.length > 0 ? (
        <ProductGrid products={data.products} />
      ) : (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">Šioje kategorijoje prekių dar nėra</p>
          <Link href="/" className="text-emerald-600 hover:underline mt-4 inline-block">
            Grįžti į pradžią
          </Link>
        </div>
      )}
    </div>
  );
}

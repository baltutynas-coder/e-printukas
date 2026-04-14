import ProductDetails from "@/components/ProductDetails";
import Link from "next/link";
import { notFound } from "next/navigation";

async function getProduct(slug: string) {
  try {
    const res = await fetch(`http://localhost:4000/api/products/${slug}`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return data.product;
  } catch (error) {
    return null;
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumbs — Roly stilius */}
      <nav className="flex items-center gap-2 text-xs text-gray-400 mb-8">
        <Link href="/" className="hover:text-black transition-colors">🏠</Link>
        <span>›</span>
        {product.category && (
          <>
            <Link href={`/kategorija/${product.category.slug}`} className="hover:text-black transition-colors">
              {product.category.name}
            </Link>
            <span>›</span>
          </>
        )}
        <span className="text-black font-medium">{product.name}</span>
      </nav>

      {/* Produkto detalės */}
      <ProductDetails product={product} />
    </div>
  );
}

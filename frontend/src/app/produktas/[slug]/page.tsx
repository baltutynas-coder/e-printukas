import Link from "next/link";
import { notFound } from "next/navigation";
import ProductDetails from "@/components/ProductDetails";

async function getProduct(slug: string) {
  try {
    const res = await fetch(`http://localhost:4000/api/products/${slug}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.product;
  } catch (error) {
    console.error("Klaida gaunant produktą:", error);
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

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link href="/" className="hover:text-emerald-600">Pradžia</Link>
        <span>/</span>
        {product.category && (
          <>
            <Link href={`/kategorija/${product.category.slug}`} className="hover:text-emerald-600">
              {product.category.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <ProductDetails product={product} />
    </div>
  );
}

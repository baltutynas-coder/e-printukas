import ProductCard from "./ProductCard";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  comparePrice: string | null;
  sku: string | null;
  images: { url: string; alt: string }[];
  category: { name: string; slug: string } | null;
  variants: { color: string; colorHex: string; size: string; stock: number }[];
}

export default function ProductGrid({ products }: { products: Product[] }) {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-lg">Produktų nerasta</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

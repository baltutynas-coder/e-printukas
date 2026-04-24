import ProductCard from "./ProductCard";

/**
 * ProductGrid — produktų tinklelis.
 *
 * Sprint 3.1 atnaujinimas:
 *   - Empty state su TRUEWERK stilistika (cream fonas, display šriftas)
 *   - Responsive: 1 col mobile, 2 tablet, 3 desktop, 4 wide desktop
 *   - Didesnis gap tarp kortelių (6 vietoj 6 anksčiau buvo paliktas toks)
 */

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
  variants: {
    color: string;
    colorHex: string;
    size: string;
    stock: number;
  }[];
}

export default function ProductGrid({ products }: { products: Product[] }) {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-20">
        <p
          className="text-lg font-display"
          style={{ color: "var(--color-muted)" }}
        >
          Produktų nerasta
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

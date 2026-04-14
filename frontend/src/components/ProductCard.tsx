import Link from "next/link";

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

export default function ProductCard({ product }: { product: Product }) {
  const uniqueColors = [...new Map(
    product.variants.map((v) => [v.colorHex, { color: v.color, hex: v.colorHex }])
  ).values()];

  return (
    <Link href={`/produktas/${product.slug}`} className="group">
      <div className="overflow-hidden">
        {/* Nuotrauka */}
        <div className="aspect-[3/4] bg-gray-100 relative overflow-hidden">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0].url}
              alt={product.images[0].alt || product.name}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={0.5} stroke="currentColor" className="w-16 h-16">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
              </svg>
            </div>
          )}
        </div>

        {/* Info — Roly stilius */}
        <div className="pt-3 pb-2">
          {/* Pavadinimas + SKU */}
          <div className="flex items-baseline gap-2">
            <h3 className="font-black text-sm uppercase tracking-tight text-gray-900 group-hover:text-black">
              {product.name}
            </h3>
            {product.sku && (
              <span className="text-xs text-gray-400 font-normal">{product.sku}</span>
            )}
          </div>

          {/* Aprašymas */}
          {product.description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Spalvos */}
          <div className="flex items-center gap-1 mt-2.5">
            {uniqueColors.slice(0, 8).map((c) => (
              <span
                key={c.hex}
                title={c.color}
                className="w-4 h-4 rounded-full border border-gray-300"
                style={{ backgroundColor: c.hex }}
              />
            ))}
            {uniqueColors.length > 8 && (
              <span className="text-[10px] text-gray-400 ml-0.5">+{uniqueColors.length - 8}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

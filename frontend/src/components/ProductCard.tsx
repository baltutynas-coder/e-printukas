import Link from "next/link";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  comparePrice: string | null;
  images: { url: string; alt: string }[];
  category: { name: string; slug: string } | null;
  variants: { color: string; colorHex: string; size: string; stock: number }[];
}

export default function ProductCard({ product }: { product: Product }) {
  // Gauti unikalias spalvas
  const uniqueColors = [...new Map(
    product.variants.map((v) => [v.colorHex, { color: v.color, hex: v.colorHex }])
  ).values()];

  // Gauti unikalius dydžius
  const sizes = [...new Set(product.variants.map((v) => v.size))];

  // Ar yra sandėlyje
  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);

  return (
    <Link href={`/produktas/${product.slug}`} className="group">
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-emerald-300 transition-all duration-300">
        {/* Nuotrauka */}
        <div className="aspect-square bg-gray-100 relative overflow-hidden">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0].url}
              alt={product.images[0].alt || product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
              </svg>
            </div>
          )}

          {/* Nuolaidos ženkliukas */}
          {product.comparePrice && (
            <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              -{Math.round((1 - parseFloat(product.price) / parseFloat(product.comparePrice)) * 100)}%
            </span>
          )}

          {/* Sandėlio statusas */}
          {totalStock === 0 && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white text-gray-900 font-bold px-4 py-2 rounded">Išparduota</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          {/* Kategorija */}
          {product.category && (
            <span className="text-xs text-emerald-600 font-medium">
              {product.category.name}
            </span>
          )}

          {/* Pavadinimas */}
          <h3 className="font-semibold text-gray-900 mt-1 group-hover:text-emerald-600 transition-colors">
            {product.name}
          </h3>

          {/* Spalvos */}
          <div className="flex items-center gap-1.5 mt-3">
            {uniqueColors.map((c) => (
              <span
                key={c.hex}
                title={c.color}
                className="w-5 h-5 rounded-full border-2 border-gray-200"
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>

          {/* Dydžiai */}
          <div className="flex items-center gap-1.5 mt-2">
            {sizes.map((size) => (
              <span key={size} className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                {size}
              </span>
            ))}
          </div>

          {/* Kaina */}
          <div className="flex items-center gap-2 mt-3">
            <span className="text-lg font-bold text-gray-900">
              {parseFloat(product.price).toFixed(2)} €
            </span>
            {product.comparePrice && (
              <span className="text-sm text-gray-400 line-through">
                {parseFloat(product.comparePrice).toFixed(2)} €
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

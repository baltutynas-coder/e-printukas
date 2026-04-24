import Link from "next/link";

/**
 * ProductCard — produkto kortelė.
 *
 * Sprint 3.1 atnaujinimas (TRUEWERK stilius):
 *   - Baltas foto fonas (jau buvo) + subtili rėmelio linija ant hover
 *   - Rodoma kaina ir comparePrice (perbraukta) — SVARBIAUSIA info, trūko!
 *   - Prekės pavadinimas — Space Grotesk display šriftas, ne all-caps
 *   - SKU po pavadinimu (B2B detalumas)
 *   - Spalvų swatch'ai + „+N" counter
 *   - Dydžių skaičius („XS–5XL" intervalas arba sąrašas)
 *   - Produkto pavadinimas ir kaina aiškūs ant pirmo žvilgsnio
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

// Dydžių tvarkos žemėlapis — rodyti "XS-5XL" intervalą, ne atskirus dydžius
const SIZE_ORDER = [
  "XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL",
  "3/4", "5/6", "7/8", "9/10", "11/12",
];

function formatSizeRange(sizes: string[]): string {
  if (sizes.length === 0) return "";
  if (sizes.length === 1) return sizes[0];

  // Rikiuoja pagal priešdėlį
  const sorted = sizes.sort((a, b) => {
    const ai = SIZE_ORDER.indexOf(a);
    const bi = SIZE_ORDER.indexOf(b);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  return `${sorted[0]}–${sorted[sorted.length - 1]}`;
}

export default function ProductCard({ product }: { product: Product }) {
  // Unikalios spalvos — pagal hex reikšmę
  const uniqueColors = [
    ...new Map(
      product.variants.map((v) => [
        v.colorHex,
        { color: v.color, hex: v.colorHex },
      ])
    ).values(),
  ];

  // Unikalūs dydžiai
  const uniqueSizes = [...new Set(product.variants.map((v) => v.size))];
  const sizeRange = formatSizeRange(uniqueSizes);

  // Nuolaidos skaičiavimas — jei yra comparePrice
  const price = parseFloat(product.price);
  const comparePrice = product.comparePrice
    ? parseFloat(product.comparePrice)
    : null;
  const hasDiscount = comparePrice !== null && comparePrice > price;
  const discountPercent = hasDiscount
    ? Math.round(((comparePrice! - price) / comparePrice!) * 100)
    : 0;

  return (
    <Link
      href={`/produktas/${product.slug}`}
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper rounded-md"
    >
      {/* Foto konteineris — baltas fonas su rėmeliu */}
      <div className="relative aspect-square bg-white border border-line group-hover:border-accent rounded-md overflow-hidden transition-colors duration-300">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0].url}
            alt={product.images[0].alt || product.name}
            className="absolute inset-0 w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="text-4xl font-display font-bold select-none"
              style={{ color: "rgba(14, 14, 14, 0.1)" }}
            >
              {product.name.charAt(0)}
            </span>
          </div>
        )}

        {/* Nuolaidos badge — viršuje kairėje */}
        {hasDiscount && (
          <div className="absolute top-3 left-3 bg-accent text-white px-2 py-1 rounded-sm">
            <span className="text-[10px] font-display font-semibold uppercase tracking-widest">
              -{discountPercent}%
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="pt-4 pb-2">
        {/* Pavadinimas + SKU */}
        <div className="flex items-baseline justify-between gap-2 mb-1">
          <h3
            className="font-display font-semibold text-base truncate"
            style={{ color: "var(--color-ink)" }}
          >
            {product.name}
          </h3>
          {product.sku && (
            <span className="text-[10px] font-display uppercase tracking-wider text-muted flex-shrink-0">
              {product.sku}
            </span>
          )}
        </div>

        {/* Kaina — PAGRINDINĖ info */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-lg font-display font-semibold text-accent">
            {price.toFixed(2)} €
          </span>
          {hasDiscount && (
            <span className="text-sm text-muted line-through">
              {comparePrice!.toFixed(2)} €
            </span>
          )}
          <span className="text-[10px] font-display uppercase tracking-wider text-muted ml-auto">
            Nuo 10 vnt.
          </span>
        </div>

        {/* Spalvų swatch'ai */}
        <div className="flex items-center gap-1.5 mb-2">
          {uniqueColors.slice(0, 6).map((c) => (
            <span
              key={c.hex}
              title={c.color}
              className="w-4 h-4 rounded-full border border-line-strong"
              style={{ backgroundColor: c.hex }}
            />
          ))}
          {uniqueColors.length > 6 && (
            <span className="text-[10px] text-muted font-display">
              +{uniqueColors.length - 6}
            </span>
          )}
        </div>

        {/* Dydžių intervalas */}
        {sizeRange && (
          <div className="text-[10px] font-display uppercase tracking-wider text-muted">
            {sizeRange}
          </div>
        )}
      </div>
    </Link>
  );
}

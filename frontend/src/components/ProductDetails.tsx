"use client";

/**
 * ProductDetails — produkto detalių client komponentas.
 *
 * Sprint 4.1.1 pataisymas — SĄŽININGI DUOMENYS:
 *   - Pašalinta fake „100% medvilnė" placeholder'io (nes 46% produktų tai netiesa)
 *   - Pašalinta fake „50 vnt dėžėje" pakuotės info (nežinome tikrai)
 *   - Dabar rodome tik tai, ką tikrai žinome iš DB:
 *     - Techninė informacija (kategorija, SKU, spalvų ir dydžių skaičius)
 *     - Aprašymas (jei yra — gali būti anglų k.)
 *   - Jei aprašymas tuščias — tos eilutės tiesiog nerodome
 *
 * Dizainas (TRUEWERK DNR) nekeičiamas.
 * Logika (cart, spalvų/dydžių pasirinkimas) nekeičiama.
 */

import { useState, useMemo } from "react";
import { useCartStore } from "@/lib/cartStore";

interface Variant {
  color: string;
  colorHex: string;
  size: string;
  stock: number;
}

interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  comparePrice: string | null;
  sku: string | null;
  images: ProductImage[];
  category: { name: string; slug: string } | null;
  variants: Variant[];
}

const COLOR_CODES: Record<string, string> = {
  "#FFFFFF": "01", "#000000": "02", "#001D43": "55", "#DC002E": "60",
  "#0060A9": "05", "#C4DDF1": "86", "#00A0D1": "12", "#008F4F": "83",
  "#004237": "56", "#51A025": "264", "#F08927": "31", "#FFE400": "03",
  "#C4C4C4": "58", "#484E41": "46", "#DC006B": "78", "#F8CCD5": "48",
  "#750D68": "71", "#8C1713": "57", "#573D2A": "67", "#4C6781": "231",
  "#F5F0E1": "132", "#722F37": "116", "#6B7532": "15", "#F0786B": "169",
  "#3D3D3D": "38",
};

export default function ProductDetails({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);

  const uniqueColors = useMemo(
    () =>
      [
        ...new Map(
          product.variants.map((v) => [
            v.colorHex,
            { color: v.color, hex: v.colorHex },
          ])
        ).values(),
      ],
    [product.variants]
  );

  const [selectedColor, setSelectedColor] = useState(
    uniqueColors[0]?.hex || ""
  );

  const selectedColorName =
    uniqueColors.find((c) => c.hex === selectedColor)?.color || "";

  const currentImage = useMemo(() => {
    if (!product.images || product.images.length === 0) return null;
    const colorImage = product.images.find(
      (img) =>
        img.alt && img.alt.toLowerCase() === selectedColorName.toLowerCase()
    );
    return colorImage || product.images[0];
  }, [product.images, selectedColorName]);

  const sizesForColor = product.variants
    .filter((v) => v.colorHex === selectedColor)
    .map((v) => ({ size: v.size, stock: v.stock }));

  const [selectedSize, setSelectedSize] = useState(
    sizesForColor[0]?.size || ""
  );

  const selectedVariant = product.variants.find(
    (v) => v.colorHex === selectedColor && v.size === selectedSize
  );

  const [quantity, setQuantity] = useState(10);
  const [added, setAdded] = useState(false);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    tech: false,
    description: false,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleColorChange = (hex: string) => {
    setSelectedColor(hex);
    const firstSize = product.variants.find((v) => v.colorHex === hex);
    if (firstSize) setSelectedSize(firstSize.size);
    setQuantity(10);
  };

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    const colorName =
      uniqueColors.find((c) => c.hex === selectedColor)?.color || "";
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: parseFloat(product.price),
      image: currentImage?.url || null,
      color: colorName,
      colorHex: selectedColor,
      size: selectedSize,
      quantity,
      maxStock: selectedVariant.stock,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const price = parseFloat(product.price);
  const comparePrice = product.comparePrice
    ? parseFloat(product.comparePrice)
    : null;
  const hasDiscount = comparePrice !== null && comparePrice > price;
  const discountPercent = hasDiscount
    ? Math.round(((comparePrice! - price) / comparePrice!) * 100)
    : 0;

  // Ar aprašymas yra ir ar jis ne tuščias
  const hasDescription = product.description && product.description.trim().length > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
      {/* KAIRĖ — Paveikslėlis */}
      <div>
        <div className="relative aspect-square bg-white border border-line rounded-md overflow-hidden">
          {currentImage ? (
            <img
              src={currentImage.url}
              alt={currentImage.alt || product.name}
              className="w-full h-full object-contain p-8 transition-opacity duration-300"
              key={currentImage.url}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="text-6xl font-display font-bold select-none"
                style={{ color: "rgba(14, 14, 14, 0.1)" }}
              >
                {product.name.charAt(0)}
              </span>
            </div>
          )}

          {hasDiscount && (
            <div className="absolute top-4 left-4 bg-accent text-white px-3 py-1.5 rounded-sm">
              <span className="text-xs font-display font-semibold uppercase tracking-widest">
                -{discountPercent}%
              </span>
            </div>
          )}
        </div>

        {product.images && product.images.length > 1 && (
          <div className="grid grid-cols-4 gap-2 mt-3">
            {product.images.slice(0, 4).map((img, i) => (
              <div
                key={img.id || i}
                className="aspect-square bg-white border border-line rounded-md overflow-hidden cursor-pointer hover:border-accent transition-colors"
              >
                <img
                  src={img.url}
                  alt={img.alt || product.name}
                  className="w-full h-full object-contain p-2"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DEŠINĖ — Info */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-8 h-px bg-accent" aria-hidden="true" />
          <span className="text-xs font-display font-medium uppercase tracking-widest text-accent">
            {product.category?.name || "Produktas"}
          </span>
        </div>

        <div className="flex items-baseline gap-3 flex-wrap mb-2">
          <h1
            className="text-3xl lg:text-4xl font-display font-semibold tracking-tight"
            style={{ color: "var(--color-ink)" }}
          >
            {product.name}
          </h1>
          {product.sku && (
            <span className="text-sm font-display uppercase tracking-widest text-muted">
              {product.sku}
            </span>
          )}
        </div>

        {/* Trumpas aprašymas po pavadinimu — tik jei yra */}
        {hasDescription && (
          <p className="text-sm text-muted leading-relaxed mb-6">
            {product.description}
          </p>
        )}

        {/* Kaina */}
        <div className="flex items-baseline gap-3 mb-6 pb-6 border-b border-line">
          <span className="text-3xl font-display font-semibold text-accent">
            {price.toFixed(2)} €
          </span>
          {hasDiscount && (
            <span className="text-lg text-muted line-through">
              {comparePrice!.toFixed(2)} €
            </span>
          )}
          <span className="text-xs font-display uppercase tracking-widest text-muted ml-auto">
            Nuo 10 vnt.
          </span>
        </div>

        {/* Spalvos */}
        <div className="mb-6 pb-6 border-b border-line">
          <h3 className="text-xs font-display font-semibold uppercase tracking-widest text-ink mb-3">
            Spalva: <span className="text-accent font-normal">{selectedColorName}</span>
          </h3>
          <div className="flex flex-wrap gap-3">
            {uniqueColors.map((c) => {
              const code = COLOR_CODES[c.hex.toUpperCase()] || "";
              const isSelected = selectedColor === c.hex;
              return (
                <button
                  key={c.hex}
                  onClick={() => handleColorChange(c.hex)}
                  title={c.color}
                  className="flex flex-col items-center gap-1"
                >
                  <span
                    className={`w-10 h-10 rounded-full transition-all ${
                      isSelected
                        ? "ring-2 ring-accent ring-offset-2 ring-offset-paper scale-110"
                        : "border border-line-strong hover:scale-105"
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                  {code && (
                    <span
                      className="text-[10px] font-display leading-none"
                      style={{
                        color: isSelected
                          ? "var(--color-accent)"
                          : "var(--color-muted)",
                      }}
                    >
                      {code}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dydžiai */}
        <div className="mb-6">
          <h3 className="text-xs font-display font-semibold uppercase tracking-widest text-ink mb-3">
            Dydis: <span className="text-accent font-normal">{selectedSize}</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {sizesForColor.map((s) => {
              const isSelected = selectedSize === s.size;
              const isDisabled = s.stock === 0;
              return (
                <button
                  key={s.size}
                  onClick={() => {
                    if (isDisabled) return;
                    setSelectedSize(s.size);
                    setQuantity(10);
                  }}
                  disabled={isDisabled}
                  className="min-w-14 px-4 py-2.5 text-sm font-display font-medium rounded-sm transition-all border"
                  style={{
                    backgroundColor: isSelected
                      ? "var(--color-ink)"
                      : isDisabled
                      ? "transparent"
                      : "white",
                    color: isSelected
                      ? "var(--color-paper)"
                      : isDisabled
                      ? "var(--color-line-strong)"
                      : "var(--color-ink)",
                    borderColor: isSelected
                      ? "var(--color-ink)"
                      : "var(--color-line-strong)",
                    cursor: isDisabled ? "not-allowed" : "pointer",
                  }}
                >
                  {s.size}
                </button>
              );
            })}
          </div>
          {selectedVariant && (
            <p className="text-xs text-muted mt-3 font-display">
              Sandėlyje: {selectedVariant.stock} vnt.
            </p>
          )}
        </div>

        {/* Kiekis + Į krepšelį */}
        <div className="flex items-stretch gap-3 mb-8">
          <div className="flex items-center border border-line-strong rounded-sm bg-white">
            <button
              onClick={() => setQuantity(Math.max(10, quantity - 1))}
              className="px-4 py-3 text-ink hover:text-accent transition-colors font-display font-semibold"
              aria-label="Sumažinti kiekį"
            >
              −
            </button>
            <span className="px-4 py-3 font-display font-semibold min-w-12 text-center border-x border-line-strong text-ink">
              {quantity}
            </span>
            <button
              onClick={() =>
                setQuantity(Math.min(selectedVariant?.stock || 10, quantity + 1))
              }
              className="px-4 py-3 text-ink hover:text-accent transition-colors font-display font-semibold"
              aria-label="Padidinti kiekį"
            >
              +
            </button>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!selectedVariant || selectedVariant.stock === 0}
            className="flex-1 font-display font-medium tracking-tight rounded-md transition-all text-base px-6 shadow-accent disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: added
                ? "var(--color-success)"
                : "var(--color-accent)",
              color: "white",
            }}
          >
            {added
              ? "✓ Pridėta į krepšelį"
              : `Į krepšelį — ${(price * quantity).toFixed(2)} €`}
          </button>
        </div>

        {/* Accordion — tik techniniai duomenys iš DB */}
        <div className="border-t border-line">
          <div className="border-b border-line">
            <button
              onClick={() => toggleSection("tech")}
              className="w-full flex items-center justify-between py-4 text-left"
            >
              <span className="text-sm font-display font-semibold uppercase tracking-widest text-ink">
                Techninė informacija
              </span>
              <span className="text-muted text-lg leading-none">
                {openSections.tech ? "−" : "+"}
              </span>
            </button>
            {openSections.tech && (
              <div className="pb-5 text-sm text-muted space-y-1.5 leading-relaxed">
                {product.category && (
                  <p>
                    <strong className="text-ink font-display">Kategorija:</strong>{" "}
                    {product.category.name}
                  </p>
                )}
                {product.sku && (
                  <p>
                    <strong className="text-ink font-display">Modelis:</strong>{" "}
                    {product.sku}
                  </p>
                )}
                <p>
                  <strong className="text-ink font-display">Spalvų:</strong>{" "}
                  {uniqueColors.length}
                </p>
                <p>
                  <strong className="text-ink font-display">Dydžių:</strong>{" "}
                  {sizesForColor.length}
                </p>
              </div>
            )}
          </div>

          {/* Pilnas aprašymas — tik jei yra duomenų */}
          {hasDescription && (
            <div className="border-b border-line">
              <button
                onClick={() => toggleSection("description")}
                className="w-full flex items-center justify-between py-4 text-left"
              >
                <span className="text-sm font-display font-semibold uppercase tracking-widest text-ink">
                  Pilnas aprašymas
                </span>
                <span className="text-muted text-lg leading-none">
                  {openSections.description ? "−" : "+"}
                </span>
              </button>
              {openSections.description && (
                <div className="pb-5 text-sm text-muted leading-relaxed">
                  <p>{product.description}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info apie prekę */}
        <div className="mt-6 bg-paper-soft border border-line rounded-md p-4">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-accent flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="text-xs text-muted font-display leading-relaxed">
              <p className="font-semibold text-ink mb-1">Informacija verslui</p>
              <p>
                Užsakymas nuo <strong>10 vnt.</strong>, pristatymas per 3–5
                dienas. Dėl logotipo spausdinimo susisiekite{" "}
                <a
                  href="mailto:info@eprintukas.lt"
                  className="text-accent hover:underline"
                >
                  info@eprintukas.lt
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

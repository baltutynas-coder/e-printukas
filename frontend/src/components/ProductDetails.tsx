"use client";

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

export default function ProductDetails({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);

  const uniqueColors = useMemo(() => [...new Map(
    product.variants.map((v) => [v.colorHex, { color: v.color, hex: v.colorHex }])
  ).values()], [product.variants]);

  const [selectedColor, setSelectedColor] = useState(uniqueColors[0]?.hex || "");

  const selectedColorName = uniqueColors.find((c) => c.hex === selectedColor)?.color || "";

  const currentImage = useMemo(() => {
    if (!product.images || product.images.length === 0) return null;
    const colorImage = product.images.find((img) =>
      img.alt && img.alt.toLowerCase() === selectedColorName.toLowerCase()
    );
    return colorImage || product.images[0];
  }, [product.images, selectedColorName]);

  const sizesForColor = product.variants
    .filter((v) => v.colorHex === selectedColor)
    .map((v) => ({ size: v.size, stock: v.stock }));

  const [selectedSize, setSelectedSize] = useState(sizesForColor[0]?.size || "");
  const selectedVariant = product.variants.find(
    (v) => v.colorHex === selectedColor && v.size === selectedSize
  );

  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [showTechInfo, setShowTechInfo] = useState(false);

  const handleColorChange = (hex: string) => {
    setSelectedColor(hex);
    const firstSize = product.variants.find((v) => v.colorHex === hex);
    if (firstSize) setSelectedSize(firstSize.size);
    setQuantity(1);
  };

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    const colorName = uniqueColors.find((c) => c.hex === selectedColor)?.color || "";
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
      {/* Nuotrauka */}
      <div>
        <div className="aspect-square bg-white flex items-center justify-center overflow-hidden">
          {currentImage ? (
            <img
              src={currentImage.url}
              alt={currentImage.alt || product.name}
              className="w-full h-full object-contain p-8 transition-opacity duration-300"
              key={currentImage.url}
            />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={0.5} stroke="currentColor" className="w-32 h-32 text-gray-200">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
            </svg>
          )}
        </div>
      </div>

      {/* Informacija */}
      <div>
        {/* Pavadinimas — Roly stilius */}
        <h1 className="font-[family-name:var(--font-montserrat)]">
          <span className="text-4xl font-black uppercase tracking-tight text-gray-900">
            {product.name}
          </span>
          {product.sku && (
            <span className="text-2xl font-normal text-gray-400 ml-3">{product.sku}</span>
          )}
        </h1>

        {/* Aprašymas */}
        {product.description && (
          <p className="text-sm text-gray-500 mt-4 leading-relaxed">{product.description}</p>
        )}

        {/* Kaina */}
        <div className="flex items-center gap-3 mt-6 pb-6 border-b border-gray-100">
          <span className="text-3xl font-black text-gray-900">
            {parseFloat(product.price).toFixed(2)} €
          </span>
          {product.comparePrice && (
            <>
              <span className="text-lg text-gray-400 line-through">
                {parseFloat(product.comparePrice).toFixed(2)} €
              </span>
              <span className="bg-black text-white text-xs font-bold px-2 py-1">
                -{Math.round((1 - parseFloat(product.price) / parseFloat(product.comparePrice)) * 100)}%
              </span>
            </>
          )}
        </div>

        {/* Spalvos — Roly stilius su kodais */}
        <div className="mt-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
            Spalva: <span className="text-gray-900">{selectedColorName}</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {uniqueColors.map((c) => (
              <button
                key={c.hex}
                onClick={() => handleColorChange(c.hex)}
                title={c.color}
                className={`w-9 h-9 rounded-full transition-all ${
                  selectedColor === c.hex
                    ? "ring-2 ring-black ring-offset-2 scale-110"
                    : "border border-gray-300 hover:scale-105"
                }`}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
        </div>

        {/* Dydžiai */}
        <div className="mt-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Dydis</h3>
          <div className="flex flex-wrap gap-2">
            {sizesForColor.map((s) => (
              <button
                key={s.size}
                onClick={() => { setSelectedSize(s.size); setQuantity(1); }}
                disabled={s.stock === 0}
                className={`min-w-12 px-4 py-2.5 text-sm font-medium transition-all ${
                  selectedSize === s.size
                    ? "bg-black text-white"
                    : s.stock === 0
                    ? "bg-gray-50 text-gray-300 cursor-not-allowed"
                    : "bg-white border border-gray-200 text-gray-700 hover:border-black"
                }`}
              >
                {s.size}
              </button>
            ))}
          </div>
        </div>

        {selectedVariant && (
          <p className="text-xs text-gray-400 mt-3">
            Sandėlyje: {selectedVariant.stock} vnt.
          </p>
        )}

        {/* Kiekis + Į krepšelį */}
        <div className="flex items-center gap-3 mt-8">
          <div className="flex items-center border border-gray-200">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-4 py-3 text-gray-500 hover:text-black transition-colors"
            >−</button>
            <span className="px-4 py-3 font-medium text-gray-900 min-w-12 text-center border-x border-gray-200">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(Math.min(selectedVariant?.stock || 1, quantity + 1))}
              className="px-4 py-3 text-gray-500 hover:text-black transition-colors"
            >+</button>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!selectedVariant || selectedVariant.stock === 0}
            className={`flex-1 font-bold py-3.5 px-8 uppercase tracking-wider text-sm transition-all ${
              added
                ? "bg-green-600 text-white"
                : "bg-black hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 text-white"
            }`}
          >
            {added ? "✓ PRIDĖTA" : `Į KREPŠELĮ — ${(parseFloat(product.price) * quantity).toFixed(2)} €`}
          </button>
        </div>

        {/* Techninė informacija — Roly accordion stilius */}
        <div className="mt-10 border-t border-gray-100">
          <button
            onClick={() => setShowTechInfo(!showTechInfo)}
            className="w-full flex items-center justify-between py-4 text-left"
          >
            <span className="text-sm font-bold text-gray-900">Techninė informacija</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
              className={`w-4 h-4 text-gray-400 transition-transform ${showTechInfo ? "rotate-180" : ""}`}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
          {showTechInfo && (
            <div className="pb-4 text-sm text-gray-500 space-y-2">
              <p>{product.description}</p>
              {product.category && <p>Kategorija: {product.category.name}</p>}
              {product.sku && <p>Modelis: {product.sku}</p>}
              <p>Spalvų: {uniqueColors.length}</p>
              <p>Dydžių: {sizesForColor.length}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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
  images: ProductImage[];
  category: { name: string; slug: string } | null;
  variants: Variant[];
}

export default function ProductDetails({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);

  // Unikalios spalvos
  const uniqueColors = useMemo(() => [...new Map(
    product.variants.map((v) => [v.colorHex, { color: v.color, hex: v.colorHex }])
  ).values()], [product.variants]);

  const [selectedColor, setSelectedColor] = useState(uniqueColors[0]?.hex || "");

  // Rasti nuotrauką pagal pasirinktą spalvą
  const selectedColorName = uniqueColors.find((c) => c.hex === selectedColor)?.color || "";

  const currentImage = useMemo(() => {
    if (!product.images || product.images.length === 0) return null;

    // Ieškoti nuotraukos kuri atitinka pasirinktą spalvą (pagal alt tekstą)
    const colorImage = product.images.find((img) =>
      img.alt && img.alt.toLowerCase() === selectedColorName.toLowerCase()
    );

    // Jei rasta — grąžinti, jei ne — pirma nuotrauka
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Nuotrauka — keičiasi pagal spalvą */}
      <div className="aspect-square bg-gray-50 rounded-2xl flex items-center justify-center overflow-hidden">
        {currentImage ? (
          <img
            src={currentImage.url}
            alt={currentImage.alt || product.name}
            className="w-full h-full object-contain transition-opacity duration-300"
            key={currentImage.url}
          />
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={0.5} stroke="currentColor" className="w-32 h-32 text-gray-300">
            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
          </svg>
        )}
      </div>

      {/* Informacija */}
      <div>
        {product.category && (
          <span className="text-sm text-emerald-600 font-medium">{product.category.name}</span>
        )}

        <h1 className="text-3xl font-bold text-gray-900 mt-2">{product.name}</h1>

        <div className="flex items-center gap-3 mt-4">
          <span className="text-3xl font-bold text-gray-900">
            {parseFloat(product.price).toFixed(2)} €
          </span>
          {product.comparePrice && (
            <span className="text-xl text-gray-400 line-through">
              {parseFloat(product.comparePrice).toFixed(2)} €
            </span>
          )}
          {product.comparePrice && (
            <span className="bg-red-100 text-red-700 text-sm font-bold px-2 py-1 rounded">
              -{Math.round((1 - parseFloat(product.price) / parseFloat(product.comparePrice)) * 100)}%
            </span>
          )}
        </div>

        {product.description && (
          <p className="text-gray-600 mt-6 leading-relaxed">{product.description}</p>
        )}

        {/* Spalva */}
        <div className="mt-8">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Spalva: <span className="font-normal text-gray-600">{selectedColorName}</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {uniqueColors.map((c) => (
              <button
                key={c.hex}
                onClick={() => handleColorChange(c.hex)}
                title={c.color}
                className={`w-10 h-10 rounded-full border-2 transition-all ${
                  selectedColor === c.hex
                    ? "border-emerald-500 ring-2 ring-emerald-200 scale-110"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
        </div>

        {/* Dydis */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Dydis</h3>
          <div className="flex flex-wrap gap-2">
            {sizesForColor.map((s) => (
              <button
                key={s.size}
                onClick={() => { setSelectedSize(s.size); setQuantity(1); }}
                disabled={s.stock === 0}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                  selectedSize === s.size
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : s.stock === 0
                    ? "border-gray-200 text-gray-300 cursor-not-allowed"
                    : "border-gray-300 text-gray-700 hover:border-gray-400"
                }`}
              >
                {s.size}
              </button>
            ))}
          </div>
        </div>

        {selectedVariant && (
          <p className="text-sm text-gray-500 mt-3">
            Sandėlyje: <span className="font-medium text-gray-700">{selectedVariant.stock} vnt.</span>
          </p>
        )}

        {/* Kiekis + Į krepšelį */}
        <div className="flex items-center gap-4 mt-8">
          <div className="flex items-center border border-gray-300 rounded-lg">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-3 py-2 text-gray-600 hover:text-gray-900"
            >−</button>
            <span className="px-4 py-2 font-medium text-gray-900 min-w-[3rem] text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(Math.min(selectedVariant?.stock || 1, quantity + 1))}
              className="px-3 py-2 text-gray-600 hover:text-gray-900"
            >+</button>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!selectedVariant || selectedVariant.stock === 0}
            className={`flex-1 font-semibold py-3 px-8 rounded-lg transition-all ${
              added
                ? "bg-emerald-700 text-white"
                : "bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 text-white"
            }`}
          >
            {added ? "✓ Pridėta!" : `Į krepšelį — ${(parseFloat(product.price) * quantity).toFixed(2)} €`}
          </button>
        </div>
      </div>
    </div>
  );
}

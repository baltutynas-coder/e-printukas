"use client";

/**
 * Admin produktų puslapis — /admin/produktai
 *
 * Sprint B atnaujinimas:
 *   - Pridėtas tag'ų multi-select formoje (2 grupės: PROGOS + PRAMONĖS)
 *   - Tag'ai rodomi produkto kortelėje sąraše
 *   - handleSave siunčia tagIds per /api/backend/products
 *
 * Sprint 5.3 stilistika nekeista (TRUEWERK).
 */

import { useEffect, useState } from "react";
import { adminFetch, useAuthStore } from "@/lib/authStore";

interface Tag {
  id: string;
  slug: string;
  name: string;
  type: "OCCASION" | "INDUSTRY";
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    comparePrice: "",
    categoryId: "",
    published: true,
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const loadProducts = async () => {
    try {
      const res = await adminFetch("/products?limit=100");
      const data = await res.json();
      setProducts(data.products || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const loadCategories = async () => {
    try {
      const res = await fetch("/api/backend/categories");
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (e) {
      console.error(e);
    }
  };

  // SPRINT B — užkrauti visus tag'us
  const loadTags = async () => {
    try {
      const res = await fetch("/api/backend/tags");
      const data = await res.json();
      setAllTags(data.tags || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadProducts();
    loadCategories();
    loadTags();
  }, []);

  const occasionTags = allTags.filter((t) => t.type === "OCCASION");
  const industryTags = allTags.filter((t) => t.type === "INDUSTRY");

  const openForm = (product?: any) => {
    if (product) {
      setEditingProduct(product);
      setForm({
        name: product.name,
        description: product.description || "",
        price: product.price,
        comparePrice: product.comparePrice || "",
        categoryId: product.categoryId || "",
        published: product.published,
      });
      // SPRINT B — pre-select esamus tag'us
      setSelectedTagIds(product.tags?.map((t: Tag) => t.id) || []);
    } else {
      setEditingProduct(null);
      setForm({
        name: "",
        description: "",
        price: "",
        comparePrice: "",
        categoryId: "",
        published: true,
      });
      setSelectedTagIds([]);
    }
    setShowForm(true);
  };

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = editingProduct
        ? `/products/${editingProduct.id}`
        : "/products";
      const method = editingProduct ? "PUT" : "POST";
      await adminFetch(url, {
        method,
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
          comparePrice: form.comparePrice
            ? parseFloat(form.comparePrice)
            : null,
          categoryId: form.categoryId || null,
          tagIds: selectedTagIds, // SPRINT B
        }),
      });
      setShowForm(false);
      loadProducts();
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Ar tikrai norite ištrinti „${name}"?`)) return;
    try {
      await adminFetch(`/products/${id}`, { method: "DELETE" });
      loadProducts();
    } catch (e) {
      console.error(e);
    }
  };

  const togglePublished = async (product: any) => {
    try {
      await adminFetch(`/products/${product.id}`, {
        method: "PUT",
        body: JSON.stringify({ published: !product.published }),
      });
      loadProducts();
    } catch (e) {
      console.error(e);
    }
  };

  const handleImageUpload = async (productId: string, files: FileList) => {
    setUploading(true);
    const token = useAuthStore.getState().token;

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("productId", productId);

      try {
        await fetch("/api/backend/upload", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
      } catch (e) {
        console.error("Upload error:", e);
      }
    }

    setUploading(false);
    loadProducts();
  };

  const handleImageDelete = async (imageId: string) => {
    if (!confirm("Ištrinti nuotrauką?")) return;
    try {
      await adminFetch(`/upload/${imageId}`, { method: "DELETE" });
      loadProducts();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <p className="text-sm font-display uppercase tracking-widest text-muted">
          Kraunama...
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Antraštė */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-8 h-px bg-accent" aria-hidden="true" />
            <span className="text-xs font-display font-medium uppercase tracking-widest text-accent">
              Asortimentas
            </span>
          </div>
          <h1
            className="text-3xl lg:text-4xl font-display font-semibold tracking-tight"
            style={{ color: "var(--color-ink)" }}
          >
            Produktai
          </h1>
          <p className="mt-2 text-sm text-muted font-display uppercase tracking-wider">
            {products.length}{" "}
            {products.length === 1 ? "produktas" : "produktai"}
          </p>
        </div>

        <button
          onClick={() => openForm()}
          className="font-display font-medium rounded-md transition-all text-sm px-5 py-2.5"
          style={{
            backgroundColor: "var(--color-accent)",
            color: "white",
          }}
        >
          + Naujas produktas
        </button>
      </div>

      {/* Forma */}
      {showForm && (
        <div className="bg-white border border-line rounded-md p-6 mb-6">
          <h2
            className="text-lg font-display font-semibold mb-5"
            style={{ color: "var(--color-ink)" }}
          >
            {editingProduct ? "Redaguoti produktą" : "Naujas produktas"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-display font-semibold uppercase tracking-widest text-ink mb-2">
                Pavadinimas *
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-line-strong rounded-sm bg-white focus:outline-none focus:border-accent transition-colors text-sm font-display"
                style={{ color: "var(--color-ink)" }}
                placeholder="Pvz: Arsenal"
              />
            </div>
            <div>
              <label className="block text-xs font-display font-semibold uppercase tracking-widest text-ink mb-2">
                Kategorija
              </label>
              <select
                value={form.categoryId}
                onChange={(e) =>
                  setForm({ ...form, categoryId: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-line-strong rounded-sm bg-white focus:outline-none focus:border-accent transition-colors text-sm font-display"
                style={{ color: "var(--color-ink)" }}
              >
                <option value="">— Pasirinkti —</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-display font-semibold uppercase tracking-widest text-ink mb-2">
                Kaina (€) *
              </label>
              <input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full px-4 py-2.5 border border-line-strong rounded-sm bg-white focus:outline-none focus:border-accent transition-colors text-sm font-display"
                style={{ color: "var(--color-ink)" }}
                placeholder="3.50"
              />
            </div>
            <div>
              <label className="block text-xs font-display font-semibold uppercase tracking-widest text-ink mb-2">
                Sena kaina (€)
              </label>
              <input
                type="number"
                step="0.01"
                value={form.comparePrice}
                onChange={(e) =>
                  setForm({ ...form, comparePrice: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-line-strong rounded-sm bg-white focus:outline-none focus:border-accent transition-colors text-sm font-display"
                style={{ color: "var(--color-ink)" }}
                placeholder="4.99"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-display font-semibold uppercase tracking-widest text-ink mb-2">
                Aprašymas
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-2.5 border border-line-strong rounded-sm bg-white focus:outline-none focus:border-accent transition-colors text-sm font-display resize-none"
                style={{ color: "var(--color-ink)" }}
                placeholder="Produkto aprašymas..."
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) =>
                  setForm({ ...form, published: e.target.checked })
                }
                id="published"
                className="w-4 h-4 accent-accent"
              />
              <label
                htmlFor="published"
                className="text-sm font-display text-ink"
              >
                Publikuotas
              </label>
            </div>
          </div>

          {/* SPRINT B — Tag'ų multi-select */}
          {allTags.length > 0 && (
            <div className="mt-6 pt-6 border-t border-line">
              {/* PROGOS */}
              <div className="mb-5">
                <label className="block text-xs font-display font-semibold uppercase tracking-widest text-ink mb-3">
                  Pagal progą {selectedTagIds.length > 0 && (
                    <span className="text-muted font-normal">
                      ({occasionTags.filter((t) => selectedTagIds.includes(t.id)).length} pasirinkta)
                    </span>
                  )}
                </label>
                <div className="flex flex-wrap gap-2">
                  {occasionTags.map((tag) => {
                    const isSelected = selectedTagIds.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        className="text-xs font-display font-medium px-3 py-2 rounded-sm border transition-all"
                        style={{
                          backgroundColor: isSelected
                            ? "var(--color-accent)"
                            : "white",
                          color: isSelected ? "white" : "var(--color-ink)",
                          borderColor: isSelected
                            ? "var(--color-accent)"
                            : "var(--color-line-strong)",
                        }}
                      >
                        {isSelected && "✓ "}{tag.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* PRAMONĖS */}
              <div>
                <label className="block text-xs font-display font-semibold uppercase tracking-widest text-ink mb-3">
                  Pagal pramonę {selectedTagIds.length > 0 && (
                    <span className="text-muted font-normal">
                      ({industryTags.filter((t) => selectedTagIds.includes(t.id)).length} pasirinkta)
                    </span>
                  )}
                </label>
                <div className="flex flex-wrap gap-2">
                  {industryTags.map((tag) => {
                    const isSelected = selectedTagIds.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        className="text-xs font-display font-medium px-3 py-2 rounded-sm border transition-all"
                        style={{
                          backgroundColor: isSelected
                            ? "var(--color-ink)"
                            : "white",
                          color: isSelected ? "white" : "var(--color-ink)",
                          borderColor: isSelected
                            ? "var(--color-ink)"
                            : "var(--color-line-strong)",
                        }}
                      >
                        {isSelected && "✓ "}{tag.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSave}
              disabled={saving || !form.name || !form.price}
              className="font-display font-medium rounded-md transition-all text-sm px-6 py-2.5 disabled:opacity-50"
              style={{
                backgroundColor: "var(--color-accent)",
                color: "white",
              }}
            >
              {saving ? "Saugoma..." : "Išsaugoti"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="font-display font-medium rounded-md transition-all text-sm px-6 py-2.5 border border-line-strong bg-white hover:border-accent"
              style={{ color: "var(--color-ink)" }}
            >
              Atšaukti
            </button>
          </div>
        </div>
      )}

      {/* Produktų sąrašas */}
      <div className="space-y-3">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white border border-line rounded-md p-4 hover:border-accent transition-colors"
          >
            <div className="flex items-start gap-4">
              {/* Nuotraukos */}
              <div className="flex gap-2 flex-shrink-0">
                {product.images?.map((img: any) => (
                  <div key={img.id} className="relative group">
                    <img
                      src={img.url}
                      alt={img.alt || product.name}
                      className="w-16 h-16 object-contain p-1 bg-white border border-line rounded-sm"
                    />
                    <button
                      onClick={() => handleImageDelete(img.id)}
                      className="absolute -top-1 -right-1 w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full text-white"
                      style={{ backgroundColor: "var(--color-error)" }}
                    >
                      ×
                    </button>
                  </div>
                ))}
                <label className="w-16 h-16 border-2 border-dashed border-line-strong rounded-sm flex items-center justify-center cursor-pointer hover:border-accent hover:bg-paper-soft transition-colors">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    className="hidden"
                    onChange={(e) =>
                      e.target.files &&
                      handleImageUpload(product.id, e.target.files)
                    }
                    disabled={uploading}
                  />
                  {uploading ? (
                    <span className="text-[10px] font-display text-muted">
                      ...
                    </span>
                  ) : (
                    <svg
                      className="w-5 h-5 text-muted"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 4.5v15m7.5-7.5h-15"
                      />
                    </svg>
                  )}
                </label>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3
                    className="font-display font-semibold text-base"
                    style={{ color: "var(--color-ink)" }}
                  >
                    {product.name}
                  </h3>
                  <span className="text-xs text-muted font-mono">
                    {product.sku}
                  </span>
                  <button onClick={() => togglePublished(product)}>
                    <span
                      className="text-[10px] font-display font-medium uppercase tracking-widest px-2 py-0.5 rounded-sm"
                      style={{
                        backgroundColor: product.published
                          ? "rgba(15, 110, 86, 0.1)"
                          : "rgba(14, 14, 14, 0.08)",
                        color: product.published
                          ? "var(--color-success)"
                          : "var(--color-muted)",
                      }}
                    >
                      {product.published ? "Aktyvus" : "Juodraštis"}
                    </span>
                  </button>
                  {/* SPRINT B — supplier badge */}
                  {product.supplier && (
                    <span
                      className="text-[10px] font-display font-medium uppercase tracking-widest px-2 py-0.5 rounded-sm"
                      style={{
                        backgroundColor:
                          product.supplier === "STAMINA"
                            ? "rgba(208, 89, 30, 0.1)"
                            : "rgba(14, 14, 14, 0.05)",
                        color:
                          product.supplier === "STAMINA"
                            ? "var(--color-accent)"
                            : "var(--color-muted)",
                      }}
                    >
                      {product.supplier}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted font-display mb-2">
                  {product.category?.name || "—"} ·{" "}
                  {product.variants?.length || 0} variantų
                </p>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-display font-semibold text-accent">
                    {parseFloat(product.price).toFixed(2)} €
                  </span>
                  {product.comparePrice && (
                    <span className="text-sm text-muted line-through">
                      {parseFloat(product.comparePrice).toFixed(2)} €
                    </span>
                  )}
                </div>
                {/* SPRINT B — tag'ų chips */}
                {product.tags && product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2 mb-2">
                    {product.tags.map((tag: Tag) => (
                      <span
                        key={tag.id}
                        className="text-[10px] font-display px-2 py-0.5 rounded-sm border"
                        style={{
                          backgroundColor:
                            tag.type === "OCCASION"
                              ? "rgba(208, 89, 30, 0.08)"
                              : "rgba(14, 14, 14, 0.05)",
                          borderColor:
                            tag.type === "OCCASION"
                              ? "var(--color-accent)"
                              : "var(--color-line-strong)",
                          color:
                            tag.type === "OCCASION"
                              ? "var(--color-accent)"
                              : "var(--color-ink)",
                        }}
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}
                {/* Spalvos */}
                <div className="flex gap-1">
                  {[
                    ...new Map(
                      product.variants?.map((v: any) => [v.colorHex, v]) || []
                    ).values(),
                  ]
                    .slice(0, 8)
                    .map((v: any) => (
                      <span
                        key={v.colorHex}
                        className="w-4 h-4 rounded-full border border-line-strong"
                        style={{ backgroundColor: v.colorHex }}
                        title={v.color}
                      />
                    ))}
                  {product.variants &&
                    new Set(product.variants.map((v: any) => v.colorHex)).size >
                      8 && (
                      <span className="text-xs text-muted ml-1 font-display">
                        +
                        {new Set(product.variants.map((v: any) => v.colorHex))
                          .size - 8}
                      </span>
                    )}
                </div>
              </div>

              {/* Veiksmai */}
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => openForm(product)}
                  className="text-xs font-display uppercase tracking-widest text-accent hover:underline px-3 py-1"
                >
                  Redaguoti
                </button>
                <button
                  onClick={() => handleDelete(product.id, product.name)}
                  className="text-xs font-display uppercase tracking-widest hover:underline px-3 py-1"
                  style={{ color: "var(--color-error)" }}
                >
                  Trinti
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

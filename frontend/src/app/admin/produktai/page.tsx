"use client";

import { useEffect, useState } from "react";
import { adminFetch, useAuthStore } from "@/lib/authStore";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    name: "", description: "", price: "", comparePrice: "", categoryId: "", published: true,
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  const loadProducts = async () => {
    try {
      const res = await adminFetch("/products?limit=100");
      const data = await res.json();
      setProducts(data.products || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const loadCategories = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/categories");
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { loadProducts(); loadCategories(); }, []);

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
    } else {
      setEditingProduct(null);
      setForm({ name: "", description: "", price: "", comparePrice: "", categoryId: "", published: true });
    }
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = editingProduct ? `/products/${editingProduct.id}` : "/products";
      const method = editingProduct ? "PUT" : "POST";
      await adminFetch(url, {
        method,
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
          comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : null,
          categoryId: form.categoryId || null,
        }),
      });
      setShowForm(false);
      loadProducts();
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Ar tikrai norite ištrinti "${name}"?`)) return;
    try {
      await adminFetch(`/products/${id}`, { method: "DELETE" });
      loadProducts();
    } catch (e) { console.error(e); }
  };

  const togglePublished = async (product: any) => {
    try {
      await adminFetch(`/products/${product.id}`, {
        method: "PUT",
        body: JSON.stringify({ published: !product.published }),
      });
      loadProducts();
    } catch (e) { console.error(e); }
  };

  // Nuotraukos įkėlimas
  const handleImageUpload = async (productId: string, files: FileList) => {
    setUploading(true);
    const token = useAuthStore.getState().token;

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("productId", productId);

      try {
        await fetch("http://localhost:4000/api/upload", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
      } catch (e) { console.error("Upload error:", e); }
    }

    setUploading(false);
    loadProducts();
  };

  // Nuotraukos trynimas
  const handleImageDelete = async (imageId: string) => {
    if (!confirm("Ištrinti nuotrauką?")) return;
    try {
      await adminFetch(`/upload/${imageId}`, { method: "DELETE" });
      loadProducts();
    } catch (e) { console.error(e); }
  };

  if (loading) return <div className="text-center py-20 text-gray-400">Kraunama...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Produktai ({products.length})</h1>
        <button onClick={() => openForm()} className="bg-black hover:bg-gray-800 text-white font-medium px-5 py-2  transition-colors text-sm">
          + Naujas produktas
        </button>
      </div>

      {/* Forma */}
      {showForm && (
        <div className="bg-white border border-gray-200  p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">
            {editingProduct ? "Redaguoti produktą" : "Naujas produktas"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pavadinimas *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300  focus:ring-2 focus:ring-gray-900 outline-none text-sm" placeholder="Pvz: Braco" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategorija</label>
              <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300  focus:ring-2 focus:ring-gray-900 outline-none text-sm">
                <option value="">-- Pasirinkti --</option>
                {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kaina (€) *</label>
              <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300  focus:ring-2 focus:ring-gray-900 outline-none text-sm" placeholder="3.50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sena kaina (€)</label>
              <input type="number" step="0.01" value={form.comparePrice} onChange={(e) => setForm({ ...form, comparePrice: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300  focus:ring-2 focus:ring-gray-900 outline-none text-sm" placeholder="4.99" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Aprašymas</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3}
                className="w-full px-3 py-2 border border-gray-300  focus:ring-2 focus:ring-gray-900 outline-none text-sm" placeholder="Produkto aprašymas..." />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} id="published" className="w-4 h-4 text-black rounded" />
              <label htmlFor="published" className="text-sm text-gray-700">Publikuotas</label>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={handleSave} disabled={saving || !form.name || !form.price}
              className="bg-black hover:bg-gray-800 disabled:bg-gray-300 text-white font-medium px-6 py-2  text-sm transition-colors">
              {saving ? "Saugoma..." : "Išsaugoti"}
            </button>
            <button onClick={() => setShowForm(false)} className="border border-gray-300 text-gray-700 px-6 py-2  text-sm hover:bg-gray-50 transition-colors">
              Atšaukti
            </button>
          </div>
        </div>
      )}

      {/* Produktų lentelė */}
      <div className="space-y-4">
        {products.map((product) => (
          <div key={product.id} className="bg-white border border-gray-200  p-4">
            <div className="flex items-start gap-4">
              {/* Nuotraukos */}
              <div className="flex gap-2 shrink-0">
                {product.images?.map((img: any) => (
                  <div key={img.id} className="relative group">
                    <img src={img.url} alt={img.alt || product.name} className="w-16 h-16 object-cover  border border-gray-200" />
                    <button
                      onClick={() => handleImageDelete(img.id)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >×</button>
                  </div>
                ))}
                {/* Įkelti nuotrauką */}
                <label className="w-16 h-16 border-2 border-dashed border-gray-300  flex items-center justify-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    className="hidden"
                    onChange={(e) => e.target.files && handleImageUpload(product.id, e.target.files)}
                    disabled={uploading}
                  />
                  {uploading ? (
                    <span className="text-xs text-gray-400">...</span>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  )}
                </label>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">{product.name}</h3>
                  <span className="text-xs text-gray-400 font-mono">{product.sku}</span>
                  <button onClick={() => togglePublished(product)}>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                      product.published ? "bg-gray-100 text-gray-800" : "bg-gray-100 text-gray-600"
                    }`}>
                      {product.published ? "Aktyvus" : "Juodraštis"}
                    </span>
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-1">{product.category?.name || "—"} · {product.variants?.length || 0} variantų</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-bold text-gray-900">{parseFloat(product.price).toFixed(2)} €</span>
                  {product.comparePrice && (
                    <span className="text-sm text-gray-400 line-through">{parseFloat(product.comparePrice).toFixed(2)} €</span>
                  )}
                </div>
                {/* Spalvos */}
                <div className="flex gap-1 mt-2">
                  {[...new Map(product.variants?.map((v: any) => [v.colorHex, v]) || []).values()].slice(0, 8).map((v: any) => (
                    <span key={v.colorHex} className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: v.colorHex }} title={v.color} />
                  ))}
                  {product.variants && new Set(product.variants.map((v: any) => v.colorHex)).size > 8 && (
                    <span className="text-xs text-gray-400 ml-1">+{new Set(product.variants.map((v: any) => v.colorHex)).size - 8}</span>
                  )}
                </div>
              </div>

              {/* Veiksmai */}
              <div className="flex gap-2 shrink-0">
                <button onClick={() => openForm(product)} className="text-sm text-blue-600 hover:text-blue-800 px-3 py-1 border border-blue-200  hover:bg-blue-50 transition-colors">
                  Redaguoti
                </button>
                <button onClick={() => handleDelete(product.id, product.name)} className="text-sm text-red-500 hover:text-red-700 px-3 py-1 border border-red-200  hover:bg-red-50 transition-colors">
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




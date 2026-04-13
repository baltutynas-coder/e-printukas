"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/authStore";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCat, setEditingCat] = useState<any>(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try { const res = await fetch("http://localhost:4000/api/categories"); const data = await res.json(); setCategories(data.categories || []); } catch (e) { console.error(e); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openForm = (cat?: any) => { setEditingCat(cat || null); setName(cat?.name || ""); setShowForm(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingCat) { await adminFetch(`/categories/${editingCat.id}`, { method: "PUT", body: JSON.stringify({ name }) }); }
      else { await adminFetch("/categories", { method: "POST", body: JSON.stringify({ name }) }); }
      setShowForm(false); setName(""); load();
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const handleDelete = async (id: string, catName: string) => {
    if (!confirm(`Ar tikrai norite ištrinti "${catName}"?`)) return;
    try { await adminFetch(`/categories/${id}`, { method: "DELETE" }); load(); } catch (e) { console.error(e); }
  };

  if (loading) return <div className="text-center py-20 text-gray-400">Kraunama...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Kategorijos ({categories.length})</h1>
        <button onClick={() => openForm()} className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium px-5 py-2 rounded-lg text-sm">+ Nauja kategorija</button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">{editingCat ? "Redaguoti" : "Nauja kategorija"}</h2>
          <div className="flex gap-3">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Kategorijos pavadinimas"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
            <button onClick={handleSave} disabled={saving || !name} className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 text-white font-medium px-6 py-2 rounded-lg text-sm">{saving ? "..." : "Išsaugoti"}</button>
            <button onClick={() => setShowForm(false)} className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50">Atšaukti</button>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>
              <th className="px-6 py-3 text-left">Pavadinimas</th>
              <th className="px-6 py-3 text-left">Slug</th>
              <th className="px-6 py-3 text-center">Produktų</th>
              <th className="px-6 py-3 text-right">Veiksmai</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-50">
                <td className="px-6 py-3 text-sm font-medium text-gray-900">{cat.name}</td>
                <td className="px-6 py-3 text-sm text-gray-500 font-mono">{cat.slug}</td>
                <td className="px-6 py-3 text-sm text-center">{cat._count?.products || 0}</td>
                <td className="px-6 py-3 text-right">
                  <button onClick={() => openForm(cat)} className="text-sm text-blue-600 hover:text-blue-800 mr-3">Redaguoti</button>
                  <button onClick={() => handleDelete(cat.id, cat.name)} className="text-sm text-red-500 hover:text-red-700">Trinti</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

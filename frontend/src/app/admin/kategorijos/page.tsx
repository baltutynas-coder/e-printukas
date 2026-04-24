"use client";

/**
 * Admin kategorijų puslapis — /admin/kategorijos
 *
 * Sprint 5.3 redesign:
 *   - TRUEWERK stilius (cream/white, oranžinis akcentas)
 *   - Space Grotesk antraštės
 *   - Aiškus pridėjimo/redagavimo formų UI
 *
 * Pataisymai:
 *   - Anksčiau `fetch("https://...railway...")` tiesiai — CORS problema
 *   - Dabar naudoja `/api/backend/categories` proxy
 *
 * Logika nekeista: POST / PUT / DELETE per adminFetch
 */

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
    try {
      // Naudojam proxy, ne tiesiai Railway
      const res = await fetch("/api/backend/categories");
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openForm = (cat?: any) => {
    setEditingCat(cat || null);
    setName(cat?.name || "");
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingCat) {
        await adminFetch(`/categories/${editingCat.id}`, {
          method: "PUT",
          body: JSON.stringify({ name }),
        });
      } else {
        await adminFetch("/categories", {
          method: "POST",
          body: JSON.stringify({ name }),
        });
      }
      setShowForm(false);
      setName("");
      load();
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  const handleDelete = async (id: string, catName: string) => {
    if (!confirm(`Ar tikrai norite ištrinti „${catName}"?`)) return;
    try {
      await adminFetch(`/categories/${id}`, { method: "DELETE" });
      load();
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
              Valdymas
            </span>
          </div>
          <h1
            className="text-3xl lg:text-4xl font-display font-semibold tracking-tight"
            style={{ color: "var(--color-ink)" }}
          >
            Kategorijos
          </h1>
          <p className="mt-2 text-sm text-muted font-display uppercase tracking-wider">
            {categories.length} {categories.length === 1 ? "kategorija" : "kategorijų"}
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
          + Nauja kategorija
        </button>
      </div>

      {/* Forma */}
      {showForm && (
        <div className="bg-white border border-line rounded-md p-6 mb-6">
          <h2
            className="text-lg font-display font-semibold mb-4"
            style={{ color: "var(--color-ink)" }}
          >
            {editingCat ? "Redaguoti kategoriją" : "Nauja kategorija"}
          </h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Kategorijos pavadinimas"
              className="flex-1 px-4 py-3 border border-line-strong rounded-sm bg-white focus:outline-none focus:border-accent transition-colors text-sm font-display"
              style={{ color: "var(--color-ink)" }}
            />
            <button
              onClick={handleSave}
              disabled={saving || !name}
              className="font-display font-medium rounded-md transition-all text-sm px-6 py-3 disabled:opacity-50"
              style={{
                backgroundColor: "var(--color-accent)",
                color: "white",
              }}
            >
              {saving ? "Saugoma..." : "Išsaugoti"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="font-display font-medium rounded-md transition-all text-sm px-6 py-3 border border-line-strong bg-white hover:border-accent"
              style={{ color: "var(--color-ink)" }}
            >
              Atšaukti
            </button>
          </div>
        </div>
      )}

      {/* Lentelė */}
      <div className="bg-white border border-line rounded-md overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-line bg-paper-soft">
            <tr>
              <th className="px-6 py-3 text-left text-[10px] font-display uppercase tracking-widest text-muted">
                Pavadinimas
              </th>
              <th className="px-6 py-3 text-left text-[10px] font-display uppercase tracking-widest text-muted">
                Slug
              </th>
              <th className="px-6 py-3 text-center text-[10px] font-display uppercase tracking-widest text-muted">
                Produktų
              </th>
              <th className="px-6 py-3 text-right text-[10px] font-display uppercase tracking-widest text-muted">
                Veiksmai
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {categories.map((cat) => (
              <tr
                key={cat.id}
                className="hover:bg-paper-soft transition-colors"
              >
                <td className="px-6 py-3 text-sm font-display font-medium text-ink">
                  {cat.name}
                </td>
                <td className="px-6 py-3 text-sm text-muted font-mono">
                  {cat.slug}
                </td>
                <td className="px-6 py-3 text-sm text-center font-display text-ink">
                  {cat._count?.products || 0}
                </td>
                <td className="px-6 py-3 text-right">
                  <button
                    onClick={() => openForm(cat)}
                    className="text-xs font-display uppercase tracking-widest text-accent hover:underline mr-4"
                  >
                    Redaguoti
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id, cat.name)}
                    className="text-xs font-display uppercase tracking-widest hover:underline"
                    style={{ color: "var(--color-error)" }}
                  >
                    Trinti
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

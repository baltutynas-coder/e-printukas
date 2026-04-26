/**
 * Sitemap generavimas — /sitemap.xml
 *
 * Sprint 9.1
 *
 * Next.js App Router automatiškai generuoja XML sitemap'ą iš šio failo.
 * Po deploy vartotojas gauna https://e-printukas.lt/sitemap.xml — Google
 * indeksuos visus produktus ir kategorijas.
 *
 * Struktūra:
 *   - Pradžia (priority 1.0)
 *   - Paieška, krepšelis (priority 0.5 — funkciniai puslapiai)
 *   - Kategorijos (priority 0.8 — svarbūs SEO)
 *   - Produktai (priority 0.7 — visi 245)
 *
 * Strategija: kategorijos turi aukštesnį priority nei produktai, nes jos
 * yra pagrindiniai įėjimo taškai iš Google paieškos
 * („marškinėliai su logotipu" → kategorijos puslapis, ne konkretus produktas).
 */

import type { MetadataRoute } from "next";

const BASE_URL = "https://e-printukas.vercel.app";
const BACKEND_URL = "https://e-printukas-production.up.railway.app/api";

async function getProducts() {
  try {
    const res = await fetch(`${BACKEND_URL}/products?limit=300`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.products || [];
  } catch (error) {
    console.error("Sitemap: produktų fetch klaida", error);
    return [];
  }
}

async function getCategories() {
  try {
    const res = await fetch(`${BACKEND_URL}/categories`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.categories || [];
  } catch (error) {
    console.error("Sitemap: kategorijų fetch klaida", error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  const now = new Date();

  // Statiniai pagrindiniai puslapiai
  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/paieska`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/krepselis`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  // Tėvinių kategorijų URL'ai (be parentId)
  const categoryUrls: MetadataRoute.Sitemap = categories
    .filter((c: any) => !c.parentId)
    .map((cat: any) => ({
      url: `${BASE_URL}/kategorija/${cat.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  // Produktų URL'ai (visi 245)
  const productUrls: MetadataRoute.Sitemap = products
    .filter((p: any) => p.published !== false)
    .map((product: any) => ({
      url: `${BASE_URL}/produktas/${product.slug}`,
      lastModified: product.updatedAt
        ? new Date(product.updatedAt)
        : now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

  return [...staticUrls, ...categoryUrls, ...productUrls];
}

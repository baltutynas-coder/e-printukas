/**
 * Kategorijos layout — /kategorija/[slug]/layout.tsx
 *
 * Sprint 9.2 SEO papildymas
 *
 * Kodėl layout, ne page.tsx?
 *   - kategorija/[slug]/page.tsx yra Client Component (filtravimas, useState)
 *   - generateMetadata neveikia Client Components — tik Server
 *   - Layout gali būti Server Component net jei vaikas yra Client
 *   - Tai kanoniškas Next.js App Router pattern'as: SEO per layout, UX per page
 *
 * Ką daro:
 *   - Fetch'ina kategoriją iš backend'o pagal slug
 *   - Generuoja unikalų title, description, OG image
 *   - Vaikas (page.tsx) lieka nekeistas — visa filtravimo logika veikia kaip
 *     anksčiau, bet dabar Google mato švarius metaduomenis
 */

import type { Metadata } from "next";

const BASE_URL = "https://e-printukas.vercel.app";

// Kategorijų aprašymai SEO — vienas sakinys, B2B fokusuotas
const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  "marskineliai-ir-polo":
    "Marškinėliai ir polo su logotipu verslui. Užsakymas nuo 10 vnt., pristatymas 3-5 d. Logo spauda garantuojama.",
  dzemperiai:
    "Džemperiai su logotipu jūsų komandai. Su gobtuvu ir be jo. Profesionali spauda, 3-5 d. pristatymas.",
  "sportine-kolekcija":
    "Sportinė apranga komandoms ir treniruotėms. Marškinėliai, kelnės, komplektai. Logo spauda nuo 10 vnt.",
  kelnes:
    "Klasikinės ir sportinės kelnės verslo ir darbo aprangai. Patogūs, kokybiški, su jūsų logotipu.",
  "darbo-drabuziai":
    "Darbo drabužiai HORECA, pramonės, statybos ir medicinos sektoriams. Saugumas ir kokybė.",
  eco: "Ekologiški drabužiai iš atsakingų šaltinių. Tvari mada verslui su logotipu.",
  striukes:
    "Striukės ir paltai su jūsų logotipu. Patogūs, šilti, profesionalūs. Užsakymas nuo 10 vnt.",
  "kiti-produktai":
    "Avalynė, aksesuarai ir kiti reklaminiai produktai verslui. Personalizavimas su logotipu.",
};

async function getCategoryBySlug(slug: string) {
  try {
    const res = await fetch(
      "https://e-printukas-production.up.railway.app/api/categories",
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return (data.categories || []).find((c: any) => c.slug === slug) || null;
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  // Jei kategorija nerasta — fallback
  if (!category) {
    return {
      title: "Kategorija nerasta",
      description: "Kategorija nerasta. Peržiūrėkite mūsų asortimentą.",
    };
  }

  const title = `${category.name} su logotipu`;
  const description =
    CATEGORY_DESCRIPTIONS[slug] ||
    `${category.name} verslo asortimentui. Užsakymas nuo 10 vnt., pristatymas 3-5 d. Logo spauda.`;

  const url = `${BASE_URL}/kategorija/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${category.name} | e.printukas.lt`,
      description,
      url,
      type: "website",
      locale: "lt_LT",
      siteName: "e.printukas.lt",
    },
    twitter: {
      card: "summary",
      title: `${category.name} | e.printukas.lt`,
      description,
    },
  };
}

export default function CategoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

/**
 * Paieškos layout — /paieska/layout.tsx
 *
 * Sprint 9.2 SEO papildymas
 *
 * Statinė metadata (paieškos puslapiai dažniausiai neturi unikalaus turinio
 * pagal užklausą — Google jų neindeksuoja ir taip nereikia dinamic metadata).
 *
 * Skirtumas nuo kategorijos:
 *   - Kategorija → unikalus title kiekvienam slug'ui (24 versijos)
 *   - Paieška → vienas title visam puslapiui
 */

import type { Metadata } from "next";

const BASE_URL = "https://e-printukas.vercel.app";

export const metadata: Metadata = {
  title: "Paieška",
  description:
    "Raskite reklaminį drabužį pagal pavadinimą — marškinėliai, polo, džemperiai, kelnės, darbo drabužiai. Užsakymas nuo 10 vnt.",
  alternates: {
    canonical: `${BASE_URL}/paieska`,
  },
  openGraph: {
    title: "Paieška | e.printukas.lt",
    description:
      "Raskite reklaminį drabužį pagal pavadinimą. Užsakymas nuo 10 vnt., pristatymas 3-5 d.",
    url: `${BASE_URL}/paieska`,
    type: "website",
    locale: "lt_LT",
    siteName: "e.printukas.lt",
  },
  // Paieškos puslapio rezultatai dažniausiai dinamiški — neindeksuojam
  robots: {
    index: false,
    follow: true,
  },
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

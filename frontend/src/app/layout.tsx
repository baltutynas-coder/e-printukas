/**
 * Pagrindinis puslapio layout'as (Root Layout).
 *
 * Next.js App Router architektūroje šis failas apgaubia VISUS puslapius —
 * čia apibrėžiame:
 *   1. <html> ir <body> tag'us
 *   2. Google Fonts užkrovimą per next/font (be layout shift)
 *   3. Metadata (SEO) — title, description, OG tag'us
 *   4. ConditionalChrome — sąlygiškai rodo Header/Footer (ne admin puslapiuose)
 *
 * Sprint 5.2 pokytis:
 *   - Anksčiau Header/Footer buvo tiesiogiai čia — rodomi VISUOSE puslapiuose
 *     (įskaitant /admin/*)
 *   - Dabar įdėtas ConditionalChrome (Client Component), kuris sąlygiškai
 *     rodo juos tik public puslapiuose
 *
 * TRUEWERK DNR:
 *   - Space Grotesk antraštėms
 *   - Inter body tekstui
 *   - bg-paper + text-ink bazė
 */

import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import ConditionalChrome from "@/components/ConditionalChrome";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://e-printukas.vercel.app"),
  title: {
    default: "e.printukas.lt — Drabužiai ir tekstilė su logotipu verslui",
    template: "%s | e.printukas.lt",
  },
  description:
    "Kokybiški reklaminiai drabužiai ir tekstilė Lietuvos verslui. Marškinėliai, polo, džemperiai su jūsų logotipu — nuo 10 vnt, pristatymas per 3–5 dienas.",
  keywords: [
    "marškinėliai su logotipu",
    "įmonės apranga",
    "reklaminė tekstilė",
    "polo marškinėliai",
    "džemperiai su spauda",
    "darbo drabužiai",
    "B2B drabužiai",
  ],
  authors: [{ name: "e.printukas.lt" }],
  openGraph: {
    type: "website",
    locale: "lt_LT",
    url: "https://e-printukas.vercel.app",
    siteName: "e.printukas.lt",
    title: "e.printukas.lt — Drabužiai ir tekstilė su logotipu verslui",
    description:
      "Kokybiški reklaminiai drabužiai Lietuvos verslui. Nuo 10 vnt, pristatymas per 3–5 dienas.",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/icon-192.png",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="lt" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <body className="bg-paper text-ink antialiased min-h-screen flex flex-col">
        <ConditionalChrome>{children}</ConditionalChrome>
      </body>
    </html>
  );
}

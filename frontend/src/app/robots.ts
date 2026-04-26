/**
 * robots.txt generavimas — /robots.txt
 *
 * Sprint 9.1
 *
 * Next.js automatiškai generuoja https://e-printukas.lt/robots.txt iš šio failo.
 *
 * Strategija:
 *   - Leisti visus public puslapius (kategorijos, produktai, paieška)
 *   - Blokuoti /admin/ — administratoriaus zonai negali patekti search bots
 *   - Blokuoti /api/ — backend proxy nereikalingas indeksavimui
 *   - Blokuoti /krepselis — vartotojo specifinis turinys
 *   - Nurodyti sitemap'o vietą — Google iš karto matys visus produktus
 */

import type { MetadataRoute } from "next";

const BASE_URL = "https://e-printukas.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/krepselis", "/checkout"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}

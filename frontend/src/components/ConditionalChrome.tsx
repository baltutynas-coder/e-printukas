"use client";

/**
 * ConditionalChrome — Client Component, kuris sąlyginai rodo Header + Footer.
 *
 * Sprint 5.2 sprendimas:
 *   - Root layout.tsx yra Server Component (metadata reikalauja jo)
 *   - Bet `usePathname()` veikia tik Client Components
 *   - Todėl išsprendžiam taip: layout.tsx lieka Server, o Header/Footer
 *     wrapper'iam į šį Client Component'ą, kuris naudoja usePathname()
 *
 * Logika:
 *   - Jei kelias prasideda /admin — nerodom nei Header, nei Footer
 *     (AdminLayout pats turi savo sidebar'ą)
 *   - Kitaip — rodom abu normaliai
 */

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ConditionalChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin") ?? false;

  if (isAdmin) {
    // Admin puslapiuose — tik turinys, be Header/Footer
    return <>{children}</>;
  }

  // Public puslapiuose — Header + turinys + Footer
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}

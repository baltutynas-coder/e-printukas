"use client";

/**
 * Header — pagrindinė puslapio navigacija.
 *
 * Dizaino sprendimai (TRUEWERK DNR):
 *   - Cream pagrindinė juosta (ne juoda kaip seniau), tamsus tik top bar
 *   - Display šriftas (Space Grotesk) — techniška tipografija
 *   - Oranžinis akcentas TIK ant aktyvios/hover būsenos (underline, ne background)
 *   - 3 šakų architektūra: Drabužiai / Dovanos / Pagal progą
 *   - Mega-panel dropdown (2 kolonos: kategorijos + featured)
 *
 * Išlaikyta iš senojo kodo:
 *   - Sticky pozicija
 *   - Paieškos toggle su Escape/Enter handling
 *   - Mobile drawer
 *   - Krepšelio count iš Zustand (useCartStore)
 *   - Hydration mismatch prevention per `mounted` state
 */

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useCartStore } from "@/lib/cartStore";

// =============================================================================
// NAVIGACIJOS STRUKTŪRA — mūsų 3 šakos
// =============================================================================

interface SubItem {
  name: string;
  slug: string;
  badge?: "NAUJIENA" | "TUOJAU";
}

interface NavColumn {
  title: string;
  items: SubItem[];
}

interface NavItem {
  name: string;
  href: string;
  columns?: NavColumn[];
  featured?: {
    title: string;
    description: string;
    href: string;
  };
}

const navigation: NavItem[] = [
  {
    name: "Drabužiai",
    href: "/kategorija/drabuziai",
    columns: [
      {
        title: "Pagal tipą",
        items: [
          { name: "Marškinėliai ir polo", slug: "marskineliai-ir-polo" },
          { name: "Džemperiai", slug: "dzemperiai" },
          { name: "Striukės ir paltai", slug: "striukes" },
          { name: "Kelnės", slug: "kelnes" },
          { name: "Sportinė kolekcija", slug: "sportine-kolekcija" },
          { name: "Darbo drabužiai", slug: "darbo-drabuziai" },
        ],
      },
    ],
    featured: {
      title: "Darbo drabužiai",
      description: "HORECA, pramonė, medicinos apranga",
      href: "/kategorija/darbo-drabuziai",
    },
  },
  {
    name: "Dovanos",
    href: "/kategorija/dovanos",
    columns: [
      {
        title: "Populiariausi",
        items: [
          { name: "Gertuvės ir puodeliai", slug: "gertuves" },
          { name: "Kuprinės ir krepšiai", slug: "kuprines" },
          { name: "Biuro prekės", slug: "biuro-prekes" },
          { name: "Eco prekės", slug: "eco-prekes" },
        ],
      },
    ],
    featured: {
      title: "Tuoj pasirodys",
      description: "Stamina dovanų kolekcija — netrukus",
      href: "/kategorija/dovanos",
    },
  },
  {
    name: "Pagal progą",
    href: "/proga",
    columns: [
      {
        title: "Verslo reikmėms",
        items: [
          { name: "Renginiams", slug: "renginiams" },
          { name: "Nauji darbuotojai", slug: "nauji-darbuotojai" },
          { name: "Klientų dovanoms", slug: "klientu-dovanos" },
          { name: "Sporto komandoms", slug: "sporto-komandos" },
        ],
      },
    ],
    featured: {
      title: "Kalėdoms 2026",
      description: "Ruoškite verslo dovanas iš anksto",
      href: "/proga/kaledoms",
    },
  },
];

// =============================================================================
// PAGRINDINIS KOMPONENTAS
// =============================================================================

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const menuTimeout = useRef<NodeJS.Timeout | null>(null);

  const items = useCartStore((state) => state.items);
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMenuEnter = (name: string) => {
    if (menuTimeout.current) clearTimeout(menuTimeout.current);
    setActiveMenu(name);
  };

  const handleMenuLeave = () => {
    menuTimeout.current = setTimeout(() => setActiveMenu(null), 150);
  };

  return (
    <header className="sticky top-0 z-50">
      {/* ====================================================================
          1. TOP BAR — tamsi info juosta viršuje
          ==================================================================== */}
      <div className="bg-ink text-paper text-xs">
        <div className="container-content h-8 flex items-center justify-between">
          <div className="flex items-center gap-4 font-display tracking-wider uppercase">
            <span className="hidden sm:inline">Nuo 10 vnt.</span>
            <span className="hidden md:inline text-muted">•</span>
            <span>Pristatymas 3–5 d.</span>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <a
              href="tel:+37060000000"
              className="hover:text-accent transition-colors"
            >
              +370 600 00000
            </a>
          </div>
        </div>
      </div>

      {/* ====================================================================
          2. MAIN BAR — pagrindinė navigacija (cream fonas)
          ==================================================================== */}
      <div className="bg-paper border-b border-line">
        <div className="container-content">
          <div className="flex items-center justify-between h-16 lg:h-[68px]">
            {/* Kairė: mobile burger + logo */}
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden p-2 -ml-2 text-ink hover:text-accent transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label={mobileOpen ? "Uždaryti meniu" : "Atidaryti meniu"}
                aria-expanded={mobileOpen}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  stroke="currentColor"
                  className="w-6 h-6"
                  aria-hidden="true"
                >
                  {mobileOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  )}
                </svg>
              </button>

              <Link
                href="/"
                className="flex items-center gap-2 group"
                aria-label="e.printukas.lt pradžia"
              >
                <span className="text-xl lg:text-2xl font-display font-semibold tracking-tight text-ink">
                  e.<span className="text-accent">printukas</span>
                </span>
              </Link>
            </div>

            {/* Centras: desktop navigacija */}
            <nav
              className="hidden lg:flex items-center gap-1"
              aria-label="Pagrindinė navigacija"
            >
              {navigation.map((item) => (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => item.columns && handleMenuEnter(item.name)}
                  onMouseLeave={handleMenuLeave}
                >
                  <Link
                    href={item.href}
                    className={`relative inline-flex items-center h-[68px] px-4 font-display text-[15px] font-medium tracking-wide transition-colors duration-150 ${
                      activeMenu === item.name ? "text-accent" : "text-ink hover:text-accent"
                    }`}
                  >
                    {item.name}
                    {item.columns && (
                      <svg
                        className={`ml-1 w-3.5 h-3.5 transition-transform duration-200 ${
                          activeMenu === item.name ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                    {activeMenu === item.name && (
                      <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-accent" />
                    )}
                  </Link>
                </div>
              ))}
            </nav>

            {/* Dešinė: paieška + krepšelis */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2.5 text-ink hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md"
                aria-label={searchOpen ? "Uždaryti paiešką" : "Atidaryti paiešką"}
                aria-expanded={searchOpen}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  stroke="currentColor"
                  className="w-5 h-5"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
              </button>

              <Link
                href="/krepselis"
                className="relative p-2.5 text-ink hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md"
                aria-label={`Krepšelis${cartCount > 0 ? `, ${cartCount} prekės` : ""}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  stroke="currentColor"
                  className="w-5 h-5"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
                {mounted && cartCount > 0 && (
                  <span className="absolute top-1 right-1 bg-accent text-white text-[10px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center font-display font-medium">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* ====================================================================
            MEGA PANEL — atsiranda po navigacija ant hover (tik desktop)
            ==================================================================== */}
        {activeMenu && (
          <div
            className="hidden lg:block absolute left-0 right-0 top-full bg-paper-soft border-b border-line shadow-md"
            onMouseEnter={() => activeMenu && handleMenuEnter(activeMenu)}
            onMouseLeave={handleMenuLeave}
          >
            <div className="container-content py-10">
              {navigation
                .filter((item) => item.name === activeMenu)
                .map((item) => (
                  <div key={item.name} className="grid grid-cols-12 gap-12">
                    <div className="col-span-8 grid grid-cols-2 gap-10">
                      {item.columns?.map((col) => (
                        <div key={col.title}>
                          <h3 className="text-xs font-display font-medium uppercase tracking-widest text-muted mb-4">
                            {col.title}
                          </h3>
                          <ul className="space-y-3">
                            {col.items.map((sub) => (
                              <li key={sub.slug}>
                                <Link
                                  href={`/kategorija/${sub.slug}`}
                                  className="group inline-flex items-center gap-2 text-[15px] text-ink hover:text-accent transition-colors"
                                  onClick={() => setActiveMenu(null)}
                                >
                                  <span className="group-hover:translate-x-0.5 transition-transform">
                                    {sub.name}
                                  </span>
                                  {sub.badge && (
                                    <span className="text-[9px] font-display font-medium uppercase tracking-wider px-1.5 py-0.5 bg-hi-vis text-ink rounded-sm">
                                      {sub.badge}
                                    </span>
                                  )}
                                </Link>
                              </li>
                            ))}
                            <li className="pt-2">
                              <Link
                                href={item.href}
                                className="inline-flex items-center gap-1.5 text-[13px] font-display font-medium uppercase tracking-wider text-accent hover:text-accent-dark transition-colors"
                                onClick={() => setActiveMenu(null)}
                              >
                                Visi
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                              </Link>
                            </li>
                          </ul>
                        </div>
                      ))}
                    </div>

                    {item.featured && (
                      <Link
                        href={item.featured.href}
                        onClick={() => setActiveMenu(null)}
                        className="col-span-4 bg-ink text-paper p-8 rounded-md hover:bg-graphite transition-colors group"
                      >
                        <div className="text-xs font-display font-medium uppercase tracking-widest text-muted mb-3">
                          Išbandyk
                        </div>
                        <h4 className="text-xl font-display font-semibold mb-2">
                          {item.featured.title}
                        </h4>
                        <p className="text-sm text-line mb-5">
                          {item.featured.description}
                        </p>
                        <div className="inline-flex items-center gap-1.5 text-sm font-display font-medium text-accent group-hover:gap-2.5 transition-all">
                          Peržiūrėti
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </div>
                      </Link>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ====================================================================
            PAIEŠKA — išskleidžiama juosta po main bar'u
            ==================================================================== */}
        {searchOpen && (
          <div className="border-t border-line bg-paper-soft py-6">
            <div className="container-content">
              <div className="max-w-2xl mx-auto">
                <label htmlFor="search-input" className="sr-only">
                  Ieškoti produktų
                </label>
                <input
                  id="search-input"
                  type="text"
                  placeholder="Ieškoti produktų, pvz. „marškinėliai“, „polo“, „darbo drabužiai“..."
                  autoFocus
                  className="w-full h-12 px-5 bg-paper border border-line-strong rounded-md text-ink placeholder-muted text-[15px] focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-colors"
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setSearchOpen(false);
                    if (e.key === "Enter") {
                      const value = (e.target as HTMLInputElement).value.trim();
                      if (value) {
                        setSearchOpen(false);
                        window.location.href = `/paieska?q=${encodeURIComponent(value)}`;
                      }
                    }
                  }}
                />
                <p className="mt-2 text-xs text-muted font-display tracking-wide">
                  Spausk Enter ieškoti • Esc uždaryti
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================================
            MOBILE DRAWER — pilno aukščio meniu mažesniems ekranams
            ==================================================================== */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-line max-h-[calc(100vh-96px)] overflow-auto bg-paper">
            <nav className="py-2" aria-label="Mobili navigacija">
              {navigation.map((item) => (
                <div key={item.name} className="border-b border-line last:border-0">
                  <Link
                    href={item.href}
                    className="block px-6 py-4 text-base font-display font-medium text-ink hover:bg-paper-soft hover:text-accent transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.name}
                  </Link>
                  {item.columns?.map((col) =>
                    col.items.map((sub) => (
                      <Link
                        key={sub.slug}
                        href={`/kategorija/${sub.slug}`}
                        className="block px-10 py-2.5 text-sm text-muted hover:text-ink transition-colors"
                        onClick={() => setMobileOpen(false)}
                      >
                        {sub.name}
                      </Link>
                    ))
                  )}
                </div>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
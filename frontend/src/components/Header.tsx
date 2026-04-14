"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useCartStore } from "@/lib/cartStore";

const menuCategories = [
  {
    name: "Marškinėliai",
    slug: "marskineliai",
    children: [
      { name: "Trumpomis rankovėmis", slug: "marskineliai" },
      { name: "Ilgomis rankovėmis", slug: "marskineliai" },
    ],
  },
  {
    name: "Polo marškinėliai",
    slug: "polo-marskineliai",
    children: [
      { name: "Trumpomis rankovėmis", slug: "polo-marskineliai" },
    ],
  },
  {
    name: "Džemperiai",
    slug: "dzemperiai",
    children: [
      { name: "Be gobtuvo", slug: "dzemperiai" },
      { name: "Su gobtuvu", slug: "dzemperiai" },
    ],
  },
  {
    name: "Striukės ir paltai",
    slug: "striukes",
    children: [
      { name: "Striukės", slug: "striukes" },
      { name: "Liemenės", slug: "striukes" },
    ],
  },
  {
    name: "Kelnės",
    slug: "kelnes",
  },
  {
    name: "Sportinė apranga",
    slug: "sportine-apranga",
  },
  {
    name: "Darbo drabužiai",
    slug: "darbo-drabuziai",
  },
  {
    name: "Aksesuarai",
    slug: "aksesuarai",
  },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuTimeout = useRef<NodeJS.Timeout | null>(null);
  const items = useCartStore((state) => state.items);
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMenuEnter = (slug: string) => {
    if (menuTimeout.current) clearTimeout(menuTimeout.current);
    setActiveMenu(slug);
  };

  const handleMenuLeave = () => {
    menuTimeout.current = setTimeout(() => setActiveMenu(null), 200);
  };

  return (
    <>
      <header className="bg-black text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <button
              className="lg:hidden p-2 text-white hover:text-gray-300 transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                )}
              </svg>
            </button>

            <Link href="/" className="flex items-center gap-2">
              <img src="/icon-192.png" alt="e" className="h-8 w-8" />
              <span className="text-xl font-black tracking-tight uppercase font-[family-name:var(--font-montserrat)]">
                printukas
              </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
              {menuCategories.map((cat) => (
                <div
                  key={cat.slug}
                  className="relative"
                  onMouseEnter={() => handleMenuEnter(cat.slug)}
                  onMouseLeave={handleMenuLeave}
                >
                  <Link
                    href={`/kategorija/${cat.slug}`}
                    className={`px-3 py-4 text-sm font-medium transition-colors ${
                      activeMenu === cat.slug ? "text-white" : "text-gray-300 hover:text-white"
                    }`}
                  >
                    {cat.name}
                  </Link>

                  {cat.children && activeMenu === cat.slug && (
                    <div
                      className="absolute top-full left-0 bg-white text-gray-900 shadow-xl rounded-b-lg py-4 px-6 min-w-50 z-50"
                      onMouseEnter={() => handleMenuEnter(cat.slug)}
                      onMouseLeave={handleMenuLeave}
                    >
                      <Link
                        href={`/kategorija/${cat.slug}`}
                        className="block text-sm font-bold text-gray-900 mb-3 hover:text-black"
                      >
                        Visi {cat.name.toLowerCase()}
                      </Link>
                      {cat.children.map((child, i) => (
                        <Link
                          key={i}
                          href={`/kategorija/${child.slug}`}
                          className="block text-sm text-gray-600 hover:text-black py-1.5 transition-colors"
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-gray-300 hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
              </button>

              <Link href="/krepselis" className="relative p-2 text-gray-300 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
                {mounted && cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-white text-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {searchOpen && (
          <div className="border-t border-gray-800 py-4 px-4">
            <div className="max-w-2xl mx-auto">
              <input
                type="text"
                placeholder="Ieškoti produktų..."
                autoFocus
                className="w-full bg-gray-900 border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-gray-500 placeholder-gray-500"
                onKeyDown={(e) => {
                  if (e.key === "Escape") setSearchOpen(false);
                }}
              />
            </div>
          </div>
        )}

        {menuOpen && (
          <div className="lg:hidden border-t border-gray-800 max-h-[70vh] overflow-auto">
            <nav className="py-2">
              {menuCategories.map((cat) => (
                <div key={cat.slug}>
                  <Link
                    href={`/kategorija/${cat.slug}`}
                    className="block px-6 py-3 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-900 transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    {cat.name}
                  </Link>
                  {cat.children && (
                    <div className="pl-4">
                      {cat.children.map((child, i) => (
                        <Link
                          key={i}
                          href={`/kategorija/${child.slug}`}
                          className="block px-6 py-2 text-xs text-gray-500 hover:text-gray-300 transition-colors"
                          onClick={() => setMenuOpen(false)}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useCartStore } from "@/lib/cartStore";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const totalItems = useCartStore((state) => state.totalItems);

  useEffect(() => setMounted(true), []);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🖨️</span>
            <span className="text-xl font-bold text-gray-900">
              e.<span className="text-emerald-600">printukas</span>.lt
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors">Pradžia</Link>
            <Link href="/katalogas" className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors">Katalogas</Link>
            <Link href="/apie" className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors">Apie mus</Link>
            <Link href="/kontaktai" className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors">Kontaktai</Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/krepselis" className="relative p-2 text-gray-600 hover:text-emerald-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
              </svg>
              {mounted && totalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {totalItems()}
                </span>
              )}
            </Link>

            <button className="md:hidden p-2 text-gray-600" onClick={() => setMenuOpen(!menuOpen)}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col gap-3">
              <Link href="/" className="text-sm font-medium text-gray-600 hover:text-emerald-600 py-2" onClick={() => setMenuOpen(false)}>Pradžia</Link>
              <Link href="/katalogas" className="text-sm font-medium text-gray-600 hover:text-emerald-600 py-2" onClick={() => setMenuOpen(false)}>Katalogas</Link>
              <Link href="/apie" className="text-sm font-medium text-gray-600 hover:text-emerald-600 py-2" onClick={() => setMenuOpen(false)}>Apie mus</Link>
              <Link href="/kontaktai" className="text-sm font-medium text-gray-600 hover:text-emerald-600 py-2" onClick={() => setMenuOpen(false)}>Kontaktai</Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}

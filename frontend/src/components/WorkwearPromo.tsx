"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

// Subkategorijos su Roly stiliaus nuotraukomis
const categories = [
  { name: "Signaliniai", slug: "signaliniai-drabuziai", image: "https://static.gorfactory.es/images/models/9310/views/large/p_9310_221_1_1.jpg", color: "#CCFF00" },
  { name: "HORECA", slug: "horeca", image: "https://static.gorfactory.es/images/models/5506/views/large/p_5506_01_1_1.jpg", color: "#FFFFFF" },
  { name: "Pramonė", slug: "pramone", image: "https://static.gorfactory.es/images/models/9317/views/large/p_9317_221_1_1.jpg", color: "#FF6600" },
  { name: "Medicina", slug: "medicina-ir-grozis", image: "https://static.gorfactory.es/images/models/6683/views/large/p_6683_01_1_1.jpg", color: "#C4DDF1" },
];

interface WorkwearPromoProps {
  products: any[];
}

export default function WorkwearPromo({ products }: WorkwearPromoProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  // Intersection Observer — animacija kai pasirodo ekrane
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Auto-rotate kategorijos
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveCategory((prev) => (prev + 1) % categories.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section ref={sectionRef} className="relative bg-gray-950 text-white overflow-hidden">
      {/* Amber akcentinės linijos */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

      {/* Animuotas fono gradientas */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0 transition-all duration-[2000ms] ease-in-out"
          style={{
            background: `radial-gradient(ellipse at 70% 50%, ${categories[activeCategory].color}22 0%, transparent 70%)`,
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-20 relative z-10">
        {/* Pavadinimas su animuotu atsiradimu */}
        <div className={`text-center mb-14 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <span className="text-amber-400 text-xs font-bold uppercase tracking-[0.3em] block mb-4">e.printukas</span>
          <h2 className="text-5xl font-black uppercase tracking-tight font-[family-name:var(--font-montserrat)]">
            <span className="text-amber-400">Darbo</span> drabužiai
          </h2>
          <p className="text-gray-500 mt-4 max-w-md mx-auto text-sm leading-relaxed">
            Saugūs ir patogūs drabužiai profesionalams. Kiekvienai darbo aplinkai — nuo statybų iki restoranų.
          </p>
        </div>

        {/* Kategorijų apskritimai — Roly stilius */}
        <div className={`flex justify-center gap-8 md:gap-12 mb-16 transition-all duration-1000 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          {categories.map((cat, i) => (
            <Link
              key={cat.slug}
              href={`/kategorija/${cat.slug}`}
              className="group flex flex-col items-center gap-3"
              onMouseEnter={() => setActiveCategory(i)}
            >
              <div
                className={`w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-2 transition-all duration-500 ${
                  activeCategory === i
                    ? "border-amber-400 scale-110 shadow-lg shadow-amber-400/20"
                    : "border-gray-700 group-hover:border-gray-500"
                }`}
              >
                <div className="w-full h-full bg-gray-800 flex items-center justify-center overflow-hidden">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-contain p-3 group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
              </div>
              <span
                className={`text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${
                  activeCategory === i ? "text-amber-400" : "text-gray-500 group-hover:text-gray-300"
                }`}
              >
                {cat.name}
              </span>
            </Link>
          ))}
        </div>

        {/* Produktų carousel — horizontalus su hover efektais */}
        {products.length > 0 && (
          <div className={`transition-all duration-1000 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="flex gap-5 overflow-x-auto pb-6 scrollbar-hide snap-x">
              {products.map((p: any) => (
                <Link
                  key={p.id}
                  href={`/produktas/${p.slug}`}
                  className="flex-shrink-0 w-52 group snap-start"
                >
                  <div className="relative bg-gray-900 border border-gray-800 group-hover:border-amber-400/30 transition-all duration-300 aspect-square flex items-center justify-center overflow-hidden">
                    {p.images?.[0]?.url && (
                      <img
                        src={p.images[0].url}
                        alt={p.name}
                        className="w-full h-full object-contain p-6 group-hover:scale-110 transition-transform duration-500"
                      />
                    )}
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-amber-400/0 group-hover:bg-amber-400/5 transition-colors duration-300" />
                  </div>
                  <div className="mt-3 px-1">
                    <span className="text-sm font-bold uppercase text-white group-hover:text-amber-400 transition-colors">{p.name}</span>
                    <span className="text-[10px] text-gray-600 ml-2">{p.sku}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-bold text-amber-400">{parseFloat(p.price).toFixed(2)} €</span>
                      {p.comparePrice && (
                        <span className="text-[10px] text-gray-600 line-through">{parseFloat(p.comparePrice).toFixed(2)} €</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* CTA mygtukas */}
        <div className={`text-center mt-10 transition-all duration-1000 delay-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <Link
            href="/kategorija/darbo-drabuziai"
            className="inline-block bg-amber-400 text-black font-bold px-10 py-4 text-sm uppercase tracking-wider hover:bg-amber-300 transition-colors"
          >
            Žiūrėti visus darbo drabužius →
          </Link>
        </div>
      </div>

      {/* Apatinė amber linija */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
    </section>
  );
}

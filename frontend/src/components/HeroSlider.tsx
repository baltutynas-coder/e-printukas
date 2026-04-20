"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

// Slide'ai su versliškais vaizdais
const slides = [
  {
    image: "https://static.gorfactory.es/images/home/Banner_hombre_2026_04.jpg",
    title: ["Kokybiški drabužiai", "jūsų verslui"],
    subtitle: "Marškinėliai, polo, džemperiai ir kita tekstilė. Platus spalvų ir dydžių pasirinkimas.",
    cta: { text: "Žiūrėti prekes →", href: "#produktai" },
  },
  {
    image: "https://static.gorfactory.es/images/home/slider_epiro_sparta.jpg",
    title: ["Nauja kolekcija", "2026"],
    subtitle: "Atraskite naujausius modelius ir spalvas. Profesionali apranga kiekvienai progai.",
    cta: { text: "Atrasti naujienas →", href: "/kategorija/marskineliai-ir-polo" },
  },
  {
    image: "https://static.gorfactory.es/images/home/Banner_abrigos_2026_04.jpg",
    title: ["Darbo drabužiai", "ir uniformos"],
    subtitle: "Signaliniai drabužiai, HORECA uniformos, medicinos aprangos. Saugūs ir patogūs darbo aplinkoje.",
    cta: { text: "Darbo drabužiai →", href: "/kategorija/darbo-drabuziai" },
    accent: true,
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const goToSlide = useCallback(
    (index: number) => {
      if (isTransitioning || index === current) return;
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrent(index);
        setTimeout(() => setIsTransitioning(false), 100);
      }, 500);
    },
    [current, isTransitioning]
  );

  const nextSlide = useCallback(() => {
    goToSlide((current + 1) % slides.length);
  }, [current, goToSlide]);

  // Auto-play
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide, isPaused]);

  const slide = slides[current];

  return (
    <section
      className="relative bg-black text-white overflow-hidden h-[85vh] min-h-[500px] max-h-[800px]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Nuotraukos — visos preloaded, tik viena matoma */}
      {slides.map((s, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-all duration-[1200ms] ease-in-out bg-cover bg-center"
          style={{
            backgroundImage: `url('${s.image}')`,
            opacity: i === current ? 1 : 0,
            transform: i === current ? "scale(1)" : "scale(1.08)",
          }}
        />
      ))}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/30 to-transparent z-10" />

      {/* Turinys */}
      <div className="relative z-20 max-w-7xl mx-auto px-6 h-full flex items-center">
        <div className="max-w-xl">
          {/* Pavadinimas su animacija */}
          <h1
            className={`transition-all duration-700 ease-out ${
              isTransitioning
                ? "opacity-0 translate-y-6"
                : "opacity-100 translate-y-0"
            }`}
          >
            {slide.title.map((line, i) => (
              <span
                key={`${current}-${i}`}
                className={`block text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] font-[family-name:var(--font-montserrat)] ${
                  slide.accent && i === 1 ? "text-amber-400" : ""
                }`}
              >
                {line}
              </span>
            ))}
          </h1>

          {/* Subtitras */}
          <p
            className={`text-base sm:text-lg text-gray-300 mt-5 max-w-md leading-relaxed transition-all duration-700 delay-200 ease-out ${
              isTransitioning
                ? "opacity-0 translate-y-4"
                : "opacity-100 translate-y-0"
            }`}
          >
            {slide.subtitle}
          </p>

          {/* CTA mygtukas */}
          <div
            className={`mt-8 transition-all duration-700 delay-300 ease-out ${
              isTransitioning
                ? "opacity-0 translate-y-4"
                : "opacity-100 translate-y-0"
            }`}
          >
            <Link
              href={slide.cta.href}
              className={`inline-block font-bold px-8 py-3.5 text-sm uppercase tracking-wider transition-colors ${
                slide.accent
                  ? "bg-amber-400 text-black hover:bg-amber-300"
                  : "bg-white text-black hover:bg-gray-200"
              }`}
            >
              {slide.cta.text}
            </Link>
          </div>
        </div>
      </div>

      {/* Dot navigacija — apačioje centre */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goToSlide(i)}
            className={`transition-all duration-300 rounded-full ${
              i === current
                ? "w-8 h-2 bg-white"
                : "w-2 h-2 bg-white/40 hover:bg-white/70"
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Progreso juosta */}
      <div className="absolute top-0 left-0 right-0 h-[2px] z-30 bg-white/10">
        <div
          key={`progress-${current}-${isPaused}`}
          className="h-full bg-white/50"
          style={{
            animation: isPaused ? "none" : "slideProgress 5s linear forwards",
            width: isPaused ? undefined : undefined,
          }}
        />
      </div>

      <style jsx>{`
        @keyframes slideProgress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </section>
  );
}

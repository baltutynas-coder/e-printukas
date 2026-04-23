"use client";

/**
 * HeroSlider — pagrindinis homepage'o hero blokas.
 *
 * Pavadinimas istorinis („slider") — iš tikrųjų tai NE karuzelis.
 * TRUEWERK DNR nenaudoja karuselių, nes:
 *   - Nukreipia dėmesį (vartotojas nespėja perskaityti)
 *   - Blogas accessibility (auto-play pažeidžia WCAG)
 *   - Mažas conversion rate (tik pirmoji skaidrė konvertuoja)
 *
 * Techninis sprendimas:
 *   - Naudojam paprastą <img>, ne next/image — konsistentu su ProductCard ir
 *     visa likusia svetaine. Vėliau, kai konfigūruosim next.config.ts
 *     images.remotePatterns su Cloudinary hostname'u, galim pakeisti visus
 *     <img> į next/image vienu žingsniu ir gauti lazy loading + WebP optimizaciją.
 */

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "./primitives/Button";

// =============================================================================
// ANIMACIJOS VARIANTS — Framer Motion
// =============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const stats = [
  { value: "245+", label: "Produktų" },
  { value: "25", label: "Spalvų" },
  { value: "XS–5XL", label: "Dydžių" },
  { value: "3–5 d.", label: "Pristatymas" },
];

export default function HeroSlider() {
  return (
    <section
      className="relative bg-paper overflow-hidden"
      aria-labelledby="hero-heading"
    >
      <div className="container-content">
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 py-16 lg:py-24"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Kairė kolona */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 mb-6"
            >
              <span className="w-8 h-px bg-accent" aria-hidden="true" />
              <span className="text-xs font-display font-medium uppercase tracking-widest text-accent">
                Reklaminė tekstilė verslui
              </span>
            </motion.div>

            <motion.h1
              id="hero-heading"
              variants={itemVariants}
              className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-display font-semibold tracking-tighter text-ink leading-[0.95]"
            >
              Apranga,
              <br />
              kuri <span className="text-accent">dirba.</span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="mt-6 lg:mt-8 text-lg lg:text-xl text-muted leading-relaxed max-w-xl"
            >
              Marškinėliai, polo, džemperiai ir darbo drabužiai su jūsų
              logotipu. Užsakymas nuo 10 vnt., pristatymas per 3–5 dienas.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="mt-8 lg:mt-10 flex flex-col sm:flex-row gap-3"
            >
              <Link href="/kategorija/drabuziai">
                <Button
                  intent="primary"
                  size="lg"
                  iconRight={
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  }
                >
                  Ieškoti produktų
                </Button>
              </Link>

              <Link href="/kontaktai">
                <Button intent="ghost" size="lg">
                  Gauti pasiūlymą
                </Button>
              </Link>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="mt-10 lg:mt-12 flex items-center gap-4 text-sm text-muted"
            >
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-success"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Pakopinė kainodara nuo 10 vnt.</span>
              </div>
            </motion.div>
          </div>

          {/* Dešinė kolona — paveikslėlis */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-5 relative"
          >
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              aria-hidden="true"
            >
              <span className="text-[280px] lg:text-[400px] font-display font-bold text-paper-soft leading-none select-none">
                e.
              </span>
            </div>

            <div className="relative aspect-[4/5] bg-paper-soft rounded-lg overflow-hidden shadow-md">
              <img
                src="https://res.cloudinary.com/dulaqsnqg/image/upload/v1776876093/eprintukas/products/roly_1119_58.jpg"
                alt="MANASLU džemperis — pagrindinis produktas"
                className="absolute inset-0 w-full h-full object-contain p-8"
                loading="eager"
              />

              <div className="absolute bottom-4 left-4 bg-ink text-paper px-3 py-1.5 rounded-sm">
                <span className="text-[10px] font-display font-medium uppercase tracking-widest">
                  Populiariausias
                </span>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs text-muted font-display uppercase tracking-wider mr-2">
                25 spalvos
              </span>
              {["#0E0E0E", "#F5F2EA", "#D0591E", "#378ADD", "#0F6E56"].map(
                (color, i) => (
                  <span
                    key={i}
                    className="w-5 h-5 rounded-full border border-line-strong"
                    style={{ backgroundColor: color }}
                    aria-hidden="true"
                  />
                )
              )}
              <span className="w-5 h-5 rounded-full border border-line-strong bg-paper flex items-center justify-center text-[10px] font-display text-muted">
                +20
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Stats juosta */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="bg-ink text-paper border-t border-graphite"
      >
        <div className="container-content">
          <dl className="grid grid-cols-2 lg:grid-cols-4 gap-y-6 gap-x-8 py-8">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col gap-1">
                <dt className="text-xs font-display font-medium uppercase tracking-widest text-muted">
                  {stat.label}
                </dt>
                <dd className="text-2xl lg:text-3xl font-display font-semibold text-paper">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </motion.div>
    </section>
  );
}

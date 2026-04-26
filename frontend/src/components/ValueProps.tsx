/**
 * ValueProps — „Kodėl e.printukas" sekcija.
 *
 * Sprint 8.1 — TRUEWERK gyvumas
 *
 * Paskirtis:
 *   Po to, kai vartotojas pamatė kategorijas, bet prieš matant produktus —
 *   parodyti 3 pagrindinius B2B argumentus, kodėl rinktis e.printukas.
 *
 * Struktūra:
 *   - Eyebrow: „Kodėl mes"
 *   - Headline: „Viskas, ko reikia jūsų verslo aprangai"
 *   - 3 korteles:
 *     1. Nuo 10 vnt — mažas minimumas (kitos svetainės reikalauja 50-100)
 *     2. 3-5 dienos — greitas pristatymas (vs 2-3 sav. tipiškai)
 *     3. Logo kokybės garantija — spaudos kokybė
 *
 * Dizainas:
 *   - Cream fonas (tęsiasi nuo CategoryBento)
 *   - Ink iconos apvaliuose akcentiniuose fonuose
 *   - Space Grotesk headline'ai
 *   - Horizontal scroll mobile, grid desktop
 */

export default function ValueProps() {
  const props = [
    {
      icon: (
        <svg
          className="w-7 h-7"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      ),
      label: "Mažas minimumas",
      title: "Nuo 10 vnt.",
      description:
        "Pradedame darbą nuo 10 vienetų. Tinka mažiems ir vidutiniams verslams, kurie nenori kaupti didelių atsargų.",
    },
    {
      icon: (
        <svg
          className="w-7 h-7"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
      label: "Greitas pristatymas",
      title: "3–5 dienos",
      description:
        "Aktyvūs sandėlio likučiai Lietuvoje. Užsakymas su logotipu paruošiamas ir pristatomas per 3–5 darbo dienas.",
    },
    {
      icon: (
        <svg
          className="w-7 h-7"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
      label: "Kokybės garantija",
      title: "Logo spauda",
      description:
        "Profesionali šilko sietspauda ir terminis spaudimas. Atsparus skalbimui, ilgaamžis rezultatas. Garantuojame spaudos kokybę.",
    },
  ];

  return (
    <section
      className="container-content py-14 lg:py-20"
      aria-labelledby="values-heading"
    >
      {/* Antraštė */}
      <div className="max-w-2xl mb-10 lg:mb-14">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-8 h-px bg-accent" aria-hidden="true" />
          <span className="text-xs font-display font-medium uppercase tracking-widest text-accent">
            Kodėl mes
          </span>
        </div>
        <h2
          id="values-heading"
          className="text-3xl lg:text-4xl font-display font-semibold tracking-tight"
          style={{ color: "var(--color-ink)" }}
        >
          Viskas, ko reikia jūsų verslo aprangai.
        </h2>
        <p className="mt-3 text-base text-muted leading-relaxed">
          Trys dalykai, dėl kurių Lietuvos įmonės renkasi mus kasdieniniams ir
          reklaminiams aprangos užsakymams.
        </p>
      </div>

      {/* Kortelės */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        {props.map((prop, i) => (
          <div
            key={prop.title}
            className="group relative bg-white border border-line rounded-md p-6 lg:p-8 hover:border-accent transition-colors duration-300"
          >
            {/* Numeriukas fonas */}
            <div
              className="absolute top-6 right-6 text-5xl font-display font-semibold select-none"
              style={{ color: "rgba(14, 14, 14, 0.06)" }}
              aria-hidden="true"
            >
              0{i + 1}
            </div>

            {/* Ikona */}
            <div
              className="inline-flex items-center justify-center w-12 h-12 rounded-md mb-6 group-hover:scale-110 transition-transform duration-300"
              style={{
                backgroundColor: "var(--color-accent)",
                color: "white",
              }}
            >
              {prop.icon}
            </div>

            {/* Eyebrow */}
            <p className="text-[10px] font-display font-medium uppercase tracking-widest text-muted mb-2">
              {prop.label}
            </p>

            {/* Title */}
            <h3
              className="text-2xl lg:text-3xl font-display font-semibold tracking-tight mb-3"
              style={{ color: "var(--color-ink)" }}
            >
              {prop.title}
            </h3>

            {/* Aprašymas */}
            <p className="text-sm text-muted leading-relaxed">
              {prop.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

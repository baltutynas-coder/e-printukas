/**
 * Footer — apatinė puslapio dalis.
 *
 * Dizaino sprendimai (TRUEWERK DNR):
 *   - Tamsus ink fonas su cream tekstu — techniškas, rimtas
 *   - Display šriftas antraštėms (Space Grotesk) — ALL CAPS, tracking-widest
 *   - 4 kolonos (desktop) su mūsų 3 šakų architektūra
 *   - Subtilus accent underline ant hover (ne bg change)
 *   - Papildomas „edukacinis“ stulpelis — blog / gidai (TRUEWERK principas)
 *
 * Pilnai accessible:
 *   - Semantinis <footer> su role / aria-label
 *   - Fokusabilūs link'ai su focus-visible ring
 *   - Kontaktų informacija microformato draugiška
 */

import Link from "next/link";

// =============================================================================
// FOOTER NAVIGACIJA — atskira nuo Header, bet nuoseklia
// =============================================================================

interface FooterLink {
  name: string;
  href: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

const footerColumns: FooterColumn[] = [
  {
    title: "Drabužiai",
    links: [
      { name: "Marškinėliai ir polo", href: "/kategorija/marskineliai-ir-polo" },
      { name: "Džemperiai", href: "/kategorija/dzemperiai" },
      { name: "Striukės ir paltai", href: "/kategorija/striukes" },
      { name: "Kelnės", href: "/kategorija/kelnes" },
      { name: "Sportinė kolekcija", href: "/kategorija/sportine-kolekcija" },
      { name: "Darbo drabužiai", href: "/kategorija/darbo-drabuziai" },
    ],
  },
  {
    title: "Pagal progą",
    links: [
      { name: "Renginiams", href: "/proga/renginiams" },
      { name: "Naujiems darbuotojams", href: "/proga/nauji-darbuotojai" },
      { name: "Klientų dovanoms", href: "/proga/klientu-dovanos" },
      { name: "Sporto komandoms", href: "/proga/sporto-komandos" },
      { name: "Kalėdoms", href: "/proga/kaledoms" },
    ],
  },
  {
    title: "Pagalba",
    links: [
      { name: "Apie mus", href: "/apie" },
      { name: "Kontaktai", href: "/kontaktai" },
      { name: "Pristatymas ir apmokėjimas", href: "/pristatymas" },
      { name: "Grąžinimo taisyklės", href: "/grazinimo-taisykles" },
      { name: "DUK", href: "/duk" },
      { name: "Privatumo politika", href: "/privatumo-politika" },
    ],
  },
];

// =============================================================================
// PAGRINDINIS KOMPONENTAS
// =============================================================================

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-ink text-paper mt-section" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        e.printukas.lt apatinė navigacija
      </h2>

      {/* ====================================================================
          VIRŠUTINĖ DALIS — pagrindinės kolonos
          ==================================================================== */}
      <div className="container-content py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12">
          {/* Pirma kolona — brand + misija + kontaktai (4/12) */}
          <div className="lg:col-span-4">
            <Link
              href="/"
              className="inline-block text-2xl font-display font-semibold tracking-tight"
              aria-label="e.printukas.lt pradžia"
            >
              e.<span className="text-accent">printukas</span>
            </Link>

            <p className="mt-4 text-sm text-line leading-relaxed max-w-xs">
              Reklaminė tekstilė Lietuvos verslui. Kokybė, greitas pristatymas
              ir skaidri kainodara — nuo 10 vnt.
            </p>

            {/* Kontaktai */}
            <dl className="mt-8 space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <dt className="sr-only">El. paštas</dt>
                <svg className="w-4 h-4 mt-0.5 text-muted flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                <dd>
                  <a
                    href="mailto:info@eprintukas.lt"
                    className="text-paper hover:text-accent transition-colors"
                  >
                    info@eprintukas.lt
                  </a>
                </dd>
              </div>

              <div className="flex items-start gap-3">
                <dt className="sr-only">Telefonas</dt>
                <svg className="w-4 h-4 mt-0.5 text-muted flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
                <dd>
                  <a
                    href="tel:+37060000000"
                    className="text-paper hover:text-accent transition-colors"
                  >
                    +370 600 00000
                  </a>
                </dd>
              </div>

              <div className="flex items-start gap-3">
                <dt className="sr-only">Adresas</dt>
                <svg className="w-4 h-4 mt-0.5 text-muted flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <dd className="text-line">Šiauliai, Lietuva</dd>
              </div>
            </dl>
          </div>

          {/* Vidurinės 3 kolonos — katalogas + proga + pagalba (7/12, po 2.33 kiekvienai) */}
          {footerColumns.map((col) => (
            <div key={col.title} className="lg:col-span-2">
              <h3 className="text-xs font-display font-medium uppercase tracking-widest text-muted mb-5">
                {col.title}
              </h3>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-line hover:text-accent transition-colors focus-visible:outline-none focus-visible:text-accent"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Paskutinė kolona — „Kodėl mes“ edukacinis (2/12) */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-display font-medium uppercase tracking-widest text-muted mb-5">
              Kodėl mes
            </h3>
            <ul className="space-y-3 text-sm text-line">
              <li className="flex items-start gap-2">
                <span className="text-accent mt-0.5" aria-hidden="true">▸</span>
                <span>Nuo 10 vnt.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent mt-0.5" aria-hidden="true">▸</span>
                <span>Pristatymas 3–5 d.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent mt-0.5" aria-hidden="true">▸</span>
                <span>Nemokama dizaino konsultacija</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent mt-0.5" aria-hidden="true">▸</span>
                <span>Pakopinė kainodara</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ====================================================================
          APATINĖ LINIJA — copyright + mokėjimo metodai + kalbos
          ==================================================================== */}
      <div className="border-t border-graphite">
        <div className="container-content py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted font-display tracking-wide">
            © {currentYear} e.printukas.lt · Visos teisės saugomos
          </p>

          <div className="flex items-center gap-5 text-xs text-muted font-display uppercase tracking-wider">
            <span>VISA</span>
            <span>Mastercard</span>
            <span>Apple Pay</span>
            <span>Google Pay</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
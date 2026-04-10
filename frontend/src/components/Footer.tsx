import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🖨️</span>
              <span className="text-lg font-bold text-white">
                e.<span className="text-emerald-400">printukas</span>.lt
              </span>
            </Link>
            <p className="text-sm">
              Kokybiški drabužiai ir tekstilė geriausiomis kainomis.
            </p>
          </div>

          {/* Nuorodos */}
          <div>
            <h3 className="text-white font-semibold mb-4">Nuorodos</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/katalogas" className="hover:text-emerald-400 transition-colors">Katalogas</Link></li>
              <li><Link href="/apie" className="hover:text-emerald-400 transition-colors">Apie mus</Link></li>
              <li><Link href="/kontaktai" className="hover:text-emerald-400 transition-colors">Kontaktai</Link></li>
              <li><Link href="/privatumo-politika" className="hover:text-emerald-400 transition-colors">Privatumo politika</Link></li>
            </ul>
          </div>

          {/* Kontaktai */}
          <div>
            <h3 className="text-white font-semibold mb-4">Kontaktai</h3>
            <ul className="space-y-2 text-sm">
              <li>info@e.printukas.lt</li>
              <li>+370 600 00000</li>
              <li>Šiauliai, Lietuva</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} e.printukas.lt — Visos teisės saugomos</p>
        </div>
      </div>
    </footer>
  );
}

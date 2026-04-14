import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      {/* Viršutinė dalis */}
      <div className="max-w-7xl mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Logo + aprašymas */}
          <div>
            <Link href="/" className="text-xl font-black uppercase tracking-tight">
              e.printukas
            </Link>
            <p className="text-sm text-gray-500 mt-4 leading-relaxed">
              Kokybiški drabužiai ir tekstilė jūsų verslui. Platus asortimentas, greitas pristatymas.
            </p>
          </div>

          {/* Katalogas */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Katalogas</h3>
            <ul className="space-y-2.5">
              <li><Link href="/kategorija/marskineliai" className="text-sm text-gray-500 hover:text-white transition-colors">Marškinėliai</Link></li>
              <li><Link href="/kategorija/polo-marskineliai" className="text-sm text-gray-500 hover:text-white transition-colors">Polo marškinėliai</Link></li>
              <li><Link href="/kategorija/dzemperiai" className="text-sm text-gray-500 hover:text-white transition-colors">Džemperiai</Link></li>
              <li><Link href="/kategorija/striukes" className="text-sm text-gray-500 hover:text-white transition-colors">Striukės ir paltai</Link></li>
              <li><Link href="/kategorija/sportine-apranga" className="text-sm text-gray-500 hover:text-white transition-colors">Sportinė apranga</Link></li>
            </ul>
          </div>

          {/* Informacija */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Informacija</h3>
            <ul className="space-y-2.5">
              <li><Link href="/apie" className="text-sm text-gray-500 hover:text-white transition-colors">Apie mus</Link></li>
              <li><Link href="/kontaktai" className="text-sm text-gray-500 hover:text-white transition-colors">Kontaktai</Link></li>
              <li><Link href="/pristatymas" className="text-sm text-gray-500 hover:text-white transition-colors">Pristatymas</Link></li>
              <li><Link href="/privatumo-politika" className="text-sm text-gray-500 hover:text-white transition-colors">Privatumo politika</Link></li>
              <li><Link href="/grazinimo-taisykles" className="text-sm text-gray-500 hover:text-white transition-colors">Grąžinimo taisyklės</Link></li>
            </ul>
          </div>

          {/* Kontaktai */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Kontaktai</h3>
            <ul className="space-y-2.5 text-sm text-gray-500">
              <li>info@eprintukas.lt</li>
              <li>+370 600 00000</li>
              <li>Šiauliai, Lietuva</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Apatinė linija */}
      <div className="border-t border-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} e.printukas.lt — Visos teisės saugomos
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <span>Visa</span>
            <span>Mastercard</span>
            <span>Apple Pay</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

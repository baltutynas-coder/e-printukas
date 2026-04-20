import ProductGrid from "@/components/ProductGrid";
import Link from "next/link";

async function getProducts() {
  try {
    const res = await fetch("http://localhost:4000/api/products?limit=50", { cache: "no-store" });
    if (!res.ok) throw new Error("Nepavyko gauti produktų");
    const data = await res.json();
    return data.products;
  } catch (error) {
    console.error("Klaida gaunant produktus:", error);
    return [];
  }
}

async function getCategories() {
  try {
    const res = await fetch("http://localhost:4000/api/categories", { cache: "no-store" });
    if (!res.ok) throw new Error("Nepavyko gauti kategorijų");
    const data = await res.json();
    return data.categories;
  } catch (error) {
    console.error("Klaida gaunant kategorijas:", error);
    return [];
  }
}

function shuffle(arr: any[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default async function Home() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  const allProducts = products.filter((p: any) => p.images && p.images.length > 0);
  const parentCategories = categories.filter((c: any) => !c.parentId);

  // 9 random produktų
  const randomProducts = shuffle(allProducts).slice(0, 9);

  // Darbo drabužių subkategorijos
  const darboCat = categories.find((c: any) => c.slug === "darbo-drabuziai");
  const darboChildren = darboCat?.children || [];

  return (
    <div>
      {/* ==========================================
          HERO — pilno pločio banner
         ========================================== */}
      <section className="relative bg-black text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10" />
        <div className="absolute inset-0 bg-[url('https://static.gorfactory.es/images/home/Banner_hombre_2026_04.jpg')] bg-cover bg-center" />
        <div className="relative z-20 max-w-7xl mx-auto px-6 py-28 sm:py-40">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight max-w-xl font-[family-name:var(--font-montserrat)]">
            Kokybiški drabužiai
            <span className="block">jūsų verslui</span>
          </h1>
          <p className="text-lg text-gray-300 mt-6 max-w-md">
            Marškinėliai, polo, džemperiai ir kita tekstilė. Platus spalvų ir dydžių pasirinkimas.
          </p>
          <Link
            href="#produktai"
            className="inline-block mt-8 bg-white text-black font-bold px-8 py-3.5 text-sm uppercase tracking-wider hover:bg-gray-200 transition-colors"
          >
            Žiūrėti prekes →
          </Link>
        </div>
      </section>

      {/* ==========================================
          4 KATEGORIJŲ KORTELĖS — tamsios, Roly stilius
         ========================================== */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link href="/kategorija/marskineliai-ir-polo" className="group relative overflow-hidden aspect-[3/4] bg-black">
            <div className="absolute inset-0 bg-[url('https://static.gorfactory.es/images/home/Banner_hombre_2026_04.jpg')] bg-cover bg-center opacity-50 group-hover:opacity-70 group-hover:scale-105 transition-all duration-500" />
            <div className="absolute inset-0 flex flex-col justify-end p-5 z-10">
              <span className="text-white text-lg font-black font-[family-name:var(--font-montserrat)] uppercase leading-tight">Marškinėliai ir polo</span>
              <span className="text-white/40 text-[10px] uppercase tracking-widest mt-2">Žiūrėti →</span>
            </div>
          </Link>
          <Link href="/kategorija/dzemperiai" className="group relative overflow-hidden aspect-[3/4] bg-black">
            <div className="absolute inset-0 bg-[url('https://static.gorfactory.es/images/home/Banner_mujer_2026_04.jpg')] bg-cover bg-center opacity-50 group-hover:opacity-70 group-hover:scale-105 transition-all duration-500" />
            <div className="absolute inset-0 flex flex-col justify-end p-5 z-10">
              <span className="text-white text-lg font-black font-[family-name:var(--font-montserrat)] uppercase leading-tight">Džemperiai ir striukės</span>
              <span className="text-white/40 text-[10px] uppercase tracking-widest mt-2">Žiūrėti →</span>
            </div>
          </Link>
          <Link href="/kategorija/sportine-kolekcija" className="group relative overflow-hidden aspect-[3/4] bg-black">
            <div className="absolute inset-0 bg-[url('https://static.gorfactory.es/images/home/Banner_ninos_2026_04.jpg')] bg-cover bg-center opacity-50 group-hover:opacity-70 group-hover:scale-105 transition-all duration-500" />
            <div className="absolute inset-0 flex flex-col justify-end p-5 z-10">
              <span className="text-white text-lg font-black font-[family-name:var(--font-montserrat)] uppercase leading-tight">Sportinė kolekcija</span>
              <span className="text-white/40 text-[10px] uppercase tracking-widest mt-2">Žiūrėti →</span>
            </div>
          </Link>
          <Link href="/kategorija/darbo-drabuziai" className="group relative overflow-hidden aspect-[3/4] bg-black">
            <div className="absolute inset-0 bg-[url('https://static.gorfactory.es/images/wrk/wrk_main.jpg')] bg-cover bg-center opacity-50 group-hover:opacity-70 group-hover:scale-105 transition-all duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-amber-900/60 via-transparent to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-5 z-10">
              <span className="text-amber-400 text-lg font-black font-[family-name:var(--font-montserrat)] uppercase leading-tight">Darbo drabužiai</span>
              <span className="text-amber-400/40 text-[10px] uppercase tracking-widest mt-2">Žiūrėti →</span>
            </div>
          </Link>
        </div>
      </section>

      {/* ==========================================
          KATEGORIJŲ MYGTUKAI
         ========================================== */}
      <section className="max-w-7xl mx-auto px-4 pb-8">
        <div className="flex flex-wrap gap-3 justify-center">
          {parentCategories.map((cat: any) => (
            <Link
              key={cat.id}
              href={`/kategorija/${cat.slug}`}
              className="text-sm px-5 py-2.5 border border-gray-200 text-gray-700 hover:border-black hover:text-black transition-colors uppercase tracking-wider font-medium"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </section>

      {/* ==========================================
          REKOMENDUOJAMOS PREKĖS — 9 random
         ========================================== */}
      <section id="produktai" className="max-w-7xl mx-auto px-4 pb-14">
        <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
          <h2 className="text-xl font-black uppercase tracking-tight font-[family-name:var(--font-montserrat)]">Rekomenduojamos prekės</h2>
          <span className="text-sm text-gray-400">{randomProducts.length} produktų</span>
        </div>
        <ProductGrid products={randomProducts} />
      </section>

      {/* ==========================================
          DARBO DRABUŽIAI — promo sekcija kaip Roly WRK
         ========================================== */}
      <section className="bg-gray-900 text-white py-14">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black uppercase tracking-tight font-[family-name:var(--font-montserrat)]">
              <span className="text-amber-400">Darbo</span> drabužiai
            </h2>
            <p className="text-gray-400 mt-3 max-w-lg mx-auto text-sm">
              Kokybiški ir saugūs darbo drabužiai jūsų verslui. Signaliniai drabužiai, HORECA uniformos, medicinos aprangos.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "Signaliniai drabužiai", slug: "signaliniai-drabuziai", desc: "Hi-Viz liemenės, marškinėliai su atšvaitais", icon: "🦺" },
              { name: "HORECA", slug: "horeca", desc: "Marškiniai, kelnės, prijuostės restoranams", icon: "👨‍🍳" },
              { name: "Pramonė", slug: "pramone", desc: "Softshell striukės, polo su atšvaitais", icon: "🏭" },
              { name: "Medicina ir grožis", slug: "medicina-ir-grozis", desc: "Marškinėliai ir marškiniai medicinos darbuotojams", icon: "🩺" },
            ].map((sub) => (
              <Link key={sub.slug} href={`/kategorija/${sub.slug}`}
                className="group bg-gray-800 hover:bg-gray-700 p-5 transition-colors text-center">
                <span className="text-3xl block mb-3">{sub.icon}</span>
                <span className="text-sm font-bold uppercase tracking-wider block">{sub.name}</span>
                <span className="text-xs text-gray-500 mt-2 block group-hover:text-gray-400 transition-colors">{sub.desc}</span>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/kategorija/darbo-drabuziai"
              className="inline-block bg-amber-400 text-black font-bold px-8 py-3 text-sm uppercase tracking-wider hover:bg-amber-300 transition-colors">
              Visos darbo prekės →
            </Link>
          </div>
        </div>
      </section>

      {/* ==========================================
          KO NEGALIMA PRALEISTI — 3 promo kortelės
         ========================================== */}
      <section className="bg-gray-50 py-14">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-xl font-black uppercase tracking-tight font-[family-name:var(--font-montserrat)] mb-8 text-center">Ko negalima praleisti</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 border border-gray-100 hover:border-gray-300 transition-colors">
              <h3 className="text-lg font-black uppercase mb-3 font-[family-name:var(--font-montserrat)]">Sportinė kolekcija</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">Techniniai marškinėliai, sportiniai komplektai, kelnės. Viskas ko reikia treniruotėms ir aktyviam gyvenimui.</p>
              <Link href="/kategorija/sportine-kolekcija" className="text-xs font-bold uppercase tracking-widest hover:underline">Žiūrėti →</Link>
            </div>
            <div className="bg-white p-6 border border-gray-100 hover:border-gray-300 transition-colors">
              <h3 className="text-lg font-black uppercase mb-3 font-[family-name:var(--font-montserrat)]">Striukės ir paltai</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">Drabužiai šalčiausiam metų laikui. Liemenės, softshell, striukės. Apsaugokite save nuo šalčio kokybiškomis tekstilėmis.</p>
              <Link href="/kategorija/striukes" className="text-xs font-bold uppercase tracking-widest hover:underline">Žiūrėti →</Link>
            </div>
            <div className="bg-white p-6 border border-gray-100 hover:border-gray-300 transition-colors">
              <h3 className="text-lg font-black uppercase mb-3 font-[family-name:var(--font-montserrat)]">Marškinėliai ir polo</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">Raskite savo mėgstamiausius trumpomis ar ilgomis rankovėmis polo ar marškinėlius, tinkamus dėvėti visus metus.</p>
              <Link href="/kategorija/marskineliai-ir-polo" className="text-xs font-bold uppercase tracking-widest hover:underline">Žiūrėti →</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

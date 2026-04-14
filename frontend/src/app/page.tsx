import ProductGrid from "@/components/ProductGrid";
import Link from "next/link";

async function getProducts() {
  try {
    const res = await fetch("http://localhost:4000/api/products", { cache: "no-store" });
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

export default async function Home() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);

  return (
    <div>
      {/* HERO — pilno pločio */}
      <section className="relative bg-black text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10" />
        <div className="absolute inset-0 bg-[url('https://static.gorfactory.es/images/home/Banner_hombre_2026_04.jpg')] bg-cover bg-center" />
        <div className="relative z-20 max-w-7xl mx-auto px-6 py-32 sm:py-44">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight max-w-xl">
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
            Žiūrėti katalogą →
          </Link>
        </div>
      </section>

      {/* Kategorijos — 3 stulpeliai su nuotraukomis */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/kategorija/marskineliai" className="group relative overflow-hidden aspect-[4/5]">
            <div className="absolute inset-0 bg-[url('https://static.gorfactory.es/images/home/Banner_hombre_2026_04.jpg')] bg-cover bg-center group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-6 left-6 z-10">
              <span className="text-white text-2xl font-bold">Vyrams</span>
            </div>
          </Link>
          <Link href="/kategorija/polo-marskineliai" className="group relative overflow-hidden aspect-[4/5]">
            <div className="absolute inset-0 bg-[url('https://static.gorfactory.es/images/home/Banner_mujer_2026_04.jpg')] bg-cover bg-center group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-6 left-6 z-10">
              <span className="text-white text-2xl font-bold">Moterims</span>
            </div>
          </Link>
          <Link href="/kategorija/sportine-apranga" className="group relative overflow-hidden aspect-[4/5]">
            <div className="absolute inset-0 bg-[url('https://static.gorfactory.es/images/home/Banner_ninos_2026_04.jpg')] bg-cover bg-center group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-6 left-6 z-10">
              <span className="text-white text-2xl font-bold">Vaikams</span>
            </div>
          </Link>
        </div>
      </section>

      {/* Kategorijų sąrašas */}
      <section className="max-w-7xl mx-auto px-4 pb-8">
        <div className="flex flex-wrap gap-3 justify-center">
          {categories.map((cat: any) => (
            <Link
              key={cat.id}
              href={`/kategorija/${cat.slug}`}
              className="text-sm px-5 py-2.5 border border-gray-200 text-gray-700 hover:border-black hover:text-black transition-colors uppercase tracking-wider font-medium"
            >
              {cat.name}
              {cat._count?.products > 0 && (
                <span className="ml-1.5 text-gray-400 text-xs">({cat._count.products})</span>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* Produktai */}
      <section id="produktai" className="max-w-7xl mx-auto px-4 pb-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black uppercase tracking-tight">Naujausi produktai</h2>
          <span className="text-sm text-gray-400">{products.length} produktų</span>
        </div>
        <ProductGrid products={products} />
      </section>
    </div>
  );
}

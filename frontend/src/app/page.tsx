import ProductGrid from "@/components/ProductGrid";
import Link from "next/link";

// Gauti produktus iš backend API
async function getProducts() {
  try {
    const res = await fetch("http://localhost:4000/api/products", {
      cache: "no-store", // Visada gauti šviežius duomenis
    });
    if (!res.ok) throw new Error("Nepavyko gauti produktų");
    const data = await res.json();
    return data.products;
  } catch (error) {
    console.error("Klaida gaunant produktus:", error);
    return [];
  }
}

// Gauti kategorijas
async function getCategories() {
  try {
    const res = await fetch("http://localhost:4000/api/categories", {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Nepavyko gauti kategorijų");
    const data = await res.json();
    return data.categories;
  } catch (error) {
    console.error("Klaida gaunant kategorijas:", error);
    return [];
  }
}

export default async function Home() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return (
    <div>
      {/* HERO sekcija */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-24 sm:py-32">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-6">
              Kokybiški drabužiai
              <span className="block text-emerald-400 mt-2">geriausiomis kainomis</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-10">
              Marškinėliai, polo, džemperiai ir kita tekstilė. 
              Platus spalvų ir dydžių pasirinkimas.
            </p>
            <Link
              href="#produktai"
              className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8 py-4 rounded-lg text-lg transition-colors"
            >
              Žiūrėti katalogą
            </Link>
          </div>
        </div>
      </section>

      {/* Kategorijos */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold mb-8 text-center">Kategorijos</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat: any) => (
            <Link
              key={cat.id}
              href={`/kategorija/${cat.slug}`}
              className="group bg-gray-50 hover:bg-emerald-50 border border-gray-200 hover:border-emerald-300 rounded-xl p-6 text-center transition-all"
            >
              <span className="text-sm font-medium text-gray-700 group-hover:text-emerald-700">
                {cat.name}
              </span>
              {cat._count?.products > 0 && (
                <span className="block text-xs text-gray-400 mt-1">
                  {cat._count.products} prekės
                </span>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* Produktai */}
      <section id="produktai" className="max-w-7xl mx-auto px-4 pb-20">
        <h2 className="text-2xl font-bold mb-8 text-center">Visi produktai</h2>
        <ProductGrid products={products} />
      </section>
    </div>
  );
}

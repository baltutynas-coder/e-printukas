import Link from "next/link";

export default async function OrderConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;

  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="text-6xl mb-6">✅</div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Užsakymas pateiktas!</h1>
      <p className="text-lg text-gray-600 mb-2">Ačiū už pirkimą!</p>

      {order && (
        <p className="text-gray-500 mb-8">
          Jūsų užsakymo numeris: <span className="font-mono font-bold text-gray-900">{order}</span>
        </p>
      )}

      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 mb-8 text-left">
        <h2 className="font-semibold text-emerald-800 mb-3">Kas toliau?</h2>
        <ul className="text-sm text-emerald-700 space-y-2">
          <li>📧 Užsakymo patvirtinimas išsiųstas el. paštu</li>
          <li>💳 Mokėjimo instrukcijas gausite atskirai</li>
          <li>📦 Užsakymas bus paruoštas per 1-2 darbo dienas po apmokėjimo</li>
          <li>🚚 Apie išsiuntimą informuosime el. paštu</li>
        </ul>
      </div>

      <Link
        href="/"
        className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
      >
        Grįžti į parduotuvę
      </Link>
    </div>
  );
}

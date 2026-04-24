/**
 * API Proxy Route — /api/backend/[...path]
 *
 * Problema:
 *   - Railway backend neturi CORS antraščių, leidžiančių request'us iš
 *     localhost:3000 (arba bet kurio kitos svetainės)
 *   - Server Components (homepage) fetch'ina iš serverio — CORS nereikia
 *   - Client Components (kategorijos puslapis su filtrais) fetch'ina iš
 *     browser'io — gauna 503 Service Unavailable
 *
 * Sprendimas:
 *   - Šis route'as yra proxy: browser'is fetch'ina /api/backend/products,
 *     Next.js serveryje šis handler'is persiunčia į Railway, grąžina rezultatą
 *   - Browser'ui atrodo, kad request'as ateina iš to paties origin'o — CORS OK
 *
 * Naudojimas:
 *   vietoj: fetch("https://e-printukas-production.up.railway.app/api/products")
 *   naudok:  fetch("/api/backend/products")
 */

import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = "https://e-printukas-production.up.railway.app/api";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  const pathString = path.join("/");

  // Perduodam query string (filtrus, page, limit, search ir t.t.)
  const { search } = new URL(request.url);

  const backendUrl = `${BACKEND_URL}/${pathString}${search}`;

  try {
    const res = await fetch(backendUrl, {
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Backend grąžino ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Proxy klaida:", error);
    return NextResponse.json(
      { error: "Nepavyko pasiekti backend'o" },
      { status: 502 }
    );
  }
}

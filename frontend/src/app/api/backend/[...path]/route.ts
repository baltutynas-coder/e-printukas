/**
 * API Proxy Route — /api/backend/[...path]
 *
 * Sprint 5.1 atnaujinimas — pridėti POST/PUT/DELETE palaikymą admin'ui.
 *
 * Sprint 3.2 buvo tik GET (public puslapiams). Dabar admin panelė reikalauja:
 *   - POST /auth/login — prisijungimas
 *   - POST /products — naujas produktas
 *   - PUT /products/:id — redaguoti produktą
 *   - PUT /orders/:id/status — keisti užsakymo statusą
 *   - DELETE /products/:id — ištrinti produktą
 *   - POST /upload — nuotraukos įkėlimas (multipart, speciali logika)
 *
 * Kaip veikia:
 *   - Visi method'ai pergabenami iš kliento į Railway
 *   - Authorization header'is persiunčiamas (JWT token)
 *   - Body persiunčiamas kaip yra (JSON arba FormData)
 */

import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = "https://e-printukas-production.up.railway.app/api";

/**
 * Bendras handler'is — visi metodai eina per šią funkciją.
 */
async function handleRequest(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  const pathString = path.join("/");

  const { search } = new URL(request.url);
  const backendUrl = `${BACKEND_URL}/${pathString}${search}`;

  // Headers — persiunčiam Authorization + Content-Type
  const headers: HeadersInit = {};
  const authHeader = request.headers.get("authorization");
  if (authHeader) headers["Authorization"] = authHeader;

  const contentType = request.headers.get("content-type");

  try {
    // Body valdymas — priklauso nuo Content-Type
    let body: BodyInit | undefined = undefined;

    if (request.method !== "GET" && request.method !== "HEAD") {
      if (contentType?.includes("multipart/form-data")) {
        // Nuotraukų įkėlimas — perduodam raw body (FormData boundary svarbu)
        body = await request.blob();
        // Content-Type perduodam kaip yra (su boundary)
        headers["Content-Type"] = contentType;
      } else if (contentType?.includes("application/json")) {
        body = await request.text();
        headers["Content-Type"] = "application/json";
      } else {
        // Fallback'as
        body = await request.text();
      }
    }

    const res = await fetch(backendUrl, {
      method: request.method,
      headers,
      body,
      cache: "no-store",
    });

    // Atsakymą persiunčiam atgal
    const responseContentType = res.headers.get("content-type");

    if (responseContentType?.includes("application/json")) {
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    } else {
      const text = await res.text();
      return new NextResponse(text, {
        status: res.status,
        headers: responseContentType
          ? { "Content-Type": responseContentType }
          : undefined,
      });
    }
  } catch (error: any) {
    console.error("Proxy klaida:", error);
    return NextResponse.json(
      { error: "Nepavyko pasiekti backend'o" },
      { status: 502 }
    );
  }
}

// Eksportuojam visus method'us — visi eina per tą patį handler'į
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, context);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, context);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, context);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, context);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, context);
}

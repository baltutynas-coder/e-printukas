/**
 * D1 — Stamina XLSX parser → JSON
 * ============================================
 * Skaito Stamina kainoraštį (Tarifa Confidencial 2026 + Tarifa PVP)
 * ir generuoja struktūrizuotą JSON failą e.printukas.lt importui.
 *
 * Naudojimas (PowerShell):
 *   cd backend
 *   npm install xlsx --save-dev
 *   node scripts\parse-stamina.js
 *
 * Įvestis:  backend\data\pricelist-stamina-int.xlsx
 * Išvestis: backend\data\stamina-products.json
 *
 * Filtrai:
 *   - Praleidžia TEXTILE skiltį (ROLY produktai jau DB)
 *   - Praleidžia eilutes be REF
 *   - CONSULT kainas pažymi flag'u (consultPrice=true), price=null
 *   - Apvalina kainas iki 2 dešimtainių
 *   - Padalina Article į 3 kalbas (ES / EN / FR)
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// ============================================================
// Failų keliai
// ============================================================
const XLSX_PATH = path.join(__dirname, '..', 'data', 'pricelist-stamina-int.xlsx');
const JSON_PATH = path.join(__dirname, '..', 'data', 'stamina-products.json');

// ============================================================
// Stamina kategorijų mapping į LT (e.printukas.lt struktūra)
// ============================================================
// Visos Stamina kategorijos pakliūna po root „Dovanos ir aksesuarai"
// (atitinka 4 zonų planą: DRABUŽIAI=Roly / DOVANOS=Stamina / OCCASION / INDUSTRY)
const ROOT_CATEGORY = {
  slug: 'dovanos-aksesuarai',
  name: 'Dovanos ir aksesuarai',
};

// Stamina EN pavadinimas → LT slug, LT pavadinimas
// Map išsaugo įdėjimo tvarką (sortOrder = pozicija)
const CATEGORY_MAP = new Map([
  ['TECHNOLOGY & ACCESSORIES',  { slug: 'technologijos',           name: 'Technologijos ir aksesuarai' }],
  ['WRITING & OFFICE',          { slug: 'rasymo-priemones-biuras', name: 'Rašymo priemonės ir biuras' }],
  ['BAGS & TRAVEL',             { slug: 'krepsiai-keliones',       name: 'Krepšiai ir kelionės' }],
  ['EATING & DRINKWARE',        { slug: 'maistas-gerimai',         name: 'Maistas ir gėrimai' }],
  ['HOME. GIFT & PREMIUM',      { slug: 'namams-dovanos',          name: 'Namams ir dovanos' }],
  ['TOOLS & PETS CARE',         { slug: 'irankiai-augintiniai',    name: 'Įrankiai ir augintiniams' }],
  ['WINTER & RAINY DAYS',       { slug: 'ziemai-lietui',           name: 'Žiemai ir lietingoms dienoms' }],
  ['PARTY & EVENTS',            { slug: 'sventes-renginiai',       name: 'Šventės ir renginiai' }],
  ['SUMMER',                    { slug: 'vasarai',                 name: 'Vasarai' }],
  ['LEISURE & SPORT',           { slug: 'laisvalaikis-sportas',    name: 'Laisvalaikis ir sportas' }],
  ['OUTDOOR',                   { slug: 'lauko-veikla',            name: 'Lauko veiklai' }],
  ['PERSONAL CARE',             { slug: 'asmens-prieziura',        name: 'Asmens priežiūra' }],
  ['CHRISTMAS',                 { slug: 'kaledos',                 name: 'Kalėdoms' }],
  ['SUBLIMATION',               { slug: 'sublimacija',             name: 'Sublimacijai' }],
  ['SPECIAL PACKAGING',         { slug: 'pakavimas',               name: 'Pakavimas' }],
]);

// Skiltys, kurias visiškai praleidžiame (TEXTILE = ROLY produktai)
const SKIP_CATEGORIES = new Set(['TEXTILE']);

// ============================================================
// Pagalbinės funkcijos
// ============================================================

/**
 * Konvertuoja tekstą į URL-friendly slug'ą.
 * Pvz.: "Aukštos kokybės" → "aukstos-kokybes"
 */
function slugify(text) {
  if (!text) return '';
  return String(text)
    .normalize('NFKD')                  // Atskiria diakritikus nuo raidžių
    .replace(/[\u0300-\u036f]/g, '')    // Pašalina diakritikus (ą→a, š→s, ė→e)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')        // Visi nealfanumeriai → brūkšneliai
    .replace(/^-+|-+$/g, '');           // Pašalina brūkšnelius pradžioje/gale
}

/**
 * Padalina trijų kalbų aprašymą.
 * Formatas: "Altavoz Inalámbrico / Wireless speaker / Haut-parleur sans fil"
 */
function splitArticle(article) {
  if (!article) return { es: '', en: '', fr: '', raw: '' };
  const parts = String(article).split('/').map((p) => p.trim());
  return {
    es: parts[0] || '',
    en: parts[1] || '',
    fr: parts[2] || '',
    raw: String(article).trim(),
  };
}

/**
 * Apvalina kainą iki 2 dešimtainių.
 * Grąžina null, jei reikšmė yra null/CONSULT/netinkamas tipas.
 */
function roundPrice(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') {
    if (value.toUpperCase().includes('CONSULT')) return null;
    const parsed = parseFloat(value.replace(',', '.'));
    if (Number.isNaN(parsed)) return null;
    return Math.round(parsed * 100) / 100;
  }
  if (typeof value === 'number') {
    return Math.round(value * 100) / 100;
  }
  return null;
}

/**
 * Patikrina, ar kainos lange yra CONSULT žyma.
 */
function isConsult(value) {
  return typeof value === 'string' && value.toUpperCase().includes('CONSULT');
}

// ============================================================
// Pagrindinis parser'is
// ============================================================
function parseWorkbook() {
  console.log(`📂 Skaitomas: ${path.basename(XLSX_PATH)}`);

  if (!fs.existsSync(XLSX_PATH)) {
    console.error(`❌ Failas nerastas: ${XLSX_PATH}`);
    console.error(`   Įdėk pricelist-stamina-int.xlsx į backend\\data\\ katalogą`);
    process.exit(1);
  }

  // Skaitomas tik reikalingas range (A:J), kad pagreitinti — XLSX faile yra
  // 16381 stulpelių, bet naudojama tik 10 (A–J).
  const wb = XLSX.readFile(XLSX_PATH, {
    sheets: ['Tarifa Confidencial 2026', 'Tarifa PVP'],
    raw: true,
  });

  // Konvertuoti lapus į array of arrays (kiekviena eilutė = masyvas)
  const confRows = XLSX.utils.sheet_to_json(wb.Sheets['Tarifa Confidencial 2026'], {
    header: 1,
    defval: null,
    range: 'A1:J1681',
  });
  const pvpRows = XLSX.utils.sheet_to_json(wb.Sheets['Tarifa PVP'], {
    header: 1,
    defval: null,
    range: 'A1:J1681',
  });

  console.log(`   Confidential lapas: ${confRows.length} eilučių`);
  console.log(`   PVP lapas:          ${pvpRows.length} eilučių`);

  const products = [];
  const skipped = { noRef: 0, skipCategory: 0, consult: 0, noPrice: 0 };
  let currentCategoryEn = null;
  let currentCategorySkip = false;

  // Eilutės numeracija: confRows[0] = Excel eilutė 1, confRows[4] = Excel eilutė 5
  // Produktų duomenys prasideda nuo Excel eilutės 5 (indexas 4)
  for (let idx = 4; idx < confRows.length; idx++) {
    const excelRow = idx + 1; // 1-based eilutės numeris
    const row = confRows[idx] || [];
    const [pag, link, ref, name, article, pLt500, pGte500, pGte2000, pGte5000, tech] = row;

    // --- Kategorijos antraštė (tik A stulpelyje yra tekstas, kiti tušti) ---
    const otherCells = [link, ref, name, article, pLt500];
    if (pag && otherCells.every((c) => !c)) {
      currentCategoryEn = String(pag).trim();
      currentCategorySkip = SKIP_CATEGORIES.has(currentCategoryEn);
      continue;
    }

    // --- Praleistinos eilutės ---
    if (!ref) {
      if (name || article) skipped.noRef++;
      continue;
    }

    if (currentCategorySkip) {
      skipped.skipCategory++;
      continue;
    }

    if (!CATEGORY_MAP.has(currentCategoryEn)) {
      // Nežinoma kategorija (pvz., note eilutės pabaigoje)
      continue;
    }

    // --- PVP kainos iš antro lapo (ta pati eilutė) ---
    const pvpRow = pvpRows[idx] || [];
    const pvpLt500 = roundPrice(pvpRow[5]);
    const pvpGte500 = roundPrice(pvpRow[6]);
    const pvpGte2000 = roundPrice(pvpRow[7]);
    const pvpGte5000 = roundPrice(pvpRow[8]);

    // --- Confidential kainos ---
    const costLt500 = roundPrice(pLt500);
    const costGte500 = roundPrice(pGte500);
    const costGte2000 = roundPrice(pGte2000);
    const costGte5000 = roundPrice(pGte5000);

    const consultFlag = isConsult(pLt500);
    if (consultFlag) {
      skipped.consult++;
    } else if (costLt500 === null) {
      skipped.noPrice++;
      continue;
    }

    // --- Aprašymai (ES/EN/FR) ---
    const descriptions = splitArticle(article);

    // --- Kategorijos LT info ---
    const catInfo = CATEGORY_MAP.get(currentCategoryEn);

    // --- Slug + SKU ---
    const refStr = String(ref).trim();
    const nameStr = name ? String(name).trim() : `stamina-${refStr}`;
    const productSlug = `stamina-${slugify(nameStr)}-${refStr}`;
    const sku = `STM-${refStr}`;

    products.push({
      sku,
      supplier: 'STAMINA',
      ref: refStr,
      name: nameStr,
      slug: productSlug,
      isNew: link === 'NEW',
      catalogPage: typeof pag === 'number' ? pag : null,
      category: {
        slug: catInfo.slug,
        name: catInfo.name,
        parentSlug: ROOT_CATEGORY.slug,
        originalEn: currentCategoryEn,
      },
      descriptions,
      printingTechniques: tech ? String(tech).trim() : '',
      consultPrice: consultFlag,
      prices: {
        cost: { lt500: costLt500, gte500: costGte500, gte2000: costGte2000, gte5000: costGte5000 },
        retail: { lt500: pvpLt500, gte500: pvpGte500, gte2000: pvpGte2000, gte5000: pvpGte5000 },
      },
      // Pagrindinė kaina e-parduotuvei (PVP <500 vnt. — populiariausias lygis)
      price: pvpLt500,
      sourceRow: excelRow,
    });
  }

  return { products, skipped };
}

// ============================================================
// JSON sudėjimas
// ============================================================
function buildOutput(products, skipped) {
  // Suskaičiuoti produktus pagal kategoriją
  const categoryCounts = {};
  for (const p of products) {
    const slug = p.category.slug;
    categoryCounts[slug] = (categoryCounts[slug] || 0) + 1;
  }

  // Root kategorija + visos child kategorijos
  const categoriesOut = [
    {
      slug: ROOT_CATEGORY.slug,
      name: ROOT_CATEGORY.name,
      parentSlug: null,
      sortOrder: 0,
      productCount: products.length,
    },
  ];

  let order = 1;
  for (const [enName, info] of CATEGORY_MAP) {
    categoriesOut.push({
      slug: info.slug,
      name: info.name,
      parentSlug: ROOT_CATEGORY.slug,
      sortOrder: order++,
      productCount: categoryCounts[info.slug] || 0,
      originalEn: enName,
    });
  }

  return {
    meta: {
      source: 'Stamina pricelist-stamina-int.xlsx',
      generatedBy: 'parse-stamina.js (Sprint D1)',
      generatedAt: new Date().toISOString(),
      totalProducts: products.length,
      consultProducts: products.filter((p) => p.consultPrice).length,
      newProducts: products.filter((p) => p.isNew).length,
      skipped,
      pvpToCostRatio: 2.0,
      priceTiers: ['<500', '≥500', '≥2000', '≥5000'],
    },
    categories: categoriesOut,
    products,
  };
}

// ============================================================
// Run
// ============================================================
function main() {
  const startTime = Date.now();
  const { products, skipped } = parseWorkbook();
  const output = buildOutput(products, skipped);

  // Užtikrinti, kad data/ katalogas egzistuoja
  fs.mkdirSync(path.dirname(JSON_PATH), { recursive: true });
  fs.writeFileSync(JSON_PATH, JSON.stringify(output, null, 2), 'utf-8');

  const seconds = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log(`✅ Sugeneruotas: ${path.basename(JSON_PATH)} (per ${seconds}s)`);
  console.log(`   • Produktų:     ${output.meta.totalProducts}`);
  console.log(`   • Naujų (NEW):  ${output.meta.newProducts}`);
  console.log(`   • CONSULT kaina: ${output.meta.consultProducts}`);
  console.log(`   • Praleista:    ${JSON.stringify(skipped)}`);
  console.log('');
  console.log('📊 Kategorijų pasiskirstymas:');
  for (const cat of output.categories.slice(1)) {
    const padded = cat.name.padEnd(36);
    console.log(`   ${String(cat.productCount).padStart(4)}  ${padded}  /${cat.slug}`);
  }
}

main();

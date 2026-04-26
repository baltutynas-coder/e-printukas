/**
 * D2 — Stamina importeris (JSON → DB) v2: HIBRIDINIS M2M
 * ========================================================
 * Skaito stamina-products.json ir įkelia produktus + kategorijas į DB per Prisma.
 *
 * NAUJIENA v2: Cross-list (M2M) palaikymas
 *   - Stamina kainoraštyje 179 produktų pasirodo keliose kategorijose
 *     (TREMENS = Technologijos + Namams; MOSUL = Technologijos + Lauko veikla...)
 *   - Pirma kategorija JSON'e → Product.categoryId (pagrindinė, SEO canonical)
 *   - Papildomos kategorijos → ProductCategory M2M lentelė
 *   - Frontend kategorijos puslapis rodys produktą abiejose vietose
 *
 * Naudojimas:
 *   node scripts/import-stamina.js --preview     ← parodo, ką darys (saugus)
 *   node scripts/import-stamina.js --apply       ← realiai įrašo į DB
 *   node scripts/import-stamina.js --apply --limit 10   ← tik 10 produktų testui
 *
 * Veiksmai:
 *   1. Sukuria root kategoriją „Dovanos ir aksesuarai" (jei dar nėra)
 *   2. Sukuria 15 child kategorijų (jei dar nėra) su parentId
 *   3. Sugrupuoja JSON produktus pagal SKU (cross-list deduplikacija)
 *   4. Per kiekvieną unikalų SKU:
 *      - Upsert produktas su PIRMĄJA kategorija kaip categoryId
 *      - Perrašo ProductCategory M2M įrašus (delete + createMany)
 *
 * Saugumas:
 *   - Niekada netrina ROLY produktų (manipuliuoja tik STM-* SKU)
 *   - --preview rėžimas neraso nieko į DB
 *   - Idempotent — galima paleisti kelis kartus
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// ============================================================
// Argumentų parser'is
// ============================================================
const args = process.argv.slice(2);
const PREVIEW = args.includes('--preview');
const APPLY = args.includes('--apply');
const limitArg = args.find((a) => a.startsWith('--limit'));
const LIMIT = limitArg
  ? parseInt(limitArg.split('=')[1] || args[args.indexOf(limitArg) + 1], 10)
  : null;

if (!PREVIEW && !APPLY) {
  console.error('❌ Reikia nurodyti --preview arba --apply');
  console.error('   node scripts/import-stamina.js --preview');
  process.exit(1);
}

// ============================================================
// JSON skaitymas
// ============================================================
const JSON_PATH = path.join(__dirname, '..', 'data', 'stamina-products.json');

if (!fs.existsSync(JSON_PATH)) {
  console.error(`❌ JSON failas nerastas: ${JSON_PATH}`);
  console.error('   Įsitikink, kad stamina-products.json yra backend/data/ kataloge');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(JSON_PATH, 'utf-8'));

// ============================================================
// Cross-list deduplikacija: sugrupuoti pagal SKU
// ============================================================
// Kiekvienas unikalus SKU → { produkto info + visi kategorijų slug'ai }
function groupBySku(products) {
  const grouped = new Map();
  for (const p of products) {
    if (!grouped.has(p.sku)) {
      // Pirmas pasirodymas — kopija + naujas kategorijų sąrašas
      grouped.set(p.sku, { ...p, allCategorySlugs: [p.category.slug] });
    } else {
      // Cross-list — pridėti unikalų kategorijos slug'ą
      const existing = grouped.get(p.sku);
      if (!existing.allCategorySlugs.includes(p.category.slug)) {
        existing.allCategorySlugs.push(p.category.slug);
      }
    }
  }
  return [...grouped.values()];
}

const uniqueProducts = groupBySku(data.products);
const crossListCount = uniqueProducts.filter((p) => p.allCategorySlugs.length > 1).length;
const totalCrossListLinks = uniqueProducts.reduce(
  (sum, p) => sum + (p.allCategorySlugs.length - 1),
  0,
);

console.log(`📂 Įkrautas JSON: ${data.products.length} įrašų → ${uniqueProducts.length} unikalių SKU`);
console.log(`   Cross-list produktų: ${crossListCount} (${totalCrossListLinks} papildomi M2M įrašai)`);
console.log(`   Režimas: ${PREVIEW ? 'PREVIEW (DB nesikeis)' : 'APPLY (rašys į DB)'}`);
if (LIMIT) console.log(`   Limit: ${LIMIT} unikalių produktų`);
console.log('');

// ============================================================
// Kategorijų importas
// ============================================================
async function importCategories() {
  console.log('📁 Kategorijos:');
  const slugToId = {};

  // 1. Root kategorija
  const rootCat = data.categories.find((c) => c.parentSlug === null);

  if (PREVIEW) {
    console.log(`   [PREVIEW] Root: ${rootCat.name} (${rootCat.slug})`);
  } else {
    const existingRoot = await prisma.category.findUnique({ where: { slug: rootCat.slug } });
    if (existingRoot) {
      slugToId[rootCat.slug] = existingRoot.id;
      console.log(`   ✓ Egzistuoja: ${rootCat.name}`);
    } else {
      const created = await prisma.category.create({
        data: { name: rootCat.name, slug: rootCat.slug, sortOrder: rootCat.sortOrder },
      });
      slugToId[rootCat.slug] = created.id;
      console.log(`   + Sukurta: ${rootCat.name}`);
    }
  }

  // 2. Child kategorijos
  let createdChildren = 0;
  let existingChildren = 0;
  for (const cat of data.categories.filter((c) => c.parentSlug !== null)) {
    if (PREVIEW) {
      console.log(`   [PREVIEW] ${cat.name} (${cat.productCount} prod.)`);
      continue;
    }

    const existing = await prisma.category.findUnique({ where: { slug: cat.slug } });
    if (existing) {
      slugToId[cat.slug] = existing.id;
      existingChildren++;
    } else {
      const created = await prisma.category.create({
        data: {
          name: cat.name,
          slug: cat.slug,
          sortOrder: cat.sortOrder,
          parentId: slugToId[cat.parentSlug],
        },
      });
      slugToId[cat.slug] = created.id;
      createdChildren++;
    }
  }

  if (!PREVIEW) {
    console.log(`   Iš viso: +${createdChildren} naujos, ${existingChildren} jau buvusios`);
  }
  console.log('');
  return slugToId;
}

// ============================================================
// Produktų importas su M2M cross-list
// ============================================================
async function importProducts(slugToId) {
  console.log('📦 Produktai (su M2M cross-list):');
  const products = LIMIT ? uniqueProducts.slice(0, LIMIT) : uniqueProducts;

  let created = 0;
  let updated = 0;
  let crossListAdded = 0;
  let skipped = 0;
  let errors = 0;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];

    // Aprašymas — naudojam EN versiją (vėliau išversi į LT)
    const description = p.descriptions.en || p.descriptions.es || '';

    // Kaina — CONSULT atveju 0 + published=false (Decimal NOT NULL)
    const price = p.consultPrice ? 0 : (p.price ?? 0);
    const published = !p.consultPrice && p.price !== null;

    // Progresas
    if ((i + 1) % 100 === 0) {
      console.log(`   ... ${i + 1}/${products.length} apdorota`);
    }

    if (PREVIEW) {
      created++;
      crossListAdded += p.allCategorySlugs.length - 1;
      continue;
    }

    try {
      // Pirmoji kategorija = pagrindinė (canonical SEO, breadcrumbs)
      const primaryCategoryId = slugToId[p.allCategorySlugs[0]];
      if (!primaryCategoryId) {
        console.warn(`   ⚠ Nerasta kategorija ${p.allCategorySlugs[0]} produktui ${p.sku}`);
        skipped++;
        continue;
      }

      // UPSERT produktas
      const existing = await prisma.product.findUnique({ where: { sku: p.sku } });
      let product;

      if (existing) {
        product = await prisma.product.update({
          where: { sku: p.sku },
          data: {
            name: p.name,
            description,
            price,
            published,
            categoryId: primaryCategoryId, // Visada pirma kategorija
          },
        });
        updated++;
      } else {
        product = await prisma.product.create({
          data: {
            sku: p.sku,
            name: p.name,
            slug: p.slug,
            description,
            price,
            published,
            supplier: 'STAMINA',
            gender: 'UNISEX',
            categoryId: primaryCategoryId,
          },
        });
        created++;
      }

      // M2M papildomos kategorijos: delete + createMany (idempotent)
      // Visada ištrinam senus M2M įrašus, kad re-importas neduplikuotų
      await prisma.productCategory.deleteMany({
        where: { productId: product.id },
      });

      const additionalSlugs = p.allCategorySlugs.slice(1);
      if (additionalSlugs.length > 0) {
        const additionalCatIds = additionalSlugs.map((s) => slugToId[s]).filter(Boolean);

        if (additionalCatIds.length > 0) {
          await prisma.productCategory.createMany({
            data: additionalCatIds.map((catId) => ({
              productId: product.id,
              categoryId: catId,
            })),
          });
          crossListAdded += additionalCatIds.length;
        }
      }
    } catch (err) {
      console.error(`   ❌ Klaida su ${p.sku} (${p.name}): ${err.message}`);
      errors++;
    }
  }

  console.log('');
  console.log('📊 Rezultatas:');
  console.log(`   + Sukurta:           ${created}`);
  console.log(`   ↻ Atnaujinta:        ${updated}`);
  console.log(`   ⤵ Cross-list įrašai: ${crossListAdded}`);
  console.log(`   ⏭ Praleista:         ${skipped}`);
  console.log(`   ❌ Klaidos:          ${errors}`);
}

// ============================================================
// Run
// ============================================================
async function main() {
  const startTime = Date.now();
  try {
    const slugToId = await importCategories();
    await importProducts(slugToId);
    const seconds = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log('');
    console.log(`✅ Baigta per ${seconds}s`);
    if (PREVIEW) {
      console.log('   Tai buvo PREVIEW. Realiai importuoti — paleisk su --apply');
    }
  } catch (err) {
    console.error('❌ Kritinė klaida:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

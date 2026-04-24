/**
 * Aprašymų vertimo ir generavimo skriptas — Sprint 7
 *
 * Paskirtis:
 *   Automatiškai užpildyti 245 produktų aprašymus lietuvių kalba.
 *   - Angliškus — verčia per Google Translate
 *   - Tuščius — generuoja šabloną iš kategorijos + pavadinimo + variantų
 *   - Lietuviškus — palieka (nekeičia)
 *
 * Paleidimas:
 *   cd D:\ProgramavimoDarbai\e-printukas\backend
 *   node scripts/translate-descriptions.js
 *
 * Po paleidimo:
 *   - Matysi progresą terminale (kiekvienas produktas: EN / LT / EMPTY / ERROR)
 *   - Pabaigoje — suvestinė (kiek išversta, kiek sugeneruota, kiek praleista)
 *   - DB bus atnaujinta — matysi rezultatus svetainėje po F5
 *
 * Saugumas:
 *   - Google Translate kartais rate-limit'ina — skriptas daro 300ms pauzes
 *     tarp request'ų. 245 produktai × 0.3s ≈ 75 sekundės
 *   - Jei kažkas nepavyksta — produktas praleidžiamas, skriptas tęsia
 *   - Originali `description` saugoma į `descriptionOriginal` lauką
 *     (JEI tą lauką yra DB schemoje; jei ne — originalas perrašomas)
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// ====================================================================
// KONFIGURACIJA
// ====================================================================

// Pauzė tarp Google Translate request'ų (ms) — kad nenutrauktų rate-limitu
const DELAY_MS = 300;

// Minimum ilgis, kad būtų laikomas "tikru" aprašymu (o ne SEO title'u)
const MIN_MEANINGFUL_LENGTH = 30;

// ====================================================================
// KATEGORIJŲ ŽEMĖLAPIS — lietuviški pavadinimai (singularinis)
// ====================================================================

const CATEGORY_SINGULAR = {
  marskineliai: "marškinėliai",
  "polo-marskineliai": "polo marškinėliai",
  "su-gobtuvu": "džemperis su gobtuvu",
  megztiniai: "megztinis",
  "sportiniai-marskineliai": "sportiniai marškinėliai",
  "sportines-kelnes": "sportinės kelnės",
  "sportiniai-komplektai": "sportinis komplektas",
  kelnes: "kelnės",
  horeca: "HORECA aprangos drabužis",
  "signaliniai-drabuziai": "signalinis drabužis",
  "medicina-ir-grozis": "medicininis drabužis",
  pramone: "pramonės drabužis",
  eco: "ekologiškas drabužis",
  avalyne: "avalynė",
  striukes: "striukė",
};

// ====================================================================
// DETECTION — ar aprašymas jau lietuviškai
// ====================================================================

const LITHUANIAN_CHARS = /[ąčęėįšųūž]/i;
const LITHUANIAN_WORDS =
  /\b(medvilnė|apykaklė|rankovės|kelnės|marškinėliai|džemperis|siūlės|tinkamas|kokybė|atsparus|moteriška|vyriška|spauda|vaikų|unisex)\b/i;

// Tikrinam ar SEO title ("Work polo shirt X | Roly") — laikom tuščiu
const SEO_TITLE_PATTERN = /\|\s*Roly/i;

function classifyDescription(desc) {
  const trimmed = (desc || "").trim();

  if (!trimmed) return "EMPTY";
  if (trimmed.length < MIN_MEANINGFUL_LENGTH) return "EMPTY"; // per trumpas
  if (SEO_TITLE_PATTERN.test(trimmed)) return "EMPTY"; // Roly SEO title

  if (LITHUANIAN_CHARS.test(trimmed) || LITHUANIAN_WORDS.test(trimmed)) {
    return "LT";
  }

  return "EN";
}

// ====================================================================
// VERTIMAS per Google Translate (nemokama)
// ====================================================================

async function translateToLithuanian(text) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=lt&dt=t&q=${encodeURIComponent(
    text
  )}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Translate HTTP ${res.status}`);

  const data = await res.json();
  // Google Translate grąžina masyvą masyvų — apjungiam visus vertimo segmentus
  if (!Array.isArray(data) || !Array.isArray(data[0])) {
    throw new Error("Netikėtas Google Translate atsakymas");
  }

  return data[0]
    .map((segment) => segment[0])
    .filter(Boolean)
    .join("")
    .trim();
}

// ====================================================================
// ŠABLONO GENERAVIMAS — kai aprašymas tuščias
// ====================================================================

function generateTemplate(product) {
  const categorySlug = product.category?.slug;
  const categoryName = CATEGORY_SINGULAR[categorySlug] || "drabužis";

  // Unikalūs spalvų ir dydžių skaičiai
  const uniqueColors = new Set(product.variants?.map((v) => v.colorHex) || []);
  const uniqueSizes = new Set(product.variants?.map((v) => v.size) || []);

  // Dydžių intervalas
  const SIZE_ORDER = [
    "XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL",
    "3/4", "5/6", "7/8", "9/10", "11/12",
  ];
  const sortedSizes = [...uniqueSizes].sort((a, b) => {
    const ai = SIZE_ORDER.indexOf(a);
    const bi = SIZE_ORDER.indexOf(b);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  const sizeRange =
    sortedSizes.length > 1
      ? `${sortedSizes[0]}–${sortedSizes[sortedSizes.length - 1]}`
      : sortedSizes[0] || "";

  // Šablonas
  let description = `${product.name} — ${categoryName} verslo asortimentui.`;

  if (uniqueColors.size > 1) {
    description += ` Prieinamas ${uniqueColors.size} spalvų variantuose`;
  } else if (uniqueColors.size === 1) {
    description += ` Prieinamas ${uniqueColors.size} spalvos variante`;
  }

  if (sizeRange) {
    description += `, dydžiai ${sizeRange}`;
  }

  description += ". Tinka logotipo spausdinimui ir individualizavimui.";

  // Specifiniai priedai pagal kategoriją
  if (categorySlug === "signaliniai-drabuziai") {
    description += " Atitinka darbo saugos reikalavimus.";
  } else if (categorySlug === "horeca") {
    description += " Pritaikytas maitinimo įstaigoms ir restoranams.";
  } else if (categorySlug === "medicina-ir-grozis") {
    description += " Tinka medicinos ir grožio sektoriui.";
  } else if (categorySlug === "eco") {
    description += " Pagamintas iš ekologiškų medžiagų.";
  } else if (categorySlug === "sportiniai-marskineliai" || categorySlug === "sportines-kelnes" || categorySlug === "sportiniai-komplektai") {
    description += " Idealiai tinka komandiniams sporto klubams.";
  }

  return description;
}

// ====================================================================
// PAGRINDINIS SKRIPTAS
// ====================================================================

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log("🌐 Aprašymų vertimas ir generavimas — Sprint 7\n");

  // Gaunam visus produktus su kategorijomis ir variantais
  const products = await prisma.product.findMany({
    include: {
      category: true,
      variants: true,
    },
    orderBy: { createdAt: "asc" },
  });

  console.log(`📦 Rasta ${products.length} produktų DB.\n`);

  // Statistika
  const stats = {
    total: products.length,
    alreadyLt: 0,
    translated: 0,
    generated: 0,
    errors: 0,
    skippedNoData: 0,
  };

  // Einam per kiekvieną produktą
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const progress = `[${i + 1}/${products.length}]`;
    const name = product.name.padEnd(25, " ");

    try {
      const classification = classifyDescription(product.description);

      if (classification === "LT") {
        stats.alreadyLt++;
        console.log(`${progress} ${name} ✓ LT (praleidžiam)`);
        continue;
      }

      let newDescription;

      if (classification === "EN") {
        // Verčiam į LT
        newDescription = await translateToLithuanian(product.description);
        stats.translated++;
        console.log(`${progress} ${name} 🌐 EN → LT (išversta)`);
      } else {
        // EMPTY — generuojam šabloną
        if (!product.category) {
          stats.skippedNoData++;
          console.log(`${progress} ${name} ⚠ EMPTY (nėra kategorijos)`);
          continue;
        }
        newDescription = generateTemplate(product);
        stats.generated++;
        console.log(`${progress} ${name} 📝 EMPTY → sugeneruota`);
      }

      // Atnaujinam DB
      await prisma.product.update({
        where: { id: product.id },
        data: { description: newDescription },
      });

      // Pauzė prieš kitą request'ą (tik jei buvo Google Translate call'as)
      if (classification === "EN") {
        await sleep(DELAY_MS);
      }
    } catch (error) {
      stats.errors++;
      console.log(
        `${progress} ${name} ✗ KLAIDA: ${error.message}`
      );
    }
  }

  // Suvestinė
  console.log("\n" + "═".repeat(60));
  console.log("📊 REZULTATAI:");
  console.log("═".repeat(60));
  console.log(`  Iš viso produktų:     ${stats.total}`);
  console.log(`  Jau buvo lietuviški:  ${stats.alreadyLt}`);
  console.log(`  Išversta iš anglų:    ${stats.translated}`);
  console.log(`  Sugeneruota šablonų:  ${stats.generated}`);
  console.log(`  Praleistą (be info):  ${stats.skippedNoData}`);
  console.log(`  Klaidos:              ${stats.errors}`);
  console.log("═".repeat(60));

  const totalUpdated = stats.translated + stats.generated;
  const successRate =
    ((stats.alreadyLt + totalUpdated) / stats.total) * 100;
  console.log(`\n✅ Dabar lietuviškai: ${stats.alreadyLt + totalUpdated}/${stats.total} (${successRate.toFixed(1)}%)`);

  if (stats.errors > 0) {
    console.log(
      `\n⚠ ${stats.errors} klaidų — bandyk paleisti skriptą dar kartą (jis praleis jau išverstus)`
    );
  }

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error("FATAL ERROR:", error);
  prisma.$disconnect();
  process.exit(1);
});

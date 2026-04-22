// ============================================
// PILNAS ROLY KATALOGO IMPORTAS v2 (PATAISYTAS)
// ============================================
// Paleidimas: node import-roly.js
// ============================================

const { PrismaClient } = require('@prisma/client');
const { v2: cloudinary } = require('cloudinary');
const https = require('https');
const fs = require('fs');
require('dotenv').config();

const prisma = new PrismaClient();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ============================================
// KONFIGŪRACIJA
// ============================================
const PROGRESS_FILE = './import-progress.json';
const CATALOG_URL = 'https://static.gorfactory.es/s4hana-b2b/Catalog/catalog_info.json';
const ROLY_CDN = 'https://static.gorfactory.es';
const MAX_COLORS_PER_PRODUCT = 12;
const DELAY_MS = 500;

// ============================================
// SPALVŲ PAVADINIMAI LIETUVIŠKAI
// ============================================
const COLOR_NAMES = {
  '#FFFFFF': 'Balta', '#000000': 'Juoda', '#001D43': 'Tamsiai mėlyna',
  '#DC002E': 'Raudona', '#0060A9': 'Karališka mėlyna', '#C4DDF1': 'Dangaus mėlyna',
  '#00A0D1': 'Turkio', '#008F4F': 'Žalia', '#004237': 'Butelio žalia',
  '#51A025': 'Šviesiai žalia', '#F08927': 'Oranžinė', '#FFE400': 'Geltona',
  '#C4C4C4': 'Pilka', '#484E41': 'Tamsiai pilka', '#DC006B': 'Rožinė',
  '#F8CCD5': 'Šviesiai rožinė', '#750D68': 'Violetinė', '#8C1713': 'Granato',
  '#573D2A': 'Ruda', '#4C6781': 'Plieno mėlyna', '#F5F0E1': 'Kreminė',
  '#722F37': 'Vyno raudona', '#938E4F': 'Chaki', '#F0786B': 'Koralinė',
  '#51534A': 'Antracitas', '#CCFF00': 'Fluorescencinė geltona',
  '#FF6600': 'Fluorescencinė oranžinė', '#E8E2BE': 'Smėlio',
  '#008FC1': 'Mėlyna', '#BBA18B': 'Šviesiai ruda', '#6BBD00': 'Salotinė',
  '#EB1C60': 'Fuksija', '#E03188': 'Ryški rožinė', '#74A0CA': 'Pastelė mėlyna',
  '#0F4E67': 'Petrolė', '#C83629': 'Tamsiai raudona', '#007558': 'Smaragdinė',
  '#46242B': 'Tamsiai ruda', '#4E5055': 'Grafito', '#F3EFE0': 'Dramblio kaulo',
  '#E0AA0F': 'Auksinė', '#FC3E86': 'Ryški fuksija', '#7DB955': 'Pastelinė žalia',
  '#BCBD00': 'Citrininė', '#5F6062': 'Švino', '#4F84C4': 'Džinso mėlyna',
  '#E2B051': 'Garstyčių', '#5B173E': 'Tamsiai violetinė', '#1A8872': 'Mėtinė',
  '#383B71': 'Indigo', '#FFF598': 'Šviesiai geltona', '#CDCD00': 'Alyvuogių',
  '#F4BFD1': 'Pastelinė rožinė', '#7B6700': 'Auksinė ruda', '#979200': 'Samanų',
};

const CATEGORY_MAP = {
  CA: 'marskineliai', PO: 'polo-marskineliai', SU: 'su-gobtuvu',
  AB: 'striukes-sub', PA: 'kelnes', HV: 'signaliniai-drabuziai',
  CQ: 'horeca', CM: 'horeca', ZL: 'pramone',
};

const ADULT_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'];
const PRICES = { CA: 2.40, PO: 6.50, SU: 9.90, AB: 15.90, PA: 8.90, HV: 3.90, CQ: 7.50, CM: 7.90, ZL: 22.90 };

function toSlug(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
function getColorName(hex) {
  if (!hex) return 'Nežinoma';
  const h = hex.toUpperCase().startsWith('#') ? hex.toUpperCase() : '#' + hex.toUpperCase();
  return COLOR_NAMES[h] || `Spalva ${h.replace('#','')}`;
}
function detectGender(n) {
  const u = n.toUpperCase();
  if (u.includes('WOMAN') || u.includes('WOMEN')) return 'WOMEN';
  if (u.includes('KID') || u.includes('CHILD')) return 'CHILDREN';
  return 'UNISEX';
}

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      timeout: 20000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/json,*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'identity',
      }
    }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) return fetchUrl(res.headers.location).then(resolve).catch(reject);
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

function uploadToCloudinary(buffer, publicId) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'eprintukas/products', public_id: publicId, overwrite: true,
        transformation: [{ width: 800, height: 800, crop: 'limit' }, { quality: 'auto' }, { format: 'webp' }] },
      (err, res) => { if (err) reject(err); else resolve(res); }
    );
    stream.end(buffer);
  });
}

function loadProgress() {
  try { return fs.existsSync(PROGRESS_FILE) ? JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8')) : { imported: [], failed: [] }; }
  catch (e) { return { imported: [], failed: [] }; }
}
function saveProgress(p) { fs.writeFileSync(PROGRESS_FILE, JSON.stringify(p, null, 2)); }

// ============================================
// PRODUKTO DETALIŲ GAVIMAS IŠ ROLY PUSLAPIO
// ============================================
async function fetchProductDetails(sku) {
  try {
    const url = `https://www.roly.eu/model_${sku}`;
    const buffer = await fetchUrl(url);
    const html = buffer.toString('utf8');

    let name = null, description = null, grams = null;

    // Ieškome pavadinimo iš <title> tag
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) {
      const titleText = titleMatch[1].trim();
      // "T-shirt for men Beagle | Roly" → extract last word before |
      const beforePipe = titleText.split('|')[0].trim();
      const words = beforePipe.split(/\s+/);
      if (words.length > 0) {
        // Paskutinis žodis arba paskutiniai 2 žodžiai yra pavadinimas
        name = words.slice(-1)[0].toUpperCase();
        // Jei yra "Woman" ar pan., imame 2 paskutinius
        if (words.length >= 2 && (words[words.length - 1].toLowerCase() === 'woman' || words[words.length - 1].toLowerCase() === 'women')) {
          name = words.slice(-2).join(' ').toUpperCase();
        }
      }
    }

    // Aprašymas — ieškome description meta arba __NUXT__ description
    const descPatterns = [
      /"description"\s*:\s*"((?:[^"\\]|\\.)*)"/g,
      /content="((?:Tubular|Short|Long|Fitted|Work|Chef|High|Multi|Soft|Full|Half|Over|Stretch|Regular|Slim|Fleece|Padded|Lightweight|Waterproof|Windproof|Breathable|Technical|Organic|Recycled|Classic|Zip|Hood|Round|Crew|V-neck)[^"]{10,300})"/gi,
    ];

    for (const pattern of descPatterns) {
      const matches = html.matchAll(pattern);
      for (const m of matches) {
        const d = m[1].replace(/\\n/g, ' ').replace(/\\"/g, '"').trim();
        if (d.length > 15 && d.length < 500 && /[a-z]/.test(d)) {
          description = d;
          break;
        }
      }
      if (description) break;
    }

    // Svoris
    const gramsMatch = html.match(/"grams"\s*:\s*(\d+)/);
    if (gramsMatch) grams = parseInt(gramsMatch[1]);

    return { name: name || sku, description, grams, sizes: ADULT_SIZES };
  } catch (e) {
    return { name: sku, description: null, grams: null, sizes: ADULT_SIZES };
  }
}

// ============================================
// IMPORTUOTI VIENĄ PRODUKTĄ
// ============================================
async function importProduct(sku, catalog, categoryMap, progress) {
  if (progress.imported.includes(sku)) return 'skipped';

  const prefix = sku.replace(/\d+/g, '');
  const modelNum = sku.replace(/^[A-Z]+/, '');
  const modelData = catalog.MODELS[sku];
  if (!modelData) return 'not_found';

  const viewColors = modelData.VIEWS ? Object.keys(modelData.VIEWS) : [];
  if (viewColors.length === 0) { progress.imported.push(sku); saveProgress(progress); return 'no_colors'; }

  // Patikrinti ar jau egzistuoja DB
  const existing = await prisma.product.findFirst({ where: { sku } });
  if (existing) { progress.imported.push(sku); saveProgress(progress); return 'exists'; }

  // Gauti detales
  console.log(`   📝 Gaunami duomenys...`);
  const details = await fetchProductDetails(sku);
  await new Promise(r => setTimeout(r, DELAY_MS));

  const productName = details.name.charAt(0).toUpperCase() + details.name.slice(1).toLowerCase();
  const slug = toSlug(details.name) + '-' + modelNum;
  const gender = detectGender(details.name);
  const category = categoryMap[CATEGORY_MAP[prefix]] || null;
  const price = PRICES[prefix] || 5.00;
  const limitedColors = viewColors.slice(0, MAX_COLORS_PER_PRODUCT);

  // Variantai
  const variants = [];
  for (const cc of limitedColors) {
    const hex = (catalog.COLORS[cc]?.HEXCODE || '#CCCCCC').toUpperCase();
    for (const size of details.sizes) {
      variants.push({ color: getColorName(hex), colorHex: hex, size, stock: Math.floor(Math.random() * 200) + 20 });
    }
  }

  try {
    const product = await prisma.product.create({
      data: { name: productName, slug, sku, price, published: true, gender,
        description: details.description ? `${details.description}${details.grams ? ` ${details.grams} g/m².` : ''}` : null,
        categoryId: category?.id || null, variants: { create: variants } },
    });

    console.log(`   ✅ ${productName} — ${limitedColors.length} spalvų, ${variants.length} var.`);

    // Nuotraukos
    let imgCount = 0;
    for (const cc of limitedColors) {
      const urls = [
        `${ROLY_CDN}/images/models/${modelNum}/views/large/p_${modelNum}_${cc}_1_1.jpg`,
        `${ROLY_CDN}/images/models/${modelNum}/model/large/${modelNum}_${cc}_2_1.jpg`,
        `${ROLY_CDN}/images/models/${modelNum}/model/large/${modelNum}_${cc}_1_1.jpg`,
      ];
      for (const imgUrl of urls) {
        try {
          const buf = await fetchUrl(imgUrl);
          if (buf.length > 3000) {
            const res = await uploadToCloudinary(buf, `roly_${modelNum}_${cc}`);
            await prisma.productImage.create({
              data: { url: res.secure_url, alt: getColorName(catalog.COLORS[cc]?.HEXCODE), sortOrder: imgCount, productId: product.id }
            });
            imgCount++; break;
          }
        } catch (e) {}
      }
      await new Promise(r => setTimeout(r, 200));
    }
    console.log(`   📸 ${imgCount} nuotr.`);
    progress.imported.push(sku);
    saveProgress(progress);
    return 'imported';
  } catch (e) {
    console.log(`   ❌ ${e.message.substring(0, 60)}`);
    progress.imported.push(sku); // Praleidžiame ir tęsiame
    saveProgress(progress);
    return 'error';
  }
}

// ============================================
// MAIN
// ============================================
async function main() {
  console.log('═'.repeat(60));
  console.log('🚀 ROLY KATALOGO IMPORTAS v2');
  console.log('═'.repeat(60));

  // Ištrinti seną progresą jei buvo failed
  if (fs.existsSync(PROGRESS_FILE)) {
    const old = loadProgress();
    if (old.imported.length === 0 && old.failed.length > 0) {
      fs.unlinkSync(PROGRESS_FILE);
      console.log('🗑️  Senas progresas ištrintas (visi buvo failed)\n');
    }
  }

  const progress = loadProgress();
  console.log(`📋 Progresas: ${progress.imported.length} importuota\n`);

  console.log('📥 Siunčiamas katalogas...');
  const buffer = await fetchUrl(CATALOG_URL);
  const catalog = JSON.parse(buffer.toString());
  console.log(`   ✅ ${(buffer.length / 1024 / 1024).toFixed(1)} MB\n`);

  const rolyPrefixes = ['CA', 'PO', 'SU', 'HV', 'CM', 'PA', 'AB', 'ZL', 'CQ'];
  const rolyModels = Object.keys(catalog.MODELS).filter(c => rolyPrefixes.includes(c.replace(/\d+/g, '')));
  const remaining = rolyModels.filter(sku => !progress.imported.includes(sku));

  console.log(`📦 Roly: ${rolyModels.length} | Liko: ${remaining.length}`);

  const categories = await prisma.category.findMany();
  const categoryMap = {};
  categories.forEach(c => { categoryMap[c.slug] = c; });

  console.log('═'.repeat(60));

  let ok = 0, fail = 0;
  const start = Date.now();

  for (let i = 0; i < remaining.length; i++) {
    const sku = remaining[i];
    const prefix = sku.replace(/\d+/g, '');
    const elapsed = ((Date.now() - start) / 60000).toFixed(1);
    const eta = i > 0 ? ((Date.now() - start) / i * (remaining.length - i) / 60000).toFixed(0) : '?';
    console.log(`\n[${i + 1}/${remaining.length}] ${sku} (${prefix}) | ${elapsed} min | ETA ~${eta} min`);

    const result = await importProduct(sku, catalog, categoryMap, progress);
    if (result === 'imported') ok++;
    else if (result === 'error') fail++;
  }

  console.log('\n' + '═'.repeat(60));
  console.log(`✅ BAIGTA! Nauji: ${ok} | Klaidos: ${fail}`);
  console.log(`📋 Viso DB: ${await prisma.product.count()} produktų`);
  console.log(`⏱️  ${((Date.now() - start) / 60000).toFixed(1)} min`);
  console.log('═'.repeat(60));
}

main().catch(e => { console.error('❌', e); process.exit(1); }).finally(() => prisma.$disconnect());

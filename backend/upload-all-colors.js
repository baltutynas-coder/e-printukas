// ============================================
// Spalvų nuotraukų įkėlimas — VISOS spalvos visiems produktams
// ============================================
// Parsiunčia kiekvienos spalvos nuotrauką iš Roly CDN → Cloudinary
// Alt laukas = spalvos pavadinimas (kad ProductDetails galėtų keisti nuotrauką)
// ============================================

const { v2: cloudinary } = require('cloudinary');
const { PrismaClient } = require('@prisma/client');
const https = require('https');
require('dotenv').config({ path: '../.env' });

const prisma = new PrismaClient();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Spalvų hex → Roly kodų žemėlapis
const HEX_TO_CODE = {
  '#FFFFFF': '01', '#000000': '02', '#FFE400': '03', '#0060A9': '05',
  '#F08927': '31', '#001D43': '55', '#004237': '56', '#8C1713': '57',
  '#C4C4C4': '58', '#DC002E': '60', '#573D2A': '67', '#750D68': '71',
  '#008F4F': '83', '#C4DDF1': '86', '#00A0D1': '12', '#51A025': '264',
  '#DC006B': '78', '#F8CCD5': '48', '#484E41': '46', '#4C6781': '231',
  '#F5F0E1': '132', '#722F37': '116', '#6B7532': '15', '#F0786B': '169',
  '#3D3D3D': '231',
};

// Hex → Spalvos pavadinimas
const HEX_TO_NAME = {
  '#FFFFFF': 'Balta', '#000000': 'Juoda', '#FFE400': 'Geltona', '#0060A9': 'Karališka mėlyna',
  '#F08927': 'Oranžinė', '#001D43': 'Tamsiai mėlyna', '#004237': 'Butelio žalia',
  '#8C1713': 'Granato', '#C4C4C4': 'Pilka', '#DC002E': 'Raudona',
  '#573D2A': 'Šokoladinė', '#750D68': 'Violetinė', '#008F4F': 'Žalia',
  '#C4DDF1': 'Dangaus mėlyna', '#00A0D1': 'Turkio', '#51A025': 'Žolės žalia',
  '#DC006B': 'Rožinė', '#F8CCD5': 'Šviesiai rožinė', '#484E41': 'Tamsiai pilka',
  '#4C6781': 'Džinso mėlyna', '#F5F0E1': 'Kreminė', '#722F37': 'Vyno raudona',
  '#6B7532': 'Chaki', '#F0786B': 'Koralinė', '#3D3D3D': 'Antracitas',
};

// Produktų modelių numeriai
const PRODUCT_MODELS = {
  'CA6550': '6550', 'CA6424': '6424', 'CA6554': '6554', 'CA6502': '6502',
  'CA6627': '6627', 'CA6681': '6681', 'PO6603': '6603', 'PO6632': '6632',
  'SU1070': '1070', 'SU1067': '1067', 'RA5090': '5090', 'PA1173': '1173',
  'PA0317': '0317', 'CA0423': '0423', 'CA0407': '0407',
};

function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout: 8000 }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadImage(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
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
      {
        folder: 'eprintukas',
        public_id: publicId,
        overwrite: true,
        transformation: [
          { width: 800, height: 800, crop: 'limit' },
          { quality: 'auto' },
          { format: 'webp' }
        ]
      },
      (error, result) => { if (error) reject(error); else resolve(result); }
    );
    stream.end(buffer);
  });
}

async function main() {
  console.log('🖼️  Įkeliame VISAS spalvų nuotraukas...\n');

  // Gauti visus produktus su variantais
  const products = await prisma.product.findMany({
    include: {
      variants: true,
      images: true,
    }
  });

  let totalUploaded = 0;
  let totalFailed = 0;
  let totalSkipped = 0;

  for (const product of products) {
    const model = PRODUCT_MODELS[product.sku];
    if (!model) {
      console.log(`  ⚠️  ${product.name} — nežinomas modelis (${product.sku})`);
      continue;
    }

    // Gauti unikalias spalvas šiam produktui
    const uniqueColors = [...new Map(
      product.variants.map(v => [v.colorHex, v.color])
    ).entries()];

    // Patikrinti kokios spalvos jau turi nuotraukas
    const existingAlts = new Set(product.images.map(i => i.alt?.toLowerCase()));

    console.log(`\n📦 ${product.name} (${product.sku}) — ${uniqueColors.length} spalvų:`);

    let sortOrder = product.images.length;

    for (const [hex, colorName] of uniqueColors) {
      // Praleisti jei jau yra nuotrauka šiai spalvai
      if (existingAlts.has(colorName.toLowerCase())) {
        totalSkipped++;
        continue;
      }

      const code = HEX_TO_CODE[hex.toUpperCase()];
      if (!code) {
        console.log(`     ⚠️ ${colorName} (${hex}) — nežinomas spalvos kodas`);
        totalFailed++;
        continue;
      }

      // Bandyti parsisiųsti nuotrauką (kelios URL variacijso)
      const urls = [
        `https://static.gorfactory.es/images/models/${model}/views/large/p_${model}_${code}_1_1.jpg`,
        `https://static.gorfactory.es/images/models/${model}/views/large/p_${model}_${code}_1_2.jpg`,
        `https://static.gorfactory.es/images/models/${model}/model/large/${model}_${code}_1_1.jpg`,
      ];

      let uploaded = false;
      for (const url of urls) {
        try {
          const buffer = await downloadImage(url);
          if (buffer.length > 3000) {
            const publicId = `${model}_${code}`;
            const result = await uploadToCloudinary(buffer, publicId);

            await prisma.productImage.create({
              data: {
                url: result.secure_url,
                alt: colorName, // SVARBU: alt = spalvos pavadinimas
                productId: product.id,
                sortOrder: sortOrder++,
              }
            });

            console.log(`     ✅ ${colorName} (${code})`);
            totalUploaded++;
            uploaded = true;
            break;
          }
        } catch (e) {
          // Bandyti kitą URL
        }
      }

      if (!uploaded) {
        console.log(`     ❌ ${colorName} (${code})`);
        totalFailed++;
      }

      // Pauzė tarp įkėlimų (Cloudinary rate limit)
      await new Promise(r => setTimeout(r, 400));
    }
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`✅ Įkelta: ${totalUploaded}`);
  console.log(`⏭️  Praleista (jau buvo): ${totalSkipped}`);
  console.log(`❌ Nepavyko: ${totalFailed}`);
  console.log(`${'='.repeat(50)}`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

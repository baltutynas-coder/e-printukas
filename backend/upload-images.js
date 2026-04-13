// ============================================
// Automatinis nuotraukų įkėlimas iš Roly.eu → Cloudinary
// ============================================
// Paleidimas: node upload-images.js
// Reikalinga: npm install cloudinary (jau įdiegta)
// ============================================

const { v2: cloudinary } = require('cloudinary');
const { PrismaClient } = require('@prisma/client');
const https = require('https');
require('dotenv').config({ path: '../.env' });

const prisma = new PrismaClient();

// Cloudinary konfigūracija
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Roly.eu spalvų kodai (vidinis Roly numeravimas)
// Naudojame populiariausias spalvas kiekvienam produktui
const ROLY_COLOR_CODES = {
  WHITE: '01',
  NAVY: '05',
  BLACK: '02',
  RED: '60',
  ROYAL_BLUE: '12',
  HEATHER_GREY: '55',
  KELLY_GREEN: '34',
  TURQUOISE: '12',
  ORANGE: '31',
};

// Produktų nuotraukų konfigūracija
// model: Roly modelio numeris (iš SKU)
// colors: spalvų kodai kuriuos bandysim atsisiųsti
const PRODUCT_IMAGES = [
  { sku: 'CA6550', model: '6550', name: 'Braco', colors: ['01', '02', '60', '05', '55'] },
  { sku: 'CA6424', model: '6424', name: 'Atomic 150', colors: ['78', '01', '02', '60'] },
  { sku: 'CA6554', model: '6554', name: 'Beagle', colors: ['43', '01', '02', '05'] },
  { sku: 'CA6502', model: '6502', name: 'Dogo Premium', colors: ['01', '02', '05', '60'] },
  { sku: 'CA6627', model: '6627', name: 'Jamaica', colors: ['02', '01', '78', '05'] },
  { sku: 'CA6681', model: '6681', name: 'Stafford', colors: ['01', '02', '05', '55'] },
  { sku: 'PO6603', model: '6603', name: 'Pegaso', colors: ['01', '55', '05', '02'] },
  { sku: 'PO6614', model: '6614', name: 'Star', colors: ['01', '02', '05', '78'] },
  { sku: 'PO6632', model: '6632', name: 'Austral', colors: ['01', '05', '02', '60'] },
  { sku: 'SU1070', model: '1070', name: 'Clasica', colors: ['55', '01', '02', '05'] },
  { sku: 'SU1067', model: '1067', name: 'Urban', colors: ['02', '05', '55', '60'] },
  { sku: 'SU1024', model: '1024', name: 'Capucha', colors: ['02', '05', '55'] },
  { sku: 'PK5106', model: '5106', name: 'Alaska', colors: ['55', '02', '05'] },
  { sku: 'RA5090', model: '5090', name: 'Norway', colors: ['55', '05', '02'] },
  { sku: 'RA5099', model: '5099', name: 'Bellagio', colors: ['02', '05', '60'] },
  { sku: 'PA1173', model: '1173', name: 'New Astana', colors: ['02', '05', '55'] },
  { sku: 'PA0317', model: '0317', name: 'Coria', colors: ['02', '05', '01', '55'] },
  { sku: 'CA0423', model: '0423', name: 'Montecarlo', colors: ['01', '02', '05', '60'] },
  { sku: 'CA0407', model: '0407', name: 'Bahrain', colors: ['01', '02', '05', '60'] },
  { sku: 'CA0652', model: '0652', name: 'Detroit', colors: ['01', '02', '05'] },
  { sku: 'CM5593', model: '5593', name: 'Ritz', colors: ['01', '10', '02'] },
  { sku: 'CM5558', model: '5558', name: 'Vesta', colors: ['01', '10', '02'] },
  { sku: 'BO7109', model: '7109', name: 'Orion', colors: ['02', '05', '60'] },
  { sku: 'BO7112', model: '7112', name: 'Evia', colors: ['02', '05', '60'] },
];

// Parsisiųsti nuotrauką iš URL
function downloadImage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        // Sekti redirect
        return downloadImage(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} — ${url}`));
      }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

// Įkelti buffer į Cloudinary
function uploadToCloudinary(buffer, publicId) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'eprintukas',
        public_id: publicId,
        transformation: [
          { width: 800, height: 800, crop: 'limit' },
          { quality: 'auto' },
          { format: 'webp' },
        ],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
}

// Bandyti skirtingus URL variantus
async function tryDownloadProductImage(model, colorCode) {
  const urls = [
    // Produkto vaizdas (be modelio)
    `https://static.gorfactory.es/images/models/${model}/views/large/p_${model}_${colorCode}_1_1.jpg`,
    // Modelio nuotrauka
    `https://static.gorfactory.es/images/models/${model}/model/large/${model}_${colorCode}_1_1.jpg`,
    // Mažesnis vaizdas
    `https://static.gorfactory.es/images/models/${model}/views/medium/p_${model}_${colorCode}_1_1.jpg`,
  ];

  for (const url of urls) {
    try {
      const buffer = await downloadImage(url);
      if (buffer.length > 1000) { // Tikra nuotrauka (ne 404 puslapis)
        return { buffer, url };
      }
    } catch (e) {
      // Bandyti kitą URL
    }
  }
  return null;
}

async function main() {
  console.log('🖼️  Pradedame nuotraukų įkėlimą...\n');

  // Patikrinti Cloudinary konfigūraciją
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
    console.error('❌ Cloudinary raktai neužpildyti .env faile!');
    process.exit(1);
  }
  console.log(`☁️  Cloudinary: ${process.env.CLOUDINARY_CLOUD_NAME}\n`);

  let uploaded = 0;
  let failed = 0;

  for (const product of PRODUCT_IMAGES) {
    // Rasti produktą DB pagal SKU
    const dbProduct = await prisma.product.findFirst({
      where: { sku: product.sku },
      include: { images: true },
    });

    if (!dbProduct) {
      console.log(`  ⚠️  ${product.name} (${product.sku}) — nerastas DB, praleidžiam`);
      continue;
    }

    // Jei jau turi nuotrauką — praleisti
    if (dbProduct.images.length > 0) {
      console.log(`  ⏭️  ${product.name} — jau turi ${dbProduct.images.length} nuotraukų`);
      continue;
    }

    // Bandyti atsisiųsti nuotrauką su skirtingomis spalvomis
    let imageUploaded = false;
    for (const colorCode of product.colors) {
      const result = await tryDownloadProductImage(product.model, colorCode);
      if (result) {
        try {
          // Įkelti į Cloudinary
          const cloudResult = await uploadToCloudinary(
            result.buffer,
            `${product.model}_${colorCode}`
          );

          // Įrašyti į DB
          await prisma.productImage.create({
            data: {
              url: cloudResult.secure_url,
              alt: product.name,
              productId: dbProduct.id,
              sortOrder: 0,
            },
          });

          console.log(`  ✅ ${product.name} — įkelta (spalva ${colorCode})`);
          uploaded++;
          imageUploaded = true;
          break; // Užtenka vienos nuotraukos
        } catch (e) {
          console.log(`  ⚠️  ${product.name} — Cloudinary klaida: ${e.message}`);
        }
      }
    }

    if (!imageUploaded) {
      console.log(`  ❌ ${product.name} — nepavyko rasti nuotraukos`);
      failed++;
    }

    // Mažas uždelsimas kad neapkrautume serverio
    await new Promise(r => setTimeout(r, 500));
  }

  console.log(`\n📊 Rezultatai:`);
  console.log(`  ✅ Įkelta: ${uploaded}`);
  console.log(`  ❌ Nepavyko: ${failed}`);
  console.log(`  📦 Iš viso produktų: ${PRODUCT_IMAGES.length}`);
}

main()
  .catch(e => { console.error('Klaida:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());

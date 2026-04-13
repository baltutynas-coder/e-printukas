// ============================================
// Nuotraukų įkėlimas — VISOS SPALVOS
// ============================================
// Paleidimas: node upload-colors.js
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

// Roly spalvų kodai → mūsų spalvų pavadinimai
const COLOR_MAP = {
  '01': 'Balta',
  '02': 'Juoda',
  '05': 'Tamsiai mėlyna',
  '10': 'Dangaus mėlyna',
  '12': 'Karališka mėlyna',
  '15': 'Violetinė',
  '17': 'Turkio',
  '20': 'Butelio žalia',
  '31': 'Oranžinė',
  '34': 'Žalia',
  '38': 'Žolės žalia',
  '43': 'Turkio',
  '46': 'Denim mėlyna',
  '55': 'Pilka',
  '58': 'Tamsiai pilka',
  '60': 'Raudona',
  '78': 'Rožinė',
  '83': 'Šviesiai rožinė',
  '86': 'Geltona',
  '96': 'Šokoladinė',
  '231': 'Granato',
  '643': 'Šokol. ruda',
};

// Produktai su visomis spalvų kodais kuriuos bandysim
const PRODUCTS = [
  { sku: 'CA6550', model: '6550', name: 'Braco', colors: ['01', '02', '05', '60', '12', '55', '34', '31', '86', '78', '17'] },
  { sku: 'CA6424', model: '6424', name: 'Atomic 150', colors: ['01', '02', '05', '60', '12', '34', '31', '86', '55'] },
  { sku: 'CA6554', model: '6554', name: 'Beagle', colors: ['01', '02', '05', '60', '12', '43', '34', '31', '86', '15', '78', '10'] },
  { sku: 'CA6502', model: '6502', name: 'Dogo Premium', colors: ['01', '02', '05', '60', '12', '34', '55', '46'] },
  { sku: 'CA6627', model: '6627', name: 'Jamaica', colors: ['01', '02', '05', '60', '78', '43', '55', '83'] },
  { sku: 'CA6681', model: '6681', name: 'Stafford', colors: ['01', '02', '05', '60', '55'] },
  { sku: 'PO6603', model: '6603', name: 'Pegaso', colors: ['01', '02', '05', '60', '12', '34', '55', '20'] },
  { sku: 'PO6614', model: '6614', name: 'Star', colors: ['01', '02', '05', '60', '78', '55'] },
  { sku: 'PO6632', model: '6632', name: 'Austral', colors: ['01', '05', '60', '12', '02'] },
  { sku: 'SU1070', model: '1070', name: 'Clasica', colors: ['01', '02', '05', '60', '12', '55'] },
  { sku: 'SU1067', model: '1067', name: 'Urban', colors: ['02', '05', '55', '60', '12', '58'] },
  { sku: 'SU1024', model: '1024', name: 'Capucha', colors: ['02', '05', '55', '60'] },
  { sku: 'PK5106', model: '5106', name: 'Alaska', colors: ['02', '05', '58', '55'] },
  { sku: 'RA5090', model: '5090', name: 'Norway', colors: ['05', '02', '60', '12', '55'] },
  { sku: 'RA5099', model: '5099', name: 'Bellagio', colors: ['02', '05', '60', '55'] },
  { sku: 'PA1173', model: '1173', name: 'New Astana', colors: ['02', '05', '55'] },
  { sku: 'PA0317', model: '0317', name: 'Coria', colors: ['02', '05', '01', '60', '12', '55'] },
  { sku: 'CA0423', model: '0423', name: 'Montecarlo', colors: ['01', '02', '05', '60', '12', '43', '86', '31', '34'] },
  { sku: 'CA0407', model: '0407', name: 'Bahrain', colors: ['01', '02', '05', '60', '12', '34', '78'] },
  { sku: 'CA0652', model: '0652', name: 'Detroit', colors: ['01', '02', '05', '60', '12'] },
  { sku: 'CM5593', model: '5593', name: 'Ritz', colors: ['01', '10', '02', '05'] },
  { sku: 'CM5558', model: '5558', name: 'Vesta', colors: ['01', '10', '02'] },
  { sku: 'BO7109', model: '7109', name: 'Orion', colors: ['02', '05', '60', '12', '55'] },
  { sku: 'BO7112', model: '7112', name: 'Evia', colors: ['02', '05', '60', '43'] },
];

function downloadImage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadImage(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

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

async function tryDownload(model, colorCode) {
  const urls = [
    `https://static.gorfactory.es/images/models/${model}/views/large/p_${model}_${colorCode}_1_1.jpg`,
    `https://static.gorfactory.es/images/models/${model}/model/large/${model}_${colorCode}_1_1.jpg`,
    `https://static.gorfactory.es/images/models/${model}/views/medium/p_${model}_${colorCode}_1_1.jpg`,
  ];

  for (const url of urls) {
    try {
      const buffer = await downloadImage(url);
      if (buffer.length > 2000) return buffer;
    } catch (e) {}
  }
  return null;
}

async function main() {
  console.log('🖼️  Pradedame spalvotų nuotraukų įkėlimą...\n');

  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    console.error('❌ Cloudinary raktai neužpildyti!');
    process.exit(1);
  }

  // Pirma ištriname senas nuotraukas
  console.log('🗑️  Triname senas nuotraukas iš DB...');
  await prisma.productImage.deleteMany();

  let totalUploaded = 0;
  let totalFailed = 0;

  for (const product of PRODUCTS) {
    const dbProduct = await prisma.product.findFirst({
      where: { sku: product.sku },
    });

    if (!dbProduct) {
      console.log(`  ⚠️  ${product.name} — nerastas DB`);
      continue;
    }

    let colorUploaded = 0;

    for (const colorCode of product.colors) {
      const colorName = COLOR_MAP[colorCode] || `Spalva ${colorCode}`;

      const buffer = await tryDownload(product.model, colorCode);
      if (buffer) {
        try {
          const result = await uploadToCloudinary(buffer, `${product.model}_${colorCode}`);

          await prisma.productImage.create({
            data: {
              url: result.secure_url,
              alt: colorName, // Spalvos pavadinimas — naudosime filtravimui
              productId: dbProduct.id,
              sortOrder: colorUploaded,
            },
          });

          colorUploaded++;
          totalUploaded++;
        } catch (e) {
          // Cloudinary klaida — praleisti
        }
      }

      // Uždelsimas
      await new Promise(r => setTimeout(r, 300));
    }

    if (colorUploaded > 0) {
      console.log(`  ✅ ${product.name} — ${colorUploaded} spalvų`);
    } else {
      console.log(`  ❌ ${product.name} — 0 nuotraukų`);
      totalFailed++;
    }
  }

  console.log(`\n📊 Rezultatai:`);
  console.log(`  ✅ Nuotraukų įkelta: ${totalUploaded}`);
  console.log(`  ❌ Produktų be nuotraukų: ${totalFailed}`);
}

main()
  .catch(e => { console.error('Klaida:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());

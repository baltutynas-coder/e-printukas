// ============================================
// Parsisiųsti Roly fono nuotraukas į Cloudinary
// ============================================
// Paleidimas: node upload-banners.js
// ============================================

const { v2: cloudinary } = require('cloudinary');
const https = require('https');
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Visos Roly nuotraukos kurias naudojame
const IMAGES = [
  { name: 'Banner_hombre', url: 'https://static.gorfactory.es/images/home/Banner_hombre_2026_04.jpg' },
  { name: 'Banner_mujer', url: 'https://static.gorfactory.es/images/home/Banner_mujer_2026_04.jpg' },
  { name: 'Banner_ninos', url: 'https://static.gorfactory.es/images/home/Banner_ninos_2026_04.jpg' },
  { name: 'slider_epiro_sparta', url: 'https://static.gorfactory.es/images/home/slider_epiro_sparta.jpg' },
  { name: 'Banner_abrigos', url: 'https://static.gorfactory.es/images/home/Banner_abrigos_2026_04.jpg' },
  { name: 'Banner_sportcollection', url: 'https://static.gorfactory.es/images/home/Banner_sportcollection_2026_04.jpg' },
];

function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout: 15000 }, (res) => {
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
      { folder: 'eprintukas/banners', public_id: publicId, overwrite: true,
        transformation: [{ quality: 'auto:good' }, { format: 'jpg' }] },
      (error, result) => { if (error) reject(error); else resolve(result); }
    );
    stream.end(buffer);
  });
}

async function main() {
  console.log('🖼️  Parsisiunčiame Roly nuotraukas į Cloudinary...\n');
  const results = {};

  for (const img of IMAGES) {
    try {
      console.log(`  ⬇️  ${img.name}...`);
      const buffer = await downloadImage(img.url);
      console.log(`  ⬆️  Įkeliame į Cloudinary (${(buffer.length / 1024).toFixed(0)} KB)...`);
      const result = await uploadToCloudinary(buffer, img.name);
      results[img.name] = result.secure_url;
      console.log(`  ✅ ${img.name} → ${result.secure_url}\n`);
    } catch (e) {
      console.log(`  ❌ ${img.name}: ${e.message}\n`);
    }
    await new Promise(r => setTimeout(r, 500));
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ NAUJI URL (nukopijuok ir pakeisk kode):');
  console.log('='.repeat(60));
  for (const [name, url] of Object.entries(results)) {
    console.log(`${name}: ${url}`);
  }
  console.log('='.repeat(60));
}

main().catch(e => { console.error(e); process.exit(1); });

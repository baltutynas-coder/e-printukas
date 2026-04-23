// ============================================
// KAINŲ ATNAUJINIMAS v3 — PATAISYTAS
// ============================================
const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');
require('dotenv').config();
const prisma = new PrismaClient();

async function main() {
  console.log('═'.repeat(60));
  console.log('💰 KAINŲ ATNAUJINIMAS v3');
  console.log('═'.repeat(60));

  const priceMap = {};
  const files = ['pricelist-roly-int.xlsx', 'pricelist-workwear-int.xlsx'];
  
  for (const file of files) {
    try {
      const wb = XLSX.readFile(file);
      for (const sheetName of wb.SheetNames) {
        const ws = wb.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
        if (data.length < 5) continue;
        
        let currentRef = null;
        let currentName = null;
        
        for (const row of data) {
          if (!row || row.length < 10) continue;
          
          // Ref gali būti skaičius ARBA tekstas
          const rawRef = row[2];
          if (rawRef !== null && rawRef !== undefined) {
            const refStr = rawRef.toString().trim();
            // Patikrinti ar tai ref numeris (3-5 skaitmenys)
            if (/^\d{3,5}$/.test(refStr)) {
              currentRef = refStr;
              if (row[3] && typeof row[3] === 'string' && row[3].length > 1) {
                currentName = row[3];
              }
            }
          }
          
          // Kaina
          const boxPrice = row[9];
          if (currentRef && typeof boxPrice === 'number' && boxPrice > 0 && boxPrice < 500) {
            const ref = currentRef.padStart(4, '0');
            if (!priceMap[ref]) {
              priceMap[ref] = { name: currentName, minPrice: Infinity, unitPrice: 0 };
            }
            if (boxPrice < priceMap[ref].minPrice) priceMap[ref].minPrice = boxPrice;
            const unitPrice = typeof row[11] === 'number' && row[11] > 0 ? row[11] : boxPrice * 1.2;
            if (unitPrice > priceMap[ref].unitPrice) priceMap[ref].unitPrice = unitPrice;
          }
        }
      }
    } catch (e) {
      console.log(`   ⚠️  ${file}: ${e.message}`);
    }
  }

  console.log(`📦 Kainų rasta: ${Object.keys(priceMap).length} produktų`);

  // Keletas pavyzdžių
  const samples = ['0407','0425','1115','0413','0551','6554','8397'];
  samples.forEach(ref => {
    const p = priceMap[ref];
    if (p) console.log(`   ${ref} (${p.name}): ${p.minPrice}€`);
    else console.log(`   ${ref}: NERASTA`);
  });

  // Atnaujinti DB
  console.log('\n🔄 Atnaujinamos kainos...\n');
  const products = await prisma.product.findMany({ select: { id: true, name: true, sku: true, price: true } });
  
  let updated = 0, notFound = 0;
  const missing = [];

  for (const product of products) {
    if (!product.sku) continue;
    const refNum = product.sku.replace(/^[A-Z]+/, '').padStart(4, '0');
    const priceInfo = priceMap[refNum];
    
    if (priceInfo && priceInfo.minPrice < Infinity) {
      const newPrice = priceInfo.minPrice;
      const comparePrice = priceInfo.unitPrice > newPrice * 1.05 ? priceInfo.unitPrice : null;
      const oldPrice = parseFloat(product.price);
      
      await prisma.product.update({
        where: { id: product.id },
        data: { price: newPrice, comparePrice }
      });
      if (Math.abs(oldPrice - newPrice) > 0.01) {
        console.log(`   ✅ ${product.name} (${product.sku}): ${oldPrice}€ → ${newPrice}€`);
      }
      updated++;
    } else {
      notFound++;
      missing.push(`${product.sku} | ${product.name}`);
    }
  }

  console.log('\n' + '═'.repeat(60));
  console.log(`✅ Atnaujinta: ${updated}`);
  console.log(`❌ Nerasta: ${notFound}`);
  if (missing.length > 0) {
    console.log('\nNerasti:');
    missing.forEach(m => console.log('  ', m));
  }
  console.log('═'.repeat(60));
  
  await prisma.$disconnect();
}

main().catch(e => { console.error('❌', e); process.exit(1); });

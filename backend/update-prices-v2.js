// ============================================
// KAINŲ ATNAUJINIMAS v2 — VISŲ LAPŲ SKAITYMAS
// ============================================
const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');
require('dotenv').config();
const prisma = new PrismaClient();

async function main() {
  console.log('═'.repeat(60));
  console.log('💰 KAINŲ ATNAUJINIMAS v2');
  console.log('═'.repeat(60));

  // Surinkti kainas iš VISŲ lapų, VISŲ failų
  const priceMap = {};
  const files = ['pricelist-roly-int.xlsx', 'pricelist-workwear-int.xlsx'];
  
  for (const file of files) {
    try {
      const wb = XLSX.readFile(file);
      console.log(`\n📊 ${file}: lapai [${wb.SheetNames.join(', ')}]`);
      
      for (const sheetName of wb.SheetNames) {
        const ws = wb.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
        if (data.length < 5) continue;
        
        let currentRef = null;
        let currentName = null;
        let found = 0;
        
        for (const row of data) {
          if (!row || row.length < 10) continue;
          
          // Nauja produkto eilutė
          if (row[2] && typeof row[2] === 'number' && row[2] > 100) {
            currentRef = row[2].toString();
            currentName = row[3] || currentName;
          }
          
          // Kaina (index 9 = Box/Caja)
          const boxPrice = row[9];
          if (currentRef && typeof boxPrice === 'number' && boxPrice > 0 && boxPrice < 500) {
            // Saugom su visais galimais ref formatais
            const refs = [
              currentRef,
              currentRef.padStart(4, '0'),
              currentRef.padStart(5, '0'),
            ];
            
            for (const ref of refs) {
              if (!priceMap[ref]) {
                priceMap[ref] = { name: currentName, minPrice: Infinity, unitPrice: 0 };
                found++;
              }
              if (boxPrice < priceMap[ref].minPrice) priceMap[ref].minPrice = boxPrice;
              const unitPrice = typeof row[11] === 'number' ? row[11] : boxPrice * 1.2;
              if (unitPrice > priceMap[ref].unitPrice) priceMap[ref].unitPrice = unitPrice;
            }
          }
        }
        if (found > 0) console.log(`   ${sheetName}: ${found} produktų`);
      }
    } catch (e) {
      console.log(`   ⚠️  ${file}: ${e.message}`);
    }
  }

  console.log(`\n📦 Viso kainų: ${Object.keys(priceMap).length} ref numerių`);

  // Atnaujinti DB
  console.log('\n🔄 Atnaujinamos kainos...\n');
  const products = await prisma.product.findMany({ select: { id: true, name: true, sku: true, price: true } });
  
  let updated = 0, notFound = 0;
  const missing = [];

  for (const product of products) {
    if (!product.sku) continue;
    const refNum = product.sku.replace(/^[A-Z]+/, '');
    
    // Bandome kelis formatus
    const tryRefs = [refNum, refNum.padStart(4, '0'), refNum.padStart(5, '0'), refNum.replace(/^0+/, '')];
    
    let priceInfo = null;
    for (const ref of tryRefs) {
      if (priceMap[ref]) { priceInfo = priceMap[ref]; break; }
    }
    
    if (priceInfo && priceInfo.minPrice < Infinity) {
      const newPrice = priceInfo.minPrice;
      const comparePrice = priceInfo.unitPrice > newPrice * 1.05 ? priceInfo.unitPrice : null;
      const oldPrice = parseFloat(product.price);
      
      if (Math.abs(oldPrice - newPrice) > 0.01) {
        await prisma.product.update({
          where: { id: product.id },
          data: { price: newPrice, comparePrice }
        });
        console.log(`   ✅ ${product.name} (${product.sku}): ${oldPrice}€ → ${newPrice}€`);
        updated++;
      }
    } else {
      notFound++;
      missing.push(`${product.sku} | ${product.name}`);
    }
  }

  console.log('\n' + '═'.repeat(60));
  console.log(`✅ Atnaujinta: ${updated}`);
  console.log(`❌ Nerasta: ${notFound}`);
  if (missing.length > 0) {
    console.log('\nNerasti produktai:');
    missing.forEach(m => console.log('  ', m));
  }
  console.log('═'.repeat(60));
  
  await prisma.$disconnect();
}

main().catch(e => { console.error('❌', e); process.exit(1); });

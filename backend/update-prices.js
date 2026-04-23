// ============================================
// KAINŲ ATNAUJINIMAS IŠ ROLY KAINORAŠČIO
// ============================================
// Paleidimas: node update-prices.js
// ============================================

const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');
require('dotenv').config();

const prisma = new PrismaClient();

// SKU prefiksų žemėlapis: Ref numeris → prefiksas
// Roly Excel turi tik skaičius (pvz. 6554), o mūsų DB turi CA6554
const PREFIX_RANGES = {
  // CA - marškinėliai (01xx, 02xx, 03xx, 04xx, 05xx, 06xx, 1xxx, 2xxx, 6xxx, 7xxx)
  // PO - polo (04xx, 06xx, 84xx)
  // SU - džemperiai (1xxx)
  // AB - striukės (1xxx, 4xxx, 9xxx)
  // PA - kelnės (03xx, 04xx, 05xx, 1xxx, 6xxx, 9xxx)
  // HV - signaliniai (93xx)
  // CQ - HORECA (50xx, 64xx)
  // CM - marškiniai (67xx)
  // ZL - avalynė (83xx, 84xx, 85xx, 86xx, 87xx, 88xx, 89xx)
};

async function main() {
  console.log('═'.repeat(60));
  console.log('💰 KAINŲ ATNAUJINIMAS IŠ ROLY KAINORAŠČIO');
  console.log('═'.repeat(60));

  // ============================================
  // 1. SKAITYTI EXCEL FAILĄ
  // ============================================
  console.log('\n📊 Skaitomas pricelist-roly-int.xlsx...');
  
  const wb = XLSX.readFile('pricelist-roly-int.xlsx');
  const ws = wb.Sheets['Tarifa 2026'];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
  
  console.log(`   Eilučių: ${data.length}`);

  // Taip pat skaitom workwear kainoraštį
  let workwearData = [];
  try {
    const wb2 = XLSX.readFile('pricelist-workwear-int.xlsx');
    const sheetName = wb2.SheetNames.find(s => s.includes('Tarifa') || s.includes('2026')) || wb2.SheetNames[0];
    const ws2 = wb2.Sheets[sheetName];
    workwearData = XLSX.utils.sheet_to_json(ws2, { header: 1 });
    console.log(`   Workwear eilučių: ${workwearData.length}`);
  } catch (e) {
    console.log('   ⚠️  Workwear kainoraštis nerastas, tęsiame be jo');
  }

  // ============================================
  // 2. IŠTRAUKTI KAINAS IŠ EXCEL
  // ============================================
  // Struktūra: [page, link, ref, name, gender, size, color, units/box, units/pack, BOX_PRICE, PACK_PRICE, UNIT_PRICE]
  // Index:      0      1     2    3      4       5     6       7          8          9          10          11
  
  const priceMap = {}; // ref_number → { name, minPrice, unitPrice, prices: [] }
  let currentRef = null;
  let currentName = null;

  const allData = [...data, ...workwearData];

  for (const row of allData) {
    if (!row || row.length < 10) continue;

    // Nauja produkto eilutė (turi Ref numerį)
    if (row[2] && typeof row[2] === 'number' && row[2] > 100) {
      currentRef = row[2].toString().padStart(4, '0');
      currentName = row[3] || currentName;
    }

    // Kaina eilutėje (index 9 = Box price)
    const boxPrice = row[9];
    if (currentRef && typeof boxPrice === 'number' && boxPrice > 0 && boxPrice < 500) {
      if (!priceMap[currentRef]) {
        priceMap[currentRef] = {
          name: currentName,
          minPrice: boxPrice,
          maxPrice: boxPrice,
          unitPrice: typeof row[11] === 'number' ? row[11] : boxPrice * 1.2,
          allPrices: []
        };
      }
      
      // Atnaujinti mažiausią kainą
      if (boxPrice < priceMap[currentRef].minPrice) {
        priceMap[currentRef].minPrice = boxPrice;
      }
      if (boxPrice > priceMap[currentRef].maxPrice) {
        priceMap[currentRef].maxPrice = boxPrice;
      }
      if (typeof row[11] === 'number' && row[11] > 0) {
        priceMap[currentRef].unitPrice = Math.max(priceMap[currentRef].unitPrice, row[11]);
      }
      priceMap[currentRef].allPrices.push(boxPrice);
    }
  }

  console.log(`\n📦 Rasta ${Object.keys(priceMap).length} produktų su kainomis`);

  // Parodom kelias pavyzdines kainas
  const samples = Object.entries(priceMap).slice(0, 5);
  samples.forEach(([ref, info]) => {
    console.log(`   ${ref} (${info.name}): ${info.minPrice}€ - ${info.maxPrice}€ (vnt: ${info.unitPrice?.toFixed(2)}€)`);
  });

  // ============================================
  // 3. GAUTI PRODUKTUS IŠ DB
  // ============================================
  console.log('\n🔄 Atnaujinamos kainos duomenų bazėje...\n');
  
  const products = await prisma.product.findMany({
    select: { id: true, name: true, sku: true, price: true }
  });
  
  let updated = 0;
  let notFound = 0;
  const notFoundList = [];

  for (const product of products) {
    if (!product.sku) continue;

    // Ištraukti ref numerį iš SKU (pvz. CA6554 → 6554)
    const refNum = product.sku.replace(/^[A-Z]+/, '').padStart(4, '0');
    
    const priceInfo = priceMap[refNum];
    
    if (priceInfo) {
      // Naudojame Box kainą kaip pagrindinę (didmeninė)
      const newPrice = priceInfo.minPrice;
      // comparePrice = vienetinė kaina (braukta)
      const comparePrice = priceInfo.unitPrice > newPrice ? priceInfo.unitPrice : null;
      
      const oldPrice = parseFloat(product.price);
      
      if (Math.abs(oldPrice - newPrice) > 0.01) {
        await prisma.product.update({
          where: { id: product.id },
          data: { 
            price: newPrice,
            comparePrice: comparePrice
          }
        });
        console.log(`   ✅ ${product.name} (${product.sku}): ${oldPrice}€ → ${newPrice}€${comparePrice ? ` (buvo ${comparePrice.toFixed(2)}€)` : ''}`);
        updated++;
      }
    } else {
      notFound++;
      notFoundList.push(`${product.name} (${product.sku} → ref:${refNum})`);
    }
  }

  // ============================================
  // 4. ATASKAITA
  // ============================================
  console.log('\n' + '═'.repeat(60));
  console.log(`✅ KAINOS ATNAUJINTOS!`);
  console.log(`   Atnaujinta: ${updated}`);
  console.log(`   Nerasta kainų: ${notFound}`);
  if (notFoundList.length > 0 && notFoundList.length <= 20) {
    console.log(`   Nerasti:`);
    notFoundList.forEach(n => console.log(`     - ${n}`));
  }
  console.log('═'.repeat(60));
}

main()
  .catch(e => { console.error('❌', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());

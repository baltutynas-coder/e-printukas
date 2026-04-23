// ============================================
// TRŪKSTAMŲ KAINŲ PAIEŠKA PAGAL PAVADINIMĄ
// ============================================
const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');
require('dotenv').config();
const prisma = new PrismaClient();

const MISSING = [
  'PO6603','CA0201','CA6556','PO6612','CA6563','CA6562','CA0396',
  'SU1121','PO6641','PO0395','SU1077','SU1112','CQ5064',
  'SU1111','SU1087','CQ1103','CQ1106','CQ1107','CQ1116',
  'CA6657','CA6667','CA0450','CA0424','SU1122','AB4112',
  'AB4091','AB4111','AB4090','CA1113','CA1114','AB4121',
  'SU1102','CA6670','CA6664'
];

async function main() {
  console.log('🔍 Ieškoma trūkstamų kainų pagal pavadinimą...\n');

  // Gauti produktų pavadinimus iš DB
  const products = await prisma.product.findMany({
    where: { sku: { in: MISSING } },
    select: { id: true, name: true, sku: true, price: true }
  });

  // Skaityti visus Excel lapus
  const allRows = [];
  for (const file of ['pricelist-roly-int.xlsx', 'pricelist-workwear-int.xlsx']) {
    try {
      const wb = XLSX.readFile(file);
      for (const sn of wb.SheetNames) {
        const data = XLSX.utils.sheet_to_json(wb.Sheets[sn], { header: 1 });
        data.forEach((row, idx) => {
          if (row && row[3] && typeof row[3] === 'string' && row[3].length > 1) {
            allRows.push({ file, sheet: sn, row: idx, name: row[3], ref: row[2], price: row[9] });
          }
        });
      }
    } catch(e) {}
  }

  console.log(`Excel eilučių su pavadinimais: ${allRows.length}\n`);

  // Ieškoti kiekvieno produkto pagal pavadinimą
  let found = 0;
  const notFound = [];

  for (const product of products) {
    const searchName = product.name.toLowerCase().replace(/\s+woman$/i, '').replace(/\s+l\/s$/i, '');
    
    // Ieškoti tiksliai
    let match = allRows.find(r => 
      r.name.toLowerCase() === searchName.toLowerCase() && 
      typeof r.price === 'number' && r.price > 0
    );
    
    // Ieškoti dalinai
    if (!match) {
      match = allRows.find(r => 
        r.name.toLowerCase().includes(searchName.toLowerCase()) && 
        typeof r.price === 'number' && r.price > 0
      );
    }

    // Ieškoti pagal ref be prefikso
    if (!match) {
      const refNum = product.sku.replace(/^[A-Z]+/, '');
      match = allRows.find(r => {
        const rowRef = r.ref?.toString();
        return rowRef === refNum && typeof r.price === 'number' && r.price > 0;
      });
    }

    if (match) {
      await prisma.product.update({
        where: { id: product.id },
        data: { price: match.price }
      });
      console.log(`✅ ${product.name} (${product.sku}): ${product.price}€ → ${match.price}€ [Excel: ${match.name}, ref:${match.ref}]`);
      found++;
    } else {
      notFound.push(product);
      console.log(`❌ ${product.name} (${product.sku}): nerasta Excel`);
    }
  }

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`✅ Rasta: ${found} | ❌ Nerasta: ${notFound.length}`);
  
  if (notFound.length > 0) {
    console.log('\nNerasti produktai (reikės rankiniu būdu):');
    notFound.forEach(p => console.log(`  ${p.sku} | ${p.name} | dabartinė: ${p.price}€`));
  }
  console.log('═'.repeat(60));
  
  await prisma.$disconnect();
}

main().catch(e => { console.error('❌', e); process.exit(1); });

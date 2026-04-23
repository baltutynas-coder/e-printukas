// Patikrinti kurie produktai neturi kainų
const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');
require('dotenv').config();
const prisma = new PrismaClient();

async function run() {
  const wb1 = XLSX.readFile('pricelist-roly-int.xlsx');
  const wb2 = XLSX.readFile('pricelist-workwear-int.xlsx');
  const d1 = XLSX.utils.sheet_to_json(wb1.Sheets['Tarifa 2026'], {header:1});
  const d2 = XLSX.utils.sheet_to_json(wb2.Sheets['Tarifa 2026'], {header:1});
  
  // Surinkti visus ref numerius iš Excel
  const refs = new Set();
  [...d1, ...d2].forEach(r => {
    if (r && r[2] && typeof r[2] === 'number' && r[2] > 100) {
      refs.add(r[2].toString().padStart(4, '0'));
    }
  });
  
  const prods = await prisma.product.findMany({ select: { sku: true, name: true, price: true } });
  
  let missing = [];
  let found = [];
  prods.forEach(p => {
    const ref = p.sku?.replace(/^[A-Z]+/, '').padStart(4, '0');
    if (!refs.has(ref)) {
      missing.push(`${p.sku} | ${p.name} | ${p.price}€`);
    } else {
      found.push(p.sku);
    }
  });
  
  console.log('Excel refs:', refs.size);
  console.log('DB products:', prods.length);
  console.log('Found in Excel:', found.length);
  console.log('Missing:', missing.length);
  console.log('\nMissing products:');
  missing.forEach(m => console.log('  ', m));
  
  await prisma.$disconnect();
}

run();

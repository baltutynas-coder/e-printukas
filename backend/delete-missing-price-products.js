// ============================================
// IŠTRINTI PRODUKTUS SU PROBLEMOMIS DĖL KAINŲ
// ============================================
// Paleidimas: node delete-missing-price-products.js
// ============================================

const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();

// 30 produktų kuriems nepavyko rasti kainų
const TO_DELETE = [
  'CA0201', // Assen
  'CA6556', // Joplin
  'PO6612', // Tyler
  'SU1121', // Zair
  'CA6563', // Veza woman
  'CA6562', // Veza
  'CA0396', // Terrier
  'PO6641', // Imperium
  'PO0395', // Bowie
  'SU1077', // Etna
  'CQ5064', // Everest
  'SU1087', // Capucha
  'CQ1103', // Elbrus
  'CQ1106', // Alaska
  'CQ1107', // Utah
  'CQ1116', // Iliada
  'CA6657', // Suzuka
  'CA6667', // Jada
  'CA0450', // Camimera
  'CA0424', // Tokyo
  'SU1122', // Arlas
  'AB4112', // Malbec
  'AB4091', // Venet
  'AB4111', // Colins
  'AB4090', // Roden
  'CA1113', // Melbourne
  'CA1114', // Melbourne woman
  'AB4121', // Kinto
  'SU1102', // Amandus
  'CA6664', // Aintree
];

async function main() {
  console.log('═'.repeat(60));
  console.log('🗑️  TRINAMI PRODUKTAI SU PROBLEMOMIS DĖL KAINŲ');
  console.log('═'.repeat(60));
  console.log(`📋 Trinsime: ${TO_DELETE.length} produktų\n`);

  let deleted = 0;
  let notFound = 0;

  for (const sku of TO_DELETE) {
    try {
      // Surasti produktą
      const product = await prisma.product.findFirst({
        where: { sku },
        include: { images: true, variants: true }
      });

      if (!product) {
        console.log(`   ⚠️  ${sku} — nerastas DB`);
        notFound++;
        continue;
      }

      // Ištrinti susijusius duomenis (kaskadiniai trynimai iš schema)
      // Images ir variants turi onDelete: Cascade, todėl ištrinami automatiškai
      await prisma.product.delete({ where: { id: product.id } });
      
      console.log(`   ✅ ${product.name} (${sku}) — ${product.images.length} nuotr., ${product.variants.length} var.`);
      deleted++;
    } catch (e) {
      console.log(`   ❌ ${sku}: ${e.message.substring(0, 80)}`);
    }
  }

  const total = await prisma.product.count();

  console.log('\n' + '═'.repeat(60));
  console.log(`✅ Ištrinta: ${deleted}`);
  console.log(`⚠️  Nerasta: ${notFound}`);
  console.log(`📋 Viso DB liko: ${total} produktų`);
  console.log('═'.repeat(60));

  await prisma.$disconnect();
}

main().catch(e => { console.error('❌', e); process.exit(1); });

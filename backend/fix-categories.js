// ============================================
// KATEGORIJŲ TAISYMAS — fix-categories.js
// ============================================
// Paleidimas: node fix-categories.js
// ============================================
// 1. Sukuria trūkstamas kategorijas (Avalynė, Eco, Kiti)
// 2. Perkelia produktus į teisingas kategorijas
// 3. Atnaujina meniu struktūrą
// ============================================

const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();

// ============================================
// SPORTINIAI PRODUKTAI (pagal SKU)
// ============================================
const SPORT_SKUS = [
  // Techniniai marškinėliai
  'CA0413','CA6670','CA0432','CA0415','CA0424','CA6658','CA6656',
  'CA6649','CA6654','CA0416','CA6399','CA0450','CA6663','CA6653',
  'CA6401','CA0420','CA0425','CA0428','CA0408','CA0431','CA0430',
  'CA6664','CA0407','CA0423',
  // Sportiniai polo
  'PO0421','PO0410','PO0404','PO0401','PO0400',
  // Sportiniai džemperiai
  'SU1033','SU1121',
  // Sportinės kelnės
  'PA0551','PA0552','PA0436','PA0521','PA0460','PA0461','PA6688',
  'PA9088','PA0317','PA1173',
  // Sportiniai rinkiniai
  'RA5090',
];

// ECO PRODUKTAI
const ECO_SKUS = [
  'CA6691', // Golden
  'CA6689', // Breda  
  'CA6696', // Golden woman
  'CA6698', // Breda
  'CA6699', // Breda woman
  'CA6690', // Golden
];

// AVALYNĖS PRODUKTAI (ZL prefiksas)
// Visi ZL produktai automatiškai perkels

async function main() {
  console.log('═'.repeat(60));
  console.log('🔧 KATEGORIJŲ TAISYMAS');
  console.log('═'.repeat(60));

  // ============================================
  // 1. GAUTI ESAMAS KATEGORIJAS
  // ============================================
  const allCats = await prisma.category.findMany({ include: { children: true } });
  const catMap = {};
  allCats.forEach(c => { catMap[c.slug] = c; });
  
  console.log('\n📋 Esamos kategorijos:');
  allCats.filter(c => !c.parentId).forEach(c => {
    console.log(`   ${c.name} (${c.slug})`);
    c.children?.forEach(ch => {
      console.log(`     └ ${ch.name} (${ch.slug})`);
    });
  });

  // ============================================
  // 2. SUKURTI TRŪKSTAMAS KATEGORIJAS
  // ============================================
  console.log('\n🆕 Kuriamos naujos kategorijos...');

  // Avalynė (po Darbo drabužiai arba atskira)
  let avalyne = catMap['avalyne'];
  if (!avalyne) {
    const darboParent = allCats.find(c => c.slug === 'darbo-drabuziai');
    avalyne = await prisma.category.create({
      data: { name: 'Avalynė', slug: 'avalyne', parentId: darboParent?.id, sortOrder: 5 }
    });
    console.log('   ✅ Sukurta: Avalynė (po Darbo drabužiai)');
  }

  // Eco (atskira pagrindinė kategorija)
  let eco = catMap['eco'];
  if (!eco) {
    eco = await prisma.category.create({
      data: { name: 'Eco', slug: 'eco', sortOrder: 7 }
    });
    console.log('   ✅ Sukurta: Eco (pagrindinė)');
  }

  // Kiti produktai (atskira pagrindinė)
  let kitiProd = catMap['kiti-produktai'];
  if (!kitiProd) {
    kitiProd = await prisma.category.create({
      data: { name: 'Kiti produktai', slug: 'kiti-produktai', sortOrder: 8 }
    });
    console.log('   ✅ Sukurta: Kiti produktai (pagrindinė)');
  }

  // Sportinės kelnės (po Sportinė kolekcija)  
  let sportKelnes = catMap['sportines-kelnes'];
  if (!sportKelnes) {
    const sportParent = allCats.find(c => c.slug === 'sportine-kolekcija');
    if (sportParent) {
      sportKelnes = await prisma.category.create({
        data: { name: 'Sportinės kelnės', slug: 'sportines-kelnes', parentId: sportParent.id, sortOrder: 3 }
      });
      console.log('   ✅ Sukurta: Sportinės kelnės (po Sportinė kolekcija)');
    }
  }

  // Sportiniai komplektai (patikrinti ar yra)
  let sportKompl = catMap['sportiniai-komplektai'];

  // ============================================
  // 3. PERKELTI PRODUKTUS
  // ============================================
  console.log('\n🔄 Perkeliami produktai...\n');

  const allProducts = await prisma.product.findMany({ select: { id: true, name: true, sku: true, categoryId: true } });
  let moved = 0;

  // Gauti atnaujintas kategorijas
  const updatedCats = await prisma.category.findMany();
  const updatedMap = {};
  updatedCats.forEach(c => { updatedMap[c.slug] = c; });

  // Sportinė kolekcija subkategorijos
  const sportMarskineliai = updatedMap['sportiniai-marskineliai'];
  const sportKelnesCat = updatedMap['sportines-kelnes'];
  const sportKomplCat = updatedMap['sportiniai-komplektai'];
  const avalyneCat = updatedMap['avalyne'];
  const ecoCat = updatedMap['eco'];

  for (const product of allProducts) {
    const sku = product.sku || '';
    const prefix = sku.replace(/\d+/g, '');
    let newCatId = null;
    let reason = '';

    // AVALYNĖ — visi ZL produktai
    if (prefix === 'ZL') {
      newCatId = avalyneCat?.id;
      reason = 'ZL → Avalynė';
    }
    // SPORTINIAI — pagal SKU sąrašą
    else if (SPORT_SKUS.includes(sku)) {
      if (prefix === 'CA' || prefix === 'PO') {
        newCatId = sportMarskineliai?.id;
        reason = 'Sport CA/PO → Sportiniai marškinėliai';
      } else if (prefix === 'PA') {
        newCatId = sportKelnesCat?.id || sportKomplCat?.id;
        reason = 'Sport PA → Sportinės kelnės';
      } else if (prefix === 'SU') {
        newCatId = sportMarskineliai?.id; // džemperiai sport
        reason = 'Sport SU → Sportiniai';
      } else if (prefix === 'RA') {
        newCatId = sportKomplCat?.id || sportMarskineliai?.id;
        reason = 'Sport RA → Sportiniai komplektai';
      }
    }
    // ECO — pagal SKU sąrašą
    else if (ECO_SKUS.includes(sku)) {
      newCatId = ecoCat?.id;
      reason = 'Eco produktas';
    }

    // Atnaujinti jei reikia
    if (newCatId && newCatId !== product.categoryId) {
      await prisma.product.update({
        where: { id: product.id },
        data: { categoryId: newCatId }
      });
      console.log(`   ✅ ${product.name} (${sku}) → ${reason}`);
      moved++;
    }
  }

  // ============================================
  // 4. GALUTINĖ ATASKAITA
  // ============================================
  console.log('\n' + '═'.repeat(60));
  console.log(`✅ BAIGTA! Perkelta: ${moved} produktų`);
  
  // Suskaičiuoti naujus kiekius
  const finalProducts = await prisma.product.findMany({
    include: { category: true }
  });
  
  const finalCounts = {};
  finalProducts.forEach(p => {
    const slug = p.category?.slug || 'BE KATEGORIJOS';
    finalCounts[slug] = (finalCounts[slug] || 0) + 1;
  });

  console.log('\n📊 Nauji kategorijų kiekiai:');
  const sortedCounts = Object.entries(finalCounts).sort((a, b) => b[1] - a[1]);
  for (const [slug, count] of sortedCounts) {
    console.log(`   ${slug}: ${count}`);
  }
  console.log('═'.repeat(60));
}

main()
  .catch(e => { console.error('❌', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());

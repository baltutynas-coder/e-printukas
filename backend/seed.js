// ============================================
// DB Seed — Roly.eu pilna duomenų struktūra
// ============================================
// Paleidimas: node seed.js
// ============================================

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

// Roly spalvų paletė (pilna) — 25 spalvos su Roly kodais
const C = {
  WHITE:        { name: 'Balta',             hex: '#FFFFFF', code: '01' },
  BLACK:        { name: 'Juoda',             hex: '#000000', code: '02' },
  YELLOW:       { name: 'Geltona',           hex: '#FFE400', code: '03' },
  ROYAL_BLUE:   { name: 'Karališka mėlyna',  hex: '#0060A9', code: '05' },
  ORANGE:       { name: 'Oranžinė',          hex: '#F08927', code: '31' },
  NAVY:         { name: 'Tamsiai mėlyna',    hex: '#001D43', code: '55' },
  BOTTLE_GREEN: { name: 'Butelio žalia',     hex: '#004237', code: '56' },
  GARNET:       { name: 'Granato',           hex: '#8C1713', code: '57' },
  HEATHER_GREY: { name: 'Pilka',             hex: '#C4C4C4', code: '58' },
  RED:          { name: 'Raudona',           hex: '#DC002E', code: '60' },
  CHOCOLATE:    { name: 'Šokoladinė',        hex: '#573D2A', code: '67' },
  PURPLE:       { name: 'Violetinė',         hex: '#750D68', code: '71' },
  KELLY_GREEN:  { name: 'Žalia',             hex: '#008F4F', code: '83' },
  SKY_BLUE:     { name: 'Dangaus mėlyna',    hex: '#C4DDF1', code: '86' },
  TURQUOISE:    { name: 'Turkio',            hex: '#00A0D1', code: '12' },
  GRASS_GREEN:  { name: 'Žolės žalia',       hex: '#51A025', code: '264' },
  ROSETTE:      { name: 'Rožinė',           hex: '#DC006B', code: '78' },
  LIGHT_PINK:   { name: 'Šviesiai rožinė',   hex: '#F8CCD5', code: '48' },
  DARK_LEAD:    { name: 'Tamsiai pilka',     hex: '#484E41', code: '46' },
  DENIM_BLUE:   { name: 'Džinso mėlyna',    hex: '#4C6781', code: '231' },
  CREAM:        { name: 'Kreminė',           hex: '#F5F0E1', code: '132' },
  WINE:         { name: 'Vyno raudona',      hex: '#722F37', code: '116' },
  KHAKI:        { name: 'Chaki',             hex: '#6B7532', code: '15' },
  CORAL:        { name: 'Koralinė',          hex: '#F0786B', code: '169' },
  ANTHRACITE:   { name: 'Antracitas',        hex: '#3D3D3D', code: '231' },
};

// Dydžių rinkiniai
const SIZES_XS_2XL  = ['XS', 'S', 'M', 'L', 'XL', '2XL'];
const SIZES_XS_4XL  = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'];
const SIZES_XS_5XL  = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];
const SIZES_KIDS    = ['3/4', '5/6', '7/8', '9/10', '11/12'];

async function main() {
  console.log('🌱 Sėjame Roly.eu stiliaus duomenis (v2 — pilna)...\n');
  console.log('🗑️  Valome senus duomenis...');

  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  // Admin
  const hashedPassword = await bcrypt.hash('admin123', 12);
  await prisma.admin.upsert({
    where: { email: 'admin@eprintukas.lt' },
    update: {},
    create: { email: 'admin@eprintukas.lt', password: hashedPassword, name: 'Administratorius', role: 'ADMIN' }
  });
  console.log('✅ Admin: admin@eprintukas.lt\n');

  // ============================================
  // KATEGORIJOS
  // ============================================
  const cats = {};

  cats['marskineliai-ir-polo'] = await prisma.category.create({
    data: { name: 'Marškinėliai ir polo', slug: 'marskineliai-ir-polo', sortOrder: 1 }
  });
  cats['marskineliai'] = await prisma.category.create({
    data: { name: 'Marškinėliai', slug: 'marskineliai', sortOrder: 1, parentId: cats['marskineliai-ir-polo'].id }
  });
  cats['polo'] = await prisma.category.create({
    data: { name: 'Polo marškinėliai', slug: 'polo-marskineliai', sortOrder: 2, parentId: cats['marskineliai-ir-polo'].id }
  });

  cats['dzemperiai-parent'] = await prisma.category.create({
    data: { name: 'Džemperiai', slug: 'dzemperiai', sortOrder: 2 }
  });
  cats['megztiniai'] = await prisma.category.create({
    data: { name: 'Megztiniai', slug: 'megztiniai', sortOrder: 1, parentId: cats['dzemperiai-parent'].id }
  });
  cats['su-gobtuvu'] = await prisma.category.create({
    data: { name: 'Su gobtuvu', slug: 'su-gobtuvu', sortOrder: 2, parentId: cats['dzemperiai-parent'].id }
  });

  cats['striukes-parent'] = await prisma.category.create({
    data: { name: 'Striukės ir paltai', slug: 'striukes', sortOrder: 3 }
  });
  cats['liemenes'] = await prisma.category.create({
    data: { name: 'Liemenės', slug: 'liemenes', sortOrder: 1, parentId: cats['striukes-parent'].id }
  });
  cats['striukes-sub'] = await prisma.category.create({
    data: { name: 'Striukės', slug: 'striukes-sub', sortOrder: 2, parentId: cats['striukes-parent'].id }
  });

  cats['kelnes'] = await prisma.category.create({
    data: { name: 'Kelnės', slug: 'kelnes', sortOrder: 4 }
  });

  cats['sportine'] = await prisma.category.create({
    data: { name: 'Sportinė kolekcija', slug: 'sportine-kolekcija', sortOrder: 5 }
  });
  cats['sport-mars'] = await prisma.category.create({
    data: { name: 'Sportiniai marškinėliai', slug: 'sportiniai-marskineliai', sortOrder: 1, parentId: cats['sportine'].id }
  });
  cats['sport-kompl'] = await prisma.category.create({
    data: { name: 'Sportiniai komplektai', slug: 'sportiniai-komplektai', sortOrder: 2, parentId: cats['sportine'].id }
  });

  console.log('✅ Kategorijos sukurtos\n');

  // ============================================
  // PRODUKTAI — su gender, daugiau spalvų, XS/5XL dydžiais
  // ============================================
  const products = [
    // === MARŠKINĖLIAI (MEN) ===
    { name: 'Braco', slug: 'braco', sku: 'CA6550', gender: 'MEN',
      description: 'Trumpomis rankovėmis marškinėliai su šoninėmis siūlėmis. Šukuota medvilnė. 1x1 raštuota apvali apykaklė (4 sluoksniai). 180 g/m².',
      price: 2.85, categoryId: cats['marskineliai'].id,
      colors: [C.WHITE, C.BLACK, C.NAVY, C.RED, C.ROYAL_BLUE, C.TURQUOISE, C.KELLY_GREEN, C.ORANGE, C.YELLOW, C.HEATHER_GREY, C.ROSETTE, C.GARNET, C.CHOCOLATE, C.KHAKI, C.GRASS_GREEN, C.DENIM_BLUE, C.DARK_LEAD],
      sizes: SIZES_XS_5XL },

    { name: 'Atomic 150', slug: 'atomic-150', sku: 'CA6424', gender: 'UNISEX',
      description: 'Trumpomis rankovėmis vamzdiniai marškinėliai. 1x1 raštuota apvali apykaklė. 150 g/m². Ekonomiškas pasirinkimas didelėms grupėms.',
      price: 1.65, categoryId: cats['marskineliai'].id,
      colors: [C.WHITE, C.BLACK, C.NAVY, C.RED, C.ROYAL_BLUE, C.KELLY_GREEN, C.ORANGE, C.YELLOW, C.HEATHER_GREY, C.TURQUOISE, C.ROSETTE, C.SKY_BLUE, C.PURPLE, C.CREAM],
      sizes: SIZES_XS_5XL },

    { name: 'Beagle', slug: 'beagle', sku: 'CA6554', gender: 'UNISEX',
      description: 'Vamzdiniai trumpomis rankovėmis marškinėliai suaugusiems. Su šoninėmis siūlėmis vaikams. 1x1 raštuota apvali apykaklė. 155 g/m².',
      price: 1.85, categoryId: cats['marskineliai'].id,
      colors: [C.WHITE, C.BLACK, C.NAVY, C.RED, C.ROYAL_BLUE, C.TURQUOISE, C.KELLY_GREEN, C.ORANGE, C.YELLOW, C.PURPLE, C.ROSETTE, C.SKY_BLUE, C.CORAL, C.CREAM, C.GRASS_GREEN],
      sizes: SIZES_XS_4XL },

    { name: 'Dogo Premium', slug: 'dogo-premium', sku: 'CA6502', gender: 'MEN',
      description: 'Premium trumpomis rankovėmis marškinėliai su šoninėmis siūlėmis. 1x1 raštuota apvali apykaklė (4 sluoksniai). 180 g/m².',
      price: 3.10, categoryId: cats['marskineliai'].id,
      colors: [C.WHITE, C.BLACK, C.NAVY, C.RED, C.ROYAL_BLUE, C.KELLY_GREEN, C.HEATHER_GREY, C.DENIM_BLUE, C.GARNET, C.WINE, C.ANTHRACITE],
      sizes: SIZES_XS_4XL },

    // === MARŠKINĖLIAI (WOMEN) ===
    { name: 'Jamaica', slug: 'jamaica', sku: 'CA6627', gender: 'WOMEN',
      description: 'Moteriški trumpomis rankovėmis marškinėliai su siaurėjančiu kirpimu. 1x1 raštuota apvali apykaklė. 160 g/m².',
      price: 2.95, categoryId: cats['marskineliai'].id,
      colors: [C.WHITE, C.BLACK, C.NAVY, C.RED, C.ROSETTE, C.TURQUOISE, C.HEATHER_GREY, C.LIGHT_PINK, C.CORAL, C.KELLY_GREEN, C.ROYAL_BLUE, C.SKY_BLUE],
      sizes: SIZES_XS_2XL },

    { name: 'Stafford', slug: 'stafford', sku: 'CA6681', gender: 'MEN',
      description: 'Vamzdiniai trumpomis rankovėmis marškinėliai. 1x1 raštuota apvali apykaklė. 190 g/m². Storesnė medžiaga.',
      price: 2.20, categoryId: cats['marskineliai'].id,
      colors: [C.WHITE, C.BLACK, C.NAVY, C.RED, C.HEATHER_GREY, C.ROYAL_BLUE, C.DARK_LEAD, C.GARNET, C.BOTTLE_GREEN],
      sizes: SIZES_XS_5XL },

    // === POLO (MEN) ===
    { name: 'Pegaso', slug: 'pegaso', sku: 'PO6603', gender: 'MEN',
      description: 'Trumpomis rankovėmis polo marškinėliai su trimis sagomis. Elastinė apykaklė ir rankogaliai. 240 g/m².',
      price: 6.50, categoryId: cats['polo'].id,
      colors: [C.WHITE, C.BLACK, C.NAVY, C.RED, C.ROYAL_BLUE, C.KELLY_GREEN, C.HEATHER_GREY, C.BOTTLE_GREEN, C.WINE, C.DENIM_BLUE, C.DARK_LEAD],
      sizes: SIZES_XS_4XL },

    { name: 'Austral', slug: 'austral', sku: 'PO6632', gender: 'MEN',
      description: 'Trumpomis rankovėmis polo marškinėliai. Dviejų spalvų apykaklė ir sagų juosta. 220 g/m².',
      price: 5.80, categoryId: cats['polo'].id,
      colors: [C.WHITE, C.NAVY, C.RED, C.ROYAL_BLUE, C.BLACK, C.KELLY_GREEN, C.HEATHER_GREY],
      sizes: SIZES_XS_4XL },

    // === DŽEMPERIAI — megztiniai ===
    { name: 'Clasica', slug: 'clasica', sku: 'SU1070', gender: 'UNISEX',
      description: 'Klasikinis džemperis be gobtuvo. Elastinės rankogalių ir apačios juostos. Šukuotas vidinis paviršius. 280 g/m².',
      price: 8.50, categoryId: cats['megztiniai'].id,
      colors: [C.WHITE, C.BLACK, C.NAVY, C.RED, C.ROYAL_BLUE, C.HEATHER_GREY, C.BOTTLE_GREEN, C.GARNET, C.DARK_LEAD, C.KHAKI],
      sizes: SIZES_XS_5XL },

    // === DŽEMPERIAI — su gobtuvu ===
    { name: 'Urban', slug: 'urban', sku: 'SU1067', gender: 'UNISEX',
      description: 'Džemperis su gobtuvu ir kangūros kišene. Elastinės rankogalių ir apačios juostos. 280 g/m².',
      price: 10.90, categoryId: cats['su-gobtuvu'].id,
      colors: [C.BLACK, C.NAVY, C.HEATHER_GREY, C.RED, C.ROYAL_BLUE, C.DARK_LEAD, C.BOTTLE_GREEN, C.GARNET, C.WINE, C.KHAKI, C.CHOCOLATE],
      sizes: SIZES_XS_5XL },

    // === STRIUKĖS ===
    { name: 'Norway', slug: 'norway', sku: 'RA5090', gender: 'MEN',
      description: 'Dviejų spalvų sportinė striukė su kontrastinėmis detalėmis. Gobtuvas su reguliavimu. Vandeniui atsparus audinys.',
      price: 18.90, comparePrice: 24.57, categoryId: cats['striukes-sub'].id,
      colors: [C.NAVY, C.BLACK, C.RED, C.ROYAL_BLUE, C.BOTTLE_GREEN, C.DARK_LEAD],
      sizes: SIZES_XS_4XL },

    // === KELNĖS ===
    { name: 'New Astana', slug: 'new-astana', sku: 'PA1173', gender: 'UNISEX',
      description: 'Sportinės kelnės su elastine juosta ir virvele. Du šoniniai kišenės. Elastiniai kulkšnies rankogaliai. 280 g/m².',
      price: 8.90, categoryId: cats['kelnes'].id,
      colors: [C.BLACK, C.NAVY, C.HEATHER_GREY, C.DARK_LEAD, C.RED],
      sizes: SIZES_XS_5XL },

    { name: 'Coria', slug: 'coria', sku: 'PA0317', gender: 'UNISEX',
      description: 'Trumpos sportinės kelnės (šortai) su elastine juosta ir virvele. Lengvas audinys. 155 g/m².',
      price: 5.50, categoryId: cats['kelnes'].id,
      colors: [C.BLACK, C.NAVY, C.RED, C.ROYAL_BLUE, C.WHITE, C.HEATHER_GREY],
      sizes: SIZES_XS_4XL },

    // === SPORTINĖ KOLEKCIJA ===
    { name: 'Montecarlo', slug: 'montecarlo', sku: 'CA0423', gender: 'MEN',
      description: 'Techniniai sportiniai marškinėliai. Greitai džiūstantis audinys. Raglan tipo rankovės. Prailginta nugara. 140 g/m².',
      price: 3.20, categoryId: cats['sport-mars'].id,
      colors: [C.WHITE, C.BLACK, C.NAVY, C.RED, C.ROYAL_BLUE, C.TURQUOISE, C.YELLOW, C.ORANGE, C.KELLY_GREEN, C.CORAL, C.GRASS_GREEN],
      sizes: SIZES_XS_4XL },

    { name: 'Bahrain', slug: 'bahrain', sku: 'CA0407', gender: 'MEN',
      description: 'Techniniai sportiniai marškinėliai su raglan tipo rankovėmis. Control Dry technologija. 135 g/m².',
      price: 3.90, categoryId: cats['sport-mars'].id,
      colors: [C.WHITE, C.BLACK, C.NAVY, C.RED, C.ROYAL_BLUE, C.KELLY_GREEN, C.ROSETTE, C.TURQUOISE, C.ORANGE, C.YELLOW, C.CORAL],
      sizes: SIZES_XS_4XL },
  ];

  let count = 0;
  for (const p of products) {
    const variants = [];
    for (const color of p.colors) {
      for (const size of p.sizes) {
        variants.push({
          color: color.name,
          colorHex: color.hex,
          size,
          stock: Math.floor(Math.random() * 200) + 20
        });
      }
    }
    await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        sku: p.sku,
        description: p.description,
        price: p.price,
        comparePrice: p.comparePrice || (Math.random() > 0.7 ? +(p.price * 1.3).toFixed(2) : null),
        published: true,
        gender: p.gender,
        categoryId: p.categoryId,
        variants: { create: variants },
      },
    });
    count++;
    console.log(`  👕 ${p.name} (${p.sku}) — ${p.gender} — ${p.colors.length} spalvų — ${p.sizes.length} dydžių`);
  }

  console.log(`\n✅ Produktai: ${count}`);
  console.log('🎉 Duomenys sėkmingai sukurti!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

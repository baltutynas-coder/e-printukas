// ============================================
// DB Seed — Roly.eu stiliaus produktai
// ============================================
// Paleidimas: npm run db:seed
// ============================================

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

// Roly.eu spalvų paletė (tikri HEX kodai)
const COLORS = {
  WHITE: { name: 'Balta', hex: '#FFFFFF' },
  BLACK: { name: 'Juoda', hex: '#000000' },
  NAVY: { name: 'Tamsiai mėlyna', hex: '#001D43' },
  RED: { name: 'Raudona', hex: '#DC002E' },
  ROYAL_BLUE: { name: 'Karališka mėlyna', hex: '#0060A9' },
  SKY_BLUE: { name: 'Dangaus mėlyna', hex: '#C4DDF1' },
  TURQUOISE: { name: 'Turkio', hex: '#00A0D1' },
  KELLY_GREEN: { name: 'Žalia', hex: '#008F4F' },
  BOTTLE_GREEN: { name: 'Butelio žalia', hex: '#004237' },
  GRASS_GREEN: { name: 'Žolės žalia', hex: '#51A025' },
  ORANGE: { name: 'Oranžinė', hex: '#F08927' },
  YELLOW: { name: 'Geltona', hex: '#FFE400' },
  HEATHER_GREY: { name: 'Pilka', hex: '#C4C4C4' },
  DARK_LEAD: { name: 'Tamsiai pilka', hex: '#484E41' },
  ROSETTE: { name: 'Rožinė', hex: '#DC006B' },
  LIGHT_PINK: { name: 'Šviesiai rožinė', hex: '#F8CCD5' },
  PURPLE: { name: 'Violetinė', hex: '#750D68' },
  GARNET: { name: 'Granato', hex: '#8C1713' },
  CHOCOLATE: { name: 'Šokoladinė', hex: '#573D2A' },
  DENIM_BLUE: { name: 'Džinso mėlyna', hex: '#4C6781' },
};

// Dydžiai
const ADULT_SIZES = ['S', 'M', 'L', 'XL', '2XL'];
const KIDS_SIZES = ['3/4', '5/6', '7/8', '9/10', '11/12'];
const ALL_SIZES = [...ADULT_SIZES, '3XL', '4XL'];
const SHOE_SIZES = ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];

async function main() {
  console.log('🌱 Sėjame Roly.eu stiliaus duomenis...');
  console.log('🗑️  Valome senus duomenis...');

  // Išvalyti senus duomenis
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  // 1. Admin vartotojas
  const hashedPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@eprintukas.lt' },
    update: {},
    create: {
      email: 'admin@eprintukas.lt',
      password: hashedPassword,
      name: 'Administratorius',
      role: 'ADMIN'
    }
  });
  console.log('✅ Admin:', admin.email);

  // 2. Kategorijos (Roly.eu struktūra)
  const categories = {};
  const catData = [
    { name: 'Marškinėliai', slug: 'marskineliai', sortOrder: 1 },
    { name: 'Polo marškinėliai', slug: 'polo-marskineliai', sortOrder: 2 },
    { name: 'Džemperiai', slug: 'dzemperiai', sortOrder: 3 },
    { name: 'Striukės ir paltai', slug: 'striukes', sortOrder: 4 },
    { name: 'Kelnės', slug: 'kelnes', sortOrder: 5 },
    { name: 'Sportinė apranga', slug: 'sportine-apranga', sortOrder: 6 },
    { name: 'Darbo drabužiai', slug: 'darbo-drabuziai', sortOrder: 7 },
    { name: 'Aksesuarai', slug: 'aksesuarai', sortOrder: 8 },
  ];

  for (const cat of catData) {
    categories[cat.slug] = await prisma.category.create({ data: cat });
  }
  console.log(`✅ Kategorijos: ${catData.length}`);

  // 3. Produktai (Roly.eu asortimentas)
  const products = [
    // ── MARŠKINĖLIAI ──────────────────
    {
      name: 'Braco',
      slug: 'braco',
      sku: 'CA6550',
      description: 'Trumpomis rankovėmis marškinėliai su šoninėmis siūlėmis. Šukuota medvilnė. 1x1 raštuota apvali apykaklė (4 sluoksniai). 180 g/m².',
      price: 2.85,
      categorySlug: 'marskineliai',
      colors: [COLORS.WHITE, COLORS.BLACK, COLORS.NAVY, COLORS.RED, COLORS.ROYAL_BLUE, COLORS.TURQUOISE, COLORS.KELLY_GREEN, COLORS.ORANGE, COLORS.YELLOW, COLORS.HEATHER_GREY, COLORS.ROSETTE],
      sizes: ADULT_SIZES,
    },
    {
      name: 'Atomic 150',
      slug: 'atomic-150',
      sku: 'CA6424',
      description: 'Trumpomis rankovėmis vamzdiniai marškinėliai. 1x1 raštuota apvali apykaklė. 150 g/m². Ekonomiškas pasirinkimas.',
      price: 1.65,
      categorySlug: 'marskineliai',
      colors: [COLORS.WHITE, COLORS.BLACK, COLORS.NAVY, COLORS.RED, COLORS.ROYAL_BLUE, COLORS.KELLY_GREEN, COLORS.ORANGE, COLORS.YELLOW, COLORS.HEATHER_GREY],
      sizes: ADULT_SIZES,
    },
    {
      name: 'Beagle',
      slug: 'beagle',
      sku: 'CA6554',
      description: 'Vamzdiniai trumpomis rankovėmis marškinėliai suaugusiems ir vaikams. 1x1 raštuota apvali apykaklė. 155 g/m².',
      price: 1.85,
      categorySlug: 'marskineliai',
      colors: [COLORS.WHITE, COLORS.BLACK, COLORS.NAVY, COLORS.RED, COLORS.ROYAL_BLUE, COLORS.TURQUOISE, COLORS.KELLY_GREEN, COLORS.ORANGE, COLORS.YELLOW, COLORS.PURPLE, COLORS.ROSETTE, COLORS.SKY_BLUE],
      sizes: [...ADULT_SIZES, ...KIDS_SIZES],
    },
    {
      name: 'Dogo Premium',
      slug: 'dogo-premium',
      sku: 'CA6502',
      description: 'Premium trumpomis rankovėmis marškinėliai su šoninėmis siūlėmis. 1x1 raštuota apvali apykaklė (4 sluoksniai). 180 g/m².',
      price: 3.10,
      categorySlug: 'marskineliai',
      colors: [COLORS.WHITE, COLORS.BLACK, COLORS.NAVY, COLORS.RED, COLORS.ROYAL_BLUE, COLORS.KELLY_GREEN, COLORS.HEATHER_GREY, COLORS.DENIM_BLUE],
      sizes: ADULT_SIZES,
    },
    {
      name: 'Jamaica',
      slug: 'jamaica',
      sku: 'CA6627',
      description: 'Moteriški trumpomis rankovėmis marškinėliai su siaurėjančiu kirpimu. 1x1 raštuota apvali apykaklė. 160 g/m².',
      price: 2.95,
      categorySlug: 'marskineliai',
      colors: [COLORS.WHITE, COLORS.BLACK, COLORS.NAVY, COLORS.RED, COLORS.ROSETTE, COLORS.TURQUOISE, COLORS.HEATHER_GREY, COLORS.LIGHT_PINK],
      sizes: ['S', 'M', 'L', 'XL', '2XL'],
    },
    {
      name: 'Stafford',
      slug: 'stafford',
      sku: 'CA6681',
      description: 'Vamzdiniai trumpomis rankovėmis marškinėliai. 1x1 raštuota apvali apykaklė. 190 g/m². Storesnė medžiaga.',
      price: 2.20,
      categorySlug: 'marskineliai',
      colors: [COLORS.WHITE, COLORS.BLACK, COLORS.NAVY, COLORS.RED, COLORS.HEATHER_GREY],
      sizes: ADULT_SIZES,
    },

    // ── POLO MARŠKINĖLIAI ──────────────
    {
      name: 'Pegaso',
      slug: 'pegaso',
      sku: 'PO6603',
      description: 'Trumpomis rankovėmis polo marškinėliai su trimis sagomis. 100% medvilnė piqué, 240 g/m². Klasikinis kirpimas.',
      price: 6.50,
      categorySlug: 'polo-marskineliai',
      colors: [COLORS.WHITE, COLORS.BLACK, COLORS.NAVY, COLORS.RED, COLORS.ROYAL_BLUE, COLORS.KELLY_GREEN, COLORS.HEATHER_GREY, COLORS.BOTTLE_GREEN],
      sizes: ADULT_SIZES,
    },
    {
      name: 'Star',
      slug: 'star',
      sku: 'PO6614',
      description: 'Moteriški trumpomis rankovėmis polo marškinėliai su trimis sagomis. Moteriško kirpimo. 100% medvilnė piqué, 240 g/m².',
      price: 6.90,
      categorySlug: 'polo-marskineliai',
      colors: [COLORS.WHITE, COLORS.BLACK, COLORS.NAVY, COLORS.RED, COLORS.ROSETTE, COLORS.HEATHER_GREY],
      sizes: ['S', 'M', 'L', 'XL', '2XL'],
    },
    {
      name: 'Austral',
      slug: 'austral',
      sku: 'PO6632',
      description: 'Trumpomis rankovėmis polo marškinėliai su trimis sagomis. Dviejų spalvų apykaklė. 100% medvilnė piqué, 220 g/m².',
      price: 5.80,
      categorySlug: 'polo-marskineliai',
      colors: [COLORS.WHITE, COLORS.NAVY, COLORS.RED, COLORS.ROYAL_BLUE, COLORS.BLACK],
      sizes: ADULT_SIZES,
    },

    // ── DŽEMPERIAI ──────────────────────
    {
      name: 'Clasica',
      slug: 'clasica',
      sku: 'SU1070',
      description: 'Klasikinis džemperis be gobtuvo. Elastinės rankogalių ir apačios juostos. Šukuota medvilnė, 280 g/m².',
      price: 8.50,
      categorySlug: 'dzemperiai',
      colors: [COLORS.WHITE, COLORS.BLACK, COLORS.NAVY, COLORS.RED, COLORS.ROYAL_BLUE, COLORS.HEATHER_GREY],
      sizes: ALL_SIZES,
    },
    {
      name: 'Urban',
      slug: 'urban',
      sku: 'SU1067',
      description: 'Džemperis su gobtuvu ir kišenėmis. Reguliuojamas gobtuvas su virvele. Kangūros kišenė. 280 g/m².',
      price: 10.90,
      categorySlug: 'dzemperiai',
      colors: [COLORS.BLACK, COLORS.NAVY, COLORS.HEATHER_GREY, COLORS.RED, COLORS.ROYAL_BLUE, COLORS.DARK_LEAD],
      sizes: ALL_SIZES,
    },
    {
      name: 'Capucha',
      slug: 'capucha',
      sku: 'SU1024',
      description: 'Užsegamas džemperis su gobtuvu ir dviem kišenėmis. Pilnas užtrauktukas. 280 g/m². Medvilnė/poliesteris.',
      price: 12.50,
      categorySlug: 'dzemperiai',
      colors: [COLORS.BLACK, COLORS.NAVY, COLORS.HEATHER_GREY, COLORS.RED],
      sizes: ALL_SIZES,
    },

    // ── STRIUKĖS IR PALTAI ─────────────
    {
      name: 'Alaska',
      slug: 'alaska',
      sku: 'PK5106',
      description: 'Šilta žieminė parka su gobtuvu ir kailiniu pamušalu. Dviejų krypčių užtrauktukas. Atspari vandeniui.',
      price: 28.50,
      categorySlug: 'striukes',
      colors: [COLORS.BLACK, COLORS.NAVY, COLORS.DARK_LEAD],
      sizes: ADULT_SIZES,
    },
    {
      name: 'Norway',
      slug: 'norway',
      sku: 'RA5090',
      description: 'Dviejų spalvų sportinė striukė su kontrastinėmis detalėmis. Gobtuvas su reguliavimu. Vandeniui atsparus audinys.',
      price: 18.90,
      categorySlug: 'striukes',
      colors: [COLORS.NAVY, COLORS.BLACK, COLORS.RED, COLORS.ROYAL_BLUE],
      sizes: ADULT_SIZES,
    },
    {
      name: 'Bellagio',
      slug: 'bellagio',
      sku: 'RA5099',
      description: 'Lengva neperšlampama liemenė su šoninėmis kišenėmis. Užtrauktukas su apsauga. Tinka pavasariui ir rudeniui.',
      price: 12.50,
      categorySlug: 'striukes',
      colors: [COLORS.BLACK, COLORS.NAVY, COLORS.RED, COLORS.HEATHER_GREY],
      sizes: ADULT_SIZES,
    },

    // ── KELNĖS ──────────────────────────
    {
      name: 'New Astana',
      slug: 'new-astana',
      sku: 'PA1173',
      description: 'Sportinės kelnės su elastine juosta ir virvele. Dvi šoninės kišenės. Apatinė dalis su elastine juosta. 280 g/m².',
      price: 8.90,
      categorySlug: 'kelnes',
      colors: [COLORS.BLACK, COLORS.NAVY, COLORS.HEATHER_GREY],
      sizes: ALL_SIZES,
    },
    {
      name: 'Coria',
      slug: 'coria',
      sku: 'PA0317',
      description: 'Trumpos sportinės kelnės (šortai) su elastine juosta ir virvele. Dvi šoninės kišenės. 155 g/m².',
      price: 5.50,
      categorySlug: 'kelnes',
      colors: [COLORS.BLACK, COLORS.NAVY, COLORS.RED, COLORS.ROYAL_BLUE, COLORS.WHITE],
      sizes: ADULT_SIZES,
    },

    // ── SPORTINĖ APRANGA ───────────────
    {
      name: 'Montecarlo',
      slug: 'montecarlo',
      sku: 'CA0423',
      description: 'Techniniai sportiniai marškinėliai. Greitai džiūstantis audinys. Raglan tipo rankovės. 140 g/m². 100% poliesteris.',
      price: 3.20,
      categorySlug: 'sportine-apranga',
      colors: [COLORS.WHITE, COLORS.BLACK, COLORS.NAVY, COLORS.RED, COLORS.ROYAL_BLUE, COLORS.TURQUOISE, COLORS.YELLOW, COLORS.ORANGE, COLORS.KELLY_GREEN],
      sizes: ADULT_SIZES,
    },
    {
      name: 'Bahrain',
      slug: 'bahrain',
      sku: 'CA0407',
      description: 'Techniniai sportiniai marškinėliai su raglan tipo rankovėmis. Kvėpuojantis audinys. 135 g/m². 100% poliesteris.',
      price: 3.90,
      categorySlug: 'sportine-apranga',
      colors: [COLORS.WHITE, COLORS.BLACK, COLORS.NAVY, COLORS.RED, COLORS.ROYAL_BLUE, COLORS.KELLY_GREEN, COLORS.ROSETTE],
      sizes: ADULT_SIZES,
    },
    {
      name: 'Detroit',
      slug: 'detroit',
      sku: 'CA0652',
      description: 'Sportinis komplektas: marškinėliai + šortai. Kontrastinės detalės. Kvėpuojantis audinys.',
      price: 9.50,
      categorySlug: 'sportine-apranga',
      colors: [COLORS.WHITE, COLORS.BLACK, COLORS.NAVY, COLORS.RED, COLORS.ROYAL_BLUE],
      sizes: ADULT_SIZES,
    },

    // ── DARBO DRABUŽIAI ────────────────
    {
      name: 'Ritz',
      slug: 'ritz',
      sku: 'CM5593',
      description: 'Vyriški marškiniai ilgomis rankovėmis. Klasikinis kirpimas su apykakle. Tinka darbui ir oficialiam renginiui. 130 g/m².',
      price: 11.50,
      categorySlug: 'darbo-drabuziai',
      colors: [COLORS.WHITE, COLORS.SKY_BLUE, COLORS.BLACK, COLORS.NAVY],
      sizes: ADULT_SIZES,
    },
    {
      name: 'Vesta',
      slug: 'vesta',
      sku: 'CM5558',
      description: 'Moteriški marškiniai ilgomis rankovėmis. Moteriško kirpimo. Tinka darbui ir oficialiam renginiui. 130 g/m².',
      price: 11.50,
      categorySlug: 'darbo-drabuziai',
      colors: [COLORS.WHITE, COLORS.SKY_BLUE, COLORS.BLACK],
      sizes: ['S', 'M', 'L', 'XL', '2XL'],
    },

    // ── AKSESUARAI ─────────────────────
    {
      name: 'Orion',
      slug: 'orion',
      sku: 'BO7109',
      description: 'Sportinė kuprinė su paminkštintomis petnešomis. Pagrindinis skyrius su užtrauktuku. Priekinė kišenė.',
      price: 4.90,
      categorySlug: 'aksesuarai',
      colors: [COLORS.BLACK, COLORS.NAVY, COLORS.RED, COLORS.ROYAL_BLUE, COLORS.HEATHER_GREY],
      sizes: ['Universalus'],
    },
    {
      name: 'Evia',
      slug: 'evia',
      sku: 'BO7112',
      description: 'Lengvas sportinis krepšys su reguliuojama petnešu. Pagrindinis skyrius su užtrauktuku. Šoninė kišenė.',
      price: 3.90,
      categorySlug: 'aksesuarai',
      colors: [COLORS.BLACK, COLORS.NAVY, COLORS.RED, COLORS.TURQUOISE],
      sizes: ['Universalus'],
    },
  ];

  let productCount = 0;
  for (const p of products) {
    const category = categories[p.categorySlug];

    // Sukurti variantus (kiekviena spalva × kiekvienas dydis)
    const variants = [];
    for (const color of p.colors) {
      for (const size of p.sizes) {
        variants.push({
          color: color.name,
          colorHex: color.hex,
          size,
          stock: Math.floor(Math.random() * 200) + 20, // 20-220 vnt sandėlyje
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
        comparePrice: Math.random() > 0.7 ? +(p.price * 1.3).toFixed(2) : null, // 30% produktų turi senąją kainą
        published: true,
        categoryId: category.id,
        variants: { create: variants },
      },
    });
    productCount++;
    console.log(`  👕 ${p.name} (${p.sku}) — ${variants.length} variantų`);
  }

  console.log(`\n✅ Produktai: ${productCount}`);
  console.log(`\n🎉 Duomenys sėkmingai sukurti!`);
  console.log('📧 Admin: admin@eprintukas.lt / admin123');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

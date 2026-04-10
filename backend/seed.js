// ============================================
// DB Seed — pradiniai duomenys testavimui
// ============================================
// Paleidimas: npm run db:seed
// ============================================

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Sėjame duomenis...');

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

  // 2. Kategorijos (kaip roly.eu)
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'marskineliai' },
      update: {},
      create: { name: 'Marškinėliai', slug: 'marskineliai', sortOrder: 1 }
    }),
    prisma.category.upsert({
      where: { slug: 'polo-marskineliai' },
      update: {},
      create: { name: 'Polo marškinėliai', slug: 'polo-marskineliai', sortOrder: 2 }
    }),
    prisma.category.upsert({
      where: { slug: 'dzemperiai' },
      update: {},
      create: { name: 'Džemperiai', slug: 'dzemperiai', sortOrder: 3 }
    }),
    prisma.category.upsert({
      where: { slug: 'striukes' },
      update: {},
      create: { name: 'Striukės', slug: 'striukes', sortOrder: 4 }
    }),
    prisma.category.upsert({
      where: { slug: 'kelnes' },
      update: {},
      create: { name: 'Kelnės', slug: 'kelnes', sortOrder: 5 }
    }),
    prisma.category.upsert({
      where: { slug: 'sportine-apranga' },
      update: {},
      create: { name: 'Sportinė apranga', slug: 'sportine-apranga', sortOrder: 6 }
    })
  ]);
  console.log(`✅ Kategorijos: ${categories.length}`);

  // 3. Pavyzdiniai produktai
  const products = [
    {
      name: 'Braco vyriški marškinėliai',
      slug: 'braco-vyriski-marskineliai',
      description: 'Aukštos kokybės medvilniniai marškinėliai. 100% medvilnė, 180 g/m².',
      price: 3.50,
      comparePrice: 4.99,
      published: true,
      categoryId: categories[0].id,
      variants: {
        create: [
          { color: 'Balta', colorHex: '#FFFFFF', size: 'S', stock: 100 },
          { color: 'Balta', colorHex: '#FFFFFF', size: 'M', stock: 150 },
          { color: 'Balta', colorHex: '#FFFFFF', size: 'L', stock: 120 },
          { color: 'Juoda', colorHex: '#000000', size: 'S', stock: 80 },
          { color: 'Juoda', colorHex: '#000000', size: 'M', stock: 200 },
          { color: 'Juoda', colorHex: '#000000', size: 'L', stock: 160 },
          { color: 'Raudona', colorHex: '#E53E3E', size: 'M', stock: 50 },
          { color: 'Mėlyna', colorHex: '#3182CE', size: 'M', stock: 75 }
        ]
      }
    },
    {
      name: 'Star moteriški marškinėliai',
      slug: 'star-moteriski-marskineliai',
      description: 'Moteriški marškinėliai su siaurėjančiu kirpimu. 100% medvilnė, 155 g/m².',
      price: 3.20,
      published: true,
      categoryId: categories[0].id,
      variants: {
        create: [
          { color: 'Balta', colorHex: '#FFFFFF', size: 'S', stock: 90 },
          { color: 'Balta', colorHex: '#FFFFFF', size: 'M', stock: 110 },
          { color: 'Rožinė', colorHex: '#ED64A6', size: 'S', stock: 60 },
          { color: 'Rožinė', colorHex: '#ED64A6', size: 'M', stock: 70 }
        ]
      }
    },
    {
      name: 'Pegaso polo marškinėliai',
      slug: 'pegaso-polo-marskineliai',
      description: 'Klasikiniai polo marškinėliai su trimis sagomis. 100% medvilnė piqué, 240 g/m².',
      price: 7.90,
      published: true,
      categoryId: categories[1].id,
      variants: {
        create: [
          { color: 'Tamsiai mėlyna', colorHex: '#1A365D', size: 'M', stock: 40 },
          { color: 'Tamsiai mėlyna', colorHex: '#1A365D', size: 'L', stock: 55 },
          { color: 'Balta', colorHex: '#FFFFFF', size: 'L', stock: 45 }
        ]
      }
    }
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: p
    });
  }
  console.log(`✅ Produktai: ${products.length}`);

  console.log('\n🎉 Duomenys sėkmingai sukurti!');
  console.log('📧 Admin prisijungimas: admin@eprintukas.lt / admin123');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

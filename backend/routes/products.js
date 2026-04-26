// ============================================
// Produktų maršrutai
// ============================================
//
// Sprint B atnaujinimai:
//   - Pridėtas ?tag=verslo-dovanos,horeca filtras (galima keli tag'ai)
//   - Įtraukti tags į response (matomi priskirti tag'ai)
//   - POST/PUT priima tagIds: string[] — keičia ProductTag jungtis
//   - PUT atveju: senos jungtys ištrinamos, naujos sukuriamos (replace)

const router = require('express').Router();
const prisma = require('../config/db');
const { auth } = require('../middleware/auth');

// GET /api/products — produktų sąrašas
router.get('/', async (req, res) => {
  try {
    const {
      category,
      tag, // SPRINT B: naujas filtras (gali būti CSV: "tag1,tag2")
      search,
      minPrice,
      maxPrice,
      gender,
      supplier, // SPRINT B: ROLY arba STAMINA filtras
      sort = 'newest',
      page = 1,
      limit = 12,
    } = req.query;

    const where = { published: true };

    // Kategorijos filtravimas — palaiko ir pagrindinę ir subkategoriją
    if (category) {
      const cat = await prisma.category.findFirst({
        where: { slug: category },
        include: { children: { select: { id: true } } },
      });
      if (cat) {
        if (cat.children && cat.children.length > 0) {
          const childIds = cat.children.map((c) => c.id);
          where.categoryId = { in: [...childIds, cat.id] };
        } else {
          where.categoryId = cat.id;
        }
      }
    }

    // SPRINT B — Tag'ų filtravimas (CSV: "verslo-dovanos,horeca")
    if (tag) {
      const tagSlugs = String(tag)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      if (tagSlugs.length > 0) {
        where.tags = {
          some: {
            tag: {
              slug: { in: tagSlugs },
            },
          },
        };
      }
    }

    // SPRINT B — Tiekėjo filtravimas
    if (supplier && ['ROLY', 'STAMINA'].includes(supplier.toUpperCase())) {
      where.supplier = supplier.toUpperCase();
    }

    // Gender filtras
    if (gender) {
      where.gender = gender.toUpperCase();
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    const orderBy =
      {
        newest: { createdAt: 'desc' },
        oldest: { createdAt: 'asc' },
        price_asc: { price: 'asc' },
        price_desc: { price: 'desc' },
        name: { name: 'asc' },
      }[sort] || { createdAt: 'desc' };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          images: { orderBy: { sortOrder: 'asc' }, take: 1 },
          category: { select: { name: true, slug: true } },
          variants: {
            select: { color: true, colorHex: true, size: true, stock: true },
          },
          // SPRINT B: tag'ai
          tags: {
            include: {
              tag: {
                select: { id: true, slug: true, name: true, type: true },
              },
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    // Transformuojam ProductTag[] į Tag[] (švaresnis API response)
    const transformedProducts = products.map((p) => ({
      ...p,
      tags: p.tags.map((pt) => pt.tag),
    }));

    res.json({
      products: transformedProducts,
      pagination: {
        page: parseInt(page),
        limit: take,
        total,
        pages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    console.error('Products list error:', error);
    res.status(500).json({ error: 'Serverio klaida' });
  }
});

// GET /api/products/:slug — vienas produktas
router.get('/:slug', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: req.params.slug },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        category: true,
        variants: true,
        tags: {
          include: {
            tag: {
              select: { id: true, slug: true, name: true, type: true },
            },
          },
        },
      },
    });

    if (!product || !product.published) {
      return res.status(404).json({ error: 'Produktas nerastas' });
    }

    // Transformuojam tag'us
    const transformed = {
      ...product,
      tags: product.tags.map((pt) => pt.tag),
    };

    res.json({ product: transformed });
  } catch (error) {
    console.error('Product detail error:', error);
    res.status(500).json({ error: 'Serverio klaida' });
  }
});

// POST /api/products — sukurti produktą
router.post('/', auth, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      comparePrice,
      sku,
      categoryId,
      published,
      gender,
      supplier, // SPRINT B
      tagIds, // SPRINT B
      images,
      variants,
    } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: 'Pavadinimas ir kaina privalomi' });
    }

    const slug = name
      .toLowerCase()
      .replace(/[ąčęėįšųūž]/g, (c) =>
        'aceeisuuz'['ąčęėįšųūž'.indexOf(c)]
      )
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const existing = await prisma.product.findUnique({ where: { slug } });
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

    const product = await prisma.product.create({
      data: {
        name,
        slug: finalSlug,
        description,
        price: parseFloat(price),
        comparePrice: comparePrice ? parseFloat(comparePrice) : null,
        sku,
        categoryId,
        published: published || false,
        gender: gender || 'UNISEX',
        supplier: supplier || 'ROLY', // SPRINT B
        images: images
          ? {
              create: images.map((img, i) => ({
                url: img.url,
                alt: img.alt,
                sortOrder: i,
              })),
            }
          : undefined,
        variants: variants ? { create: variants } : undefined,
        // SPRINT B: tag'ų jungtys
        tags:
          tagIds && Array.isArray(tagIds) && tagIds.length > 0
            ? {
                create: tagIds.map((tagId) => ({ tagId })),
              }
            : undefined,
      },
      include: {
        images: true,
        variants: true,
        category: true,
        tags: { include: { tag: true } },
      },
    });

    res.status(201).json({ message: 'Produktas sukurtas', product });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Serverio klaida' });
  }
});

// PUT /api/products/:id — redaguoti produktą
router.put('/:id', auth, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      comparePrice,
      sku,
      categoryId,
      published,
      gender,
      supplier, // SPRINT B
      tagIds, // SPRINT B
    } = req.body;

    // Pirma — atnaujiname pagrindinius laukus
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(price && { price: parseFloat(price) }),
        ...(comparePrice !== undefined && {
          comparePrice: comparePrice ? parseFloat(comparePrice) : null,
        }),
        ...(sku !== undefined && { sku }),
        ...(categoryId !== undefined && { categoryId }),
        ...(published !== undefined && { published }),
        ...(gender !== undefined && { gender }),
        ...(supplier !== undefined && { supplier }),
      },
    });

    // SPRINT B — Tag'ų jungčių valdymas (jei tagIds pateiktas)
    if (tagIds !== undefined && Array.isArray(tagIds)) {
      // 1. Ištrinti visas senas jungtis
      await prisma.productTag.deleteMany({
        where: { productId: req.params.id },
      });

      // 2. Sukurti naujas jungtis
      if (tagIds.length > 0) {
        await prisma.productTag.createMany({
          data: tagIds.map((tagId) => ({
            productId: req.params.id,
            tagId,
          })),
        });
      }
    }

    // Grąžiname produkto atnaujintą versiją su tag'ais
    const updated = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        images: true,
        variants: true,
        category: true,
        tags: { include: { tag: true } },
      },
    });

    res.json({ message: 'Produktas atnaujintas', product: updated });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Serverio klaida' });
  }
});

// DELETE /api/products/:id — ištrinti produktą
router.delete('/:id', auth, async (req, res) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ message: 'Produktas ištrintas' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Serverio klaida' });
  }
});

module.exports = router;

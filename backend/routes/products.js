// ============================================
// Produktų maršrutai
// ============================================
const router = require('express').Router();
const prisma = require('../config/db');
const { auth } = require('../middleware/auth');

// GET /api/products — produktų sąrašas
router.get('/', async (req, res) => {
  try {
    const {
      category, search, minPrice, maxPrice, gender,
      sort = 'newest', page = 1, limit = 12
    } = req.query;

    const where = { published: true };

    // Kategorijos filtravimas — palaiko ir pagrindinę ir subkategoriją
    if (category) {
      const cat = await prisma.category.findFirst({
        where: { slug: category },
        include: { children: { select: { id: true } } }
      });
      if (cat) {
        if (cat.children && cat.children.length > 0) {
          const childIds = cat.children.map(c => c.id);
          where.categoryId = { in: [...childIds, cat.id] };
        } else {
          where.categoryId = cat.id;
        }
      }
    }

    // Gender filtras
    if (gender) {
      where.gender = gender.toUpperCase();
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    const orderBy = {
      newest: { createdAt: 'desc' },
      oldest: { createdAt: 'asc' },
      price_asc: { price: 'asc' },
      price_desc: { price: 'desc' },
      name: { name: 'asc' }
    }[sort] || { createdAt: 'desc' };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where, orderBy, skip, take,
        include: {
          images: { orderBy: { sortOrder: 'asc' }, take: 1 },
          category: { select: { name: true, slug: true } },
          variants: { select: { color: true, colorHex: true, size: true, stock: true } }
        }
      }),
      prisma.product.count({ where })
    ]);

    res.json({
      products,
      pagination: { page: parseInt(page), limit: take, total, pages: Math.ceil(total / take) }
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
        variants: true
      }
    });
    if (!product || !product.published) {
      return res.status(404).json({ error: 'Produktas nerastas' });
    }
    res.json({ product });
  } catch (error) {
    console.error('Product detail error:', error);
    res.status(500).json({ error: 'Serverio klaida' });
  }
});

// POST /api/products — sukurti produktą
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, price, comparePrice, sku, categoryId, published, gender, images, variants } = req.body;
    if (!name || !price) {
      return res.status(400).json({ error: 'Pavadinimas ir kaina privalomi' });
    }
    const slug = name
      .toLowerCase()
      .replace(/[ąčęėįšųūž]/g, c => 'aceeisuuz'['ąčęėįšųūž'.indexOf(c)])
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const existing = await prisma.product.findUnique({ where: { slug } });
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;
    const product = await prisma.product.create({
      data: {
        name, slug: finalSlug, description,
        price: parseFloat(price),
        comparePrice: comparePrice ? parseFloat(comparePrice) : null,
        sku, categoryId, published: published || false,
        gender: gender || 'UNISEX',
        images: images ? { create: images.map((img, i) => ({ url: img.url, alt: img.alt, sortOrder: i })) } : undefined,
        variants: variants ? { create: variants } : undefined
      },
      include: { images: true, variants: true, category: true }
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
    const { name, description, price, comparePrice, sku, categoryId, published, gender } = req.body;
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(price && { price: parseFloat(price) }),
        ...(comparePrice !== undefined && { comparePrice: comparePrice ? parseFloat(comparePrice) : null }),
        ...(sku !== undefined && { sku }),
        ...(categoryId !== undefined && { categoryId }),
        ...(published !== undefined && { published }),
        ...(gender !== undefined && { gender }),
      },
      include: { images: true, variants: true, category: true }
    });
    res.json({ message: 'Produktas atnaujintas', product });
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

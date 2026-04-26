// ============================================
// Tag'ų maršrutai (OCCASION + INDUSTRY)
// ============================================
//
// Sprint B
//
// Endpoint'ai:
//   GET    /api/tags                — visi tag'ai (filtras: ?type=OCCASION|INDUSTRY)
//   GET    /api/tags/:slug          — vienas tag + jo produktai
//   POST   /api/tags                — sukurti (admin)
//   PUT    /api/tags/:id            — redaguoti (admin)
//   DELETE /api/tags/:id            — ištrinti (admin)
//
// Pavyzdžiai:
//   GET /api/tags                   — visi 12 tag'ų
//   GET /api/tags?type=OCCASION     — 6 progos
//   GET /api/tags?type=INDUSTRY     — 6 pramonės
//   GET /api/tags/verslo-dovanos    — vienas tag + susijusių produktų sąrašas

const router = require('express').Router();
const prisma = require('../config/db');
const { auth } = require('../middleware/auth');

// GET /api/tags — visi tag'ai
router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    const where = {};

    if (type && ['OCCASION', 'INDUSTRY'].includes(type.toUpperCase())) {
      where.type = type.toUpperCase();
    }

    const tags = await prisma.tag.findMany({
      where,
      orderBy: [{ type: 'asc' }, { sortOrder: 'asc' }],
      include: {
        _count: { select: { products: true } },
      },
    });

    res.json({ tags });
  } catch (error) {
    console.error('Tags list error:', error);
    res.status(500).json({ error: 'Serverio klaida' });
  }
});

// GET /api/tags/:slug — vienas tag + jo produktai
router.get('/:slug', async (req, res) => {
  try {
    const tag = await prisma.tag.findUnique({
      where: { slug: req.params.slug },
      include: {
        products: {
          include: {
            product: {
              include: {
                images: { orderBy: { sortOrder: 'asc' }, take: 1 },
                category: { select: { name: true, slug: true } },
                variants: {
                  select: {
                    color: true,
                    colorHex: true,
                    size: true,
                    stock: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!tag) {
      return res.status(404).json({ error: "Tag'as nerastas" });
    }

    // Iš ProductTag → Product (tik published)
    const products = tag.products
      .map((pt) => pt.product)
      .filter((p) => p.published);

    res.json({
      tag: {
        id: tag.id,
        slug: tag.slug,
        name: tag.name,
        type: tag.type,
        description: tag.description,
        heroText: tag.heroText,
      },
      products,
      total: products.length,
    });
  } catch (error) {
    console.error('Tag detail error:', error);
    res.status(500).json({ error: 'Serverio klaida' });
  }
});

// POST /api/tags — sukurti (admin)
router.post('/', auth, async (req, res) => {
  try {
    const { slug, name, type, description, heroText, sortOrder } = req.body;

    if (!slug || !name || !type) {
      return res
        .status(400)
        .json({ error: 'Slug, name ir type privalomi' });
    }

    if (!['OCCASION', 'INDUSTRY'].includes(type)) {
      return res
        .status(400)
        .json({ error: 'Type turi būti OCCASION arba INDUSTRY' });
    }

    const tag = await prisma.tag.create({
      data: {
        slug,
        name,
        type,
        description: description || null,
        heroText: heroText || null,
        sortOrder: sortOrder || 0,
      },
    });

    res.status(201).json({ message: 'Tag sukurtas', tag });
  } catch (error) {
    console.error('Create tag error:', error);
    if (error.code === 'P2002') {
      return res
        .status(400)
        .json({ error: 'Tag su tokiu slug jau egzistuoja' });
    }
    res.status(500).json({ error: 'Serverio klaida' });
  }
});

// PUT /api/tags/:id — redaguoti (admin)
router.put('/:id', auth, async (req, res) => {
  try {
    const { slug, name, type, description, heroText, sortOrder } = req.body;

    const tag = await prisma.tag.update({
      where: { id: req.params.id },
      data: {
        ...(slug && { slug }),
        ...(name && { name }),
        ...(type && { type }),
        ...(description !== undefined && { description }),
        ...(heroText !== undefined && { heroText }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    });

    res.json({ message: 'Tag atnaujintas', tag });
  } catch (error) {
    console.error('Update tag error:', error);
    if (error.code === 'P2002') {
      return res
        .status(400)
        .json({ error: 'Tag su tokiu slug jau egzistuoja' });
    }
    res.status(500).json({ error: 'Serverio klaida' });
  }
});

// DELETE /api/tags/:id — ištrinti (admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    await prisma.tag.delete({ where: { id: req.params.id } });
    res.json({ message: 'Tag ištrintas' });
  } catch (error) {
    console.error('Delete tag error:', error);
    res.status(500).json({ error: 'Serverio klaida' });
  }
});

module.exports = router;

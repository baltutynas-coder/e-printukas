// Kategorijų maršrutai
const router = require('express').Router();
const prisma = require('../config/db');
const { auth } = require('../middleware/auth');

// GET /api/categories — visos kategorijos (vieša)
router.get('/', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { parentId: null },
      include: {
        children: { orderBy: { sortOrder: 'asc' } },
        _count: { select: { products: true } }
      },
      orderBy: { sortOrder: 'asc' }
    });
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ error: 'Serverio klaida' });
  }
});

// POST /api/categories — sukurti (admin)
router.post('/', auth, async (req, res) => {
  try {
    const { name, parentId, image } = req.body;
    if (!name) return res.status(400).json({ error: 'Pavadinimas privalomas' });

    const slug = name
      .toLowerCase()
      .replace(/[ąčęėįšųūž]/g, c => 'aceeisuuz'['ąčęėįšųūž'.indexOf(c)])
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const category = await prisma.category.create({
      data: { name, slug, parentId, image }
    });
    res.status(201).json({ message: 'Kategorija sukurta', category });
  } catch (error) {
    res.status(500).json({ error: 'Serverio klaida' });
  }
});

// PUT /api/categories/:id — redaguoti (admin)
router.put('/:id', auth, async (req, res) => {
  try {
    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json({ message: 'Kategorija atnaujinta', category });
  } catch (error) {
    res.status(500).json({ error: 'Serverio klaida' });
  }
});

// DELETE /api/categories/:id — ištrinti (admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    await prisma.category.delete({ where: { id: req.params.id } });
    res.json({ message: 'Kategorija ištrinta' });
  } catch (error) {
    res.status(500).json({ error: 'Serverio klaida' });
  }
});

module.exports = router;

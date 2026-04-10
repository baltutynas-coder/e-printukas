// Užsakymų maršrutai
const router = require('express').Router();
const prisma = require('../config/db');
const { auth } = require('../middleware/auth');

// Generuoti užsakymo numerį EPR-00001
const generateOrderNumber = async () => {
  const lastOrder = await prisma.order.findFirst({ orderBy: { createdAt: 'desc' } });
  const lastNum = lastOrder ? parseInt(lastOrder.orderNumber.split('-')[1]) : 0;
  return `EPR-${String(lastNum + 1).padStart(5, '0')}`;
};

// POST /api/orders — sukurti užsakymą (klientas, be auth)
router.post('/', async (req, res) => {
  try {
    const {
      customerEmail, customerName, customerPhone,
      shippingAddress, shippingCity, shippingZip,
      items // [{ productId, variantId, quantity }]
    } = req.body;

    if (!customerEmail || !customerName || !shippingAddress || !shippingCity || !shippingZip || !items?.length) {
      return res.status(400).json({ error: 'Užpildykite visus privalomus laukus' });
    }

    // Suskaičiuoti kainas iš DB (saugumo dėlei)
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { id: true, price: true, name: true }
      });
      if (!product) return res.status(400).json({ error: `Produktas nerastas: ${item.productId}` });

      subtotal += parseFloat(product.price) * item.quantity;
      orderItems.push({
        productId: item.productId,
        variantId: item.variantId || null,
        quantity: item.quantity,
        price: product.price
      });
    }

    const shippingCost = subtotal >= 50 ? 0 : 4.99; // Nemokamas pristatymas nuo 50€
    const total = subtotal + shippingCost;

    const order = await prisma.order.create({
      data: {
        orderNumber: await generateOrderNumber(),
        customerEmail, customerName, customerPhone,
        shippingAddress, shippingCity, shippingZip,
        subtotal, shippingCost, total,
        items: { create: orderItems }
      },
      include: { items: { include: { product: true } } }
    });

    res.status(201).json({ message: 'Užsakymas sukurtas', order });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Serverio klaida' });
  }
});

// GET /api/orders — visi užsakymai (admin)
router.get('/', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = status ? { status } : {};

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        include: { items: { include: { product: { select: { name: true } } } } }
      }),
      prisma.order.count({ where })
    ]);

    res.json({ orders, pagination: { page: parseInt(page), total, pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) {
    res.status(500).json({ error: 'Serverio klaida' });
  }
});

// GET /api/orders/:id — vienas užsakymas (admin)
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { items: { include: { product: true, variant: true } } }
    });
    if (!order) return res.status(404).json({ error: 'Užsakymas nerastas' });
    res.json({ order });
  } catch (error) {
    res.status(500).json({ error: 'Serverio klaida' });
  }
});

// PUT /api/orders/:id/status — keisti statusą (admin)
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Neteisingas statusas' });
    }

    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status }
    });
    res.json({ message: 'Statusas atnaujintas', order });
  } catch (error) {
    res.status(500).json({ error: 'Serverio klaida' });
  }
});

module.exports = router;

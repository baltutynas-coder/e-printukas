// ============================================
// Auth Middleware — tikrina ar admin prisijungęs
// ============================================
// Naudojimas: router.get('/admin/products', auth, controller)
// ============================================

const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

// Tikrina JWT tokeną
const auth = async (req, res, next) => {
  try {
    // 1. Gauti tokeną iš header'io
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Prisijungimas būtinas' });
    }

    const token = authHeader.split(' ')[1];

    // 2. Patikrinti tokeną
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Rasti admin vartotoją
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, name: true, role: true }
    });

    if (!admin) {
      return res.status(401).json({ error: 'Vartotojas nerastas' });
    }

    // 4. Pridėti admin info prie request objekto
    req.admin = admin;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Sesija pasibaigė, prisijunkite iš naujo' });
    }
    return res.status(401).json({ error: 'Neteisingas tokenas' });
  }
};

// Tikrina ar admin turi reikiamą rolę
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({ error: 'Neturite teisių šiam veiksmui' });
    }
    next();
  };
};

module.exports = { auth, requireRole };

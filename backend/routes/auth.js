// ============================================
// Auth maršrutai — admin prisijungimas
// ============================================
// POST /api/auth/login    — prisijungti
// GET  /api/auth/me       — gauti admin info
// POST /api/auth/register — sukurti pirmą admin (tik kartą)
// ============================================

const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const { auth } = require('../middleware/auth');

// Generuoti JWT tokeną
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// POST /api/auth/register — sukurti pirmą admin
// Veikia TIK jei dar nėra jokio admin
router.post('/register', async (req, res) => {
  try {
    // Tikrinti ar jau yra admin
    const existingAdmin = await prisma.admin.findFirst();
    if (existingAdmin) {
      return res.status(403).json({
        error: 'Admin jau egzistuoja. Naujus admin kuria esamas admin.'
      });
    }

    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Užpildykite visus laukus' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Slaptažodis turi būti bent 8 simbolių' });
    }

    // Hash slaptažodį
    const hashedPassword = await bcrypt.hash(password, 12);

    const admin = await prisma.admin.create({
      data: { email, password: hashedPassword, name, role: 'ADMIN' },
      select: { id: true, email: true, name: true, role: true }
    });

    const token = generateToken(admin.id);

    res.status(201).json({
      message: 'Admin sukurtas sėkmingai!',
      admin,
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Serverio klaida' });
  }
});

// POST /api/auth/login — prisijungti
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Įveskite el. paštą ir slaptažodį' });
    }

    // Rasti admin pagal email
    const admin = await prisma.admin.findUnique({ where: { email } });

    if (!admin) {
      return res.status(401).json({ error: 'Neteisingas el. paštas arba slaptažodis' });
    }

    // Tikrinti slaptažodį
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Neteisingas el. paštas arba slaptažodis' });
    }

    const token = generateToken(admin.id);

    res.json({
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Serverio klaida' });
  }
});

// GET /api/auth/me — gauti prisijungusio admin info
router.get('/me', auth, (req, res) => {
  res.json({ admin: req.admin });
});

module.exports = router;

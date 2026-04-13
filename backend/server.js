// ============================================
// e.printukas.lt — Pagrindinis serveris
// ============================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 4000;

// ============================================
// 1. MIDDLEWARE
// ============================================

app.use(helmet());

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// JSON parsing — visa kita
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Per daug užklausų, bandykite vėliau' }
});
app.use('/api/', limiter);

// ============================================
// 2. MARŠRUTAI
// ============================================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'e.printukas.lt API veikia!',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/upload', require('./routes/upload'));


// ============================================
// 3. KLAIDŲ TVARKYMAS
// ============================================

app.use((req, res) => {
  res.status(404).json({ error: 'Maršrutas nerastas' });
});

app.use((err, req, res, next) => {
  console.error('❌ Klaida:', err.message);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'development' ? err.message : 'Serverio klaida'
  });
});

// ============================================
// 4. PALEIDIMAS
// ============================================

app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════╗
  ║  🖨️  e.printukas.lt API serveris     ║
  ║  📍 http://localhost:${PORT}            ║
  ║  🌍 Aplinka: ${process.env.NODE_ENV || 'development'}        ║
  ╚══════════════════════════════════════╝
  `);
});

module.exports = app;

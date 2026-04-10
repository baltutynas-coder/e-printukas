// ============================================
// e.printukas.lt — Pagrindinis serveris
// ============================================
// Paleidimas: npm run dev
// Dokumentacija: Express.js → expressjs.com
// ============================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 4000;

// ============================================
// 1. MIDDLEWARE (tarpinė programinė įranga)
// ============================================

// Saugumas — apsaugo nuo dažnų atakų
app.use(helmet());

// CORS — leidžia frontend kreiptis į backend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// JSON parsing — priima JSON duomenis iš frontend
app.use(express.json({ limit: '10mb' }));

// Rate limiting — apsauga nuo per didelio užklausų kiekio
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minučių
  max: 100, // Max 100 užklausų per langą
  message: { error: 'Per daug užklausų, bandykite vėliau' }
});
app.use('/api/', limiter);

// ============================================
// 2. MARŠRUTAI (Routes)
// ============================================

// Sveikatos patikrinimas
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'e.printukas.lt API veikia!',
    timestamp: new Date().toISOString()
  });
});

// API maršrutai
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/upload', require('./routes/upload'));

// ============================================
// 3. KLAIDŲ TVARKYMAS
// ============================================

// 404 — maršrutas nerastas
app.use((req, res) => {
  res.status(404).json({ error: 'Maršrutas nerastas' });
});

// Globalus klaidų tvarkytojas
app.use((err, req, res, next) => {
  console.error('❌ Klaida:', err.message);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'development'
      ? err.message
      : 'Serverio klaida'
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

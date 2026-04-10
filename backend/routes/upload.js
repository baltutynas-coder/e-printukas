// Nuotraukų įkėlimo maršrutai
const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const { auth } = require('../middleware/auth');

// Multer konfigūracija — lokali saugykla (dev)
// Produkcijoje pakeisti į Cloudinary
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../frontend/public/images')),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error('Tik JPEG, PNG, WEBP formatai leidžiami'));
  }
});

// POST /api/upload — įkelti nuotrauką (admin)
router.post('/', auth, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nepateiktas failas' });

  res.json({
    message: 'Nuotrauka įkelta',
    url: `/images/${req.file.filename}`,
    filename: req.file.filename
  });
});

// POST /api/upload/multiple — kelios nuotraukos
router.post('/multiple', auth, upload.array('images', 10), (req, res) => {
  if (!req.files?.length) return res.status(400).json({ error: 'Nepateikti failai' });

  const files = req.files.map(f => ({
    url: `/images/${f.filename}`,
    filename: f.filename
  }));

  res.json({ message: `Įkelta ${files.length} nuotraukų`, files });
});

module.exports = router;

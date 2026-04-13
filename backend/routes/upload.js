// ============================================
// Nuotraukų įkėlimo maršrutai — Cloudinary
// ============================================
// POST /api/upload        — įkelti vieną nuotrauką
// POST /api/upload/multiple — įkelti kelias nuotraukas
// ============================================

const router = require('express').Router();
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { auth } = require('../middleware/auth');
const prisma = require('../config/db');

// Cloudinary konfigūracija
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer — laikinai saugome atmintyje (buffer), tada siunčiame į Cloudinary
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    if (allowed.test(file.mimetype)) return cb(null, true);
    cb(new Error('Tik JPEG, PNG, WEBP formatai leidžiami'));
  }
});

// Įkelti į Cloudinary iš buffer
const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'eprintukas', // Cloudinary aplankas
        transformation: [
          { width: 800, height: 800, crop: 'limit' }, // Max 800x800
          { quality: 'auto' }, // Automatinis kokybės optimizavimas
          { format: 'webp' }, // Konvertuoti į WebP (mažesnis dydis)
        ],
        ...options,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
};

// POST /api/upload — viena nuotrauka (admin)
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nepateiktas failas' });

    const result = await uploadToCloudinary(req.file.buffer);

    // Jei pateiktas productId — prijungti prie produkto
    if (req.body.productId) {
      await prisma.productImage.create({
        data: {
          url: result.secure_url,
          alt: req.body.alt || null,
          productId: req.body.productId,
        },
      });
    }

    res.json({
      message: 'Nuotrauka įkelta',
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Nepavyko įkelti nuotraukos' });
  }
});

// POST /api/upload/multiple — kelios nuotraukos (admin)
router.post('/multiple', auth, upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files?.length) return res.status(400).json({ error: 'Nepateikti failai' });

    const results = [];
    for (const file of req.files) {
      const result = await uploadToCloudinary(file.buffer);

      // Jei pateiktas productId — prijungti prie produkto
      if (req.body.productId) {
        await prisma.productImage.create({
          data: {
            url: result.secure_url,
            productId: req.body.productId,
            sortOrder: results.length,
          },
        });
      }

      results.push({
        url: result.secure_url,
        publicId: result.public_id,
      });
    }

    res.json({ message: `Įkelta ${results.length} nuotraukų`, files: results });
  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500).json({ error: 'Nepavyko įkelti nuotraukų' });
  }
});

// DELETE /api/upload/:publicId — ištrinti nuotrauką (admin)
router.delete('/:imageId', auth, async (req, res) => {
  try {
    const image = await prisma.productImage.findUnique({ where: { id: req.params.imageId } });
    if (!image) return res.status(404).json({ error: 'Nuotrauka nerasta' });

    // Ištrinti iš Cloudinary (jei URL turi cloudinary)
    if (image.url.includes('cloudinary')) {
      const parts = image.url.split('/');
      const publicId = 'eprintukas/' + parts[parts.length - 1].split('.')[0];
      await cloudinary.uploader.destroy(publicId).catch(() => {});
    }

    // Ištrinti iš DB
    await prisma.productImage.delete({ where: { id: req.params.imageId } });

    res.json({ message: 'Nuotrauka ištrinta' });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ error: 'Nepavyko ištrinti nuotraukos' });
  }
});

module.exports = router;

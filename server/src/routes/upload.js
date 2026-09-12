const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

const ALLOWED = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'image/svg+xml': '.svg',
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB images
  fileFilter: (req, file, cb) => {
    if (ALLOWED[file.mimetype]) return cb(null, true);
    cb(new Error('Only JPG, PNG, GIF, WEBP and SVG images are allowed'));
  },
});

let cloudinary = null;
function getCloudinary() {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) return null;
  if (!cloudinary) {
    cloudinary = require('cloudinary').v2;
    cloudinary.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
      secure: true,
    });
  }
  return cloudinary;
}

function uploadToCloudinary(buffer, mimetype, originalname = 'image') {
  const cld = getCloudinary();
  const folder = process.env.CLOUDINARY_FOLDER || 'blogverse';
  const cleanName = path.parse(originalname).name.replace(/[^a-zA-Z0-9_-]/g, '_');

  return new Promise((resolve, reject) => {
    const stream = cld.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        public_id: `${cleanName}_${Date.now()}`,
      },
      (err, result) => {
        if (err) reject(err);
        else resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

function saveLocal(buffer, mimetype) {
  const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');
  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const ext = ALLOWED[mimetype] || '.jpg';
  const name = crypto.randomBytes(12).toString('hex') + ext;
  fs.writeFileSync(path.join(UPLOAD_DIR, name), buffer);
  return `/uploads/${name}`;
}

// POST /api/upload - Single image upload (cover or in-article markdown inline image)
router.post('/', requireAuth, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image file provided' });

    let url;
    if (getCloudinary()) {
      url = await uploadToCloudinary(req.file.buffer, req.file.mimetype, req.file.originalname);
    } else {
      url = saveLocal(req.file.buffer, req.file.mimetype);
    }

    res.status(201).json({
      url,
      filename: req.file.originalname,
      size: req.file.size,
    });
  } catch (err) {
    console.error('Image upload failed:', err.message);
    res.status(500).json({ message: 'Upload failed: ' + err.message });
  }
});

module.exports = router;

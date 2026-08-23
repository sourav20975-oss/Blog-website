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
};

// memory storage - buffer ko cloudinary ya local me bhejenge
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED[file.mimetype]) return cb(null, true);
    cb(new Error('Only JPG, PNG, GIF, WEBP images are allowed'));
  },
});

// ---- Cloudinary (agar .env me credentials hain) ----
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

function uploadToCloudinary(buffer, mimetype) {
  const cld = getCloudinary();
  const folder = process.env.CLOUDINARY_FOLDER || 'blogverse';
  return new Promise((resolve, reject) => {
    const stream = cld.uploader.upload_stream(
      { folder, resource_type: 'image', format: ALLOWED[mimetype]?.replace('.', '') },
      (err, result) => {
        if (err) reject(err);
        else resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

// ---- Local fallback (credentials nahi hain toh) ----
function saveLocal(buffer, mimetype) {
  const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');
  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const name = crypto.randomBytes(8).toString('hex') + (ALLOWED[mimetype] || '.bin');
  fs.writeFileSync(path.join(UPLOAD_DIR, name), buffer);
  return `/uploads/${name}`;
}

// POST /api/upload - single image, field name: "image" (auth required)
router.post('/', requireAuth, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image found' });

    let url;
    if (getCloudinary()) {
      url = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
    } else {
      url = saveLocal(req.file.buffer, req.file.mimetype);
    }
    res.status(201).json({ url });
  } catch (err) {
    console.error('Upload failed:', err.message);
    res.status(500).json({ message: 'Upload failed: ' + err.message });
  }
});

module.exports = router;

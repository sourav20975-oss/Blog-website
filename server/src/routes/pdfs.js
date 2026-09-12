const express = require('express');
const multer = require('multer');
const PdfDocument = require('../models/PdfDocument');
const { uploadToGridFS, getDownloadStream, deleteFromGridFS, findFileInGridFS } = require('../utils/gridfs');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Multer memory storage supporting up to 50MB PDFs
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF documents are allowed'));
    }
  },
});

// GET /api/pdfs - Paginated & filterable list of PDFs
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 9));
    const q = String(req.query.q || '').trim();
    const category = String(req.query.category || '').trim();
    const sort = String(req.query.sort || 'newest').trim();

    const filter = {};
    if (category && category !== 'All') {
      filter.category = category;
    }

    if (q) {
      const safe = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const rx = new RegExp(safe, 'i');
      filter.$or = [{ title: rx }, { description: rx }, { author: rx }, { tags: rx }];
    }

    let sortObj = { createdAt: -1 };
    if (sort === 'popular' || sort === 'downloads') {
      sortObj = { downloads: -1, createdAt: -1 };
    } else if (sort === 'views') {
      sortObj = { views: -1, createdAt: -1 };
    } else if (sort === 'size') {
      sortObj = { fileSize: -1 };
    }

    const total = await PdfDocument.countDocuments(filter);
    const pdfs = await PdfDocument.find(filter)
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      pdfs,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      limit,
    });
  } catch (err) {
    console.error('Fetch PDFs failed:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/pdfs/:id - Get single PDF details
router.get('/:id', async (req, res) => {
  try {
    const doc = await PdfDocument.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'PDF document not found' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/pdfs/:id/view - Stream PDF inline for browser viewing with HTTP Range support
router.get('/:id/view', async (req, res) => {
  try {
    const doc = await PdfDocument.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'PDF document not found' });

    const gridFile = await findFileInGridFS(doc.fileId);
    if (!gridFile) return res.status(404).json({ message: 'PDF file data not found in storage' });

    // Track views asynchronously
    PdfDocument.findByIdAndUpdate(doc._id, { $inc: { views: 1 } }).exec();

    const fileSize = gridFile.length;
    const range = req.headers.range;

    if (range) {
      // Partial content support (HTTP 206) for responsive PDF navigation
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${encodeURIComponent(doc.filename)}"`,
      });

      const stream = getDownloadStream(doc.fileId, { start, end: end + 1 });
      stream.on('error', (e) => res.end());
      stream.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': 'application/pdf',
        'Accept-Ranges': 'bytes',
        'Content-Disposition': `inline; filename="${encodeURIComponent(doc.filename)}"`,
      });

      const stream = getDownloadStream(doc.fileId);
      stream.on('error', (e) => res.end());
      stream.pipe(res);
    }
  } catch (err) {
    console.error('Stream PDF error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/pdfs/:id/download - Stream PDF as attachment and increment download counter
router.get('/:id/download', async (req, res) => {
  try {
    const doc = await PdfDocument.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'PDF document not found' });

    const gridFile = await findFileInGridFS(doc.fileId);
    if (!gridFile) return res.status(404).json({ message: 'PDF file data not found' });

    // Increment downloads count
    await PdfDocument.findByIdAndUpdate(doc._id, { $inc: { downloads: 1 } });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(doc.filename)}"`);
    res.setHeader('Content-Length', gridFile.length);

    const stream = getDownloadStream(doc.fileId);
    stream.on('error', (err) => {
      console.error('Download stream error:', err);
      res.end();
    });
    stream.pipe(res);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/pdfs - Upload PDF (up to 50MB) with metadata
router.post('/', requireAuth, requireAdmin, upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'PDF file is required (up to 50MB)' });
    }

    const { title, description, coverImage, category, author, tags } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Document title is required' });
    }

    const parsedTags = Array.isArray(tags)
      ? tags
      : typeof tags === 'string'
      ? tags.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    // Save PDF file buffer into MongoDB GridFS
    const fileId = await uploadToGridFS(
      req.file.originalname,
      req.file.mimetype || 'application/pdf',
      req.file.buffer,
      {
        uploader: req.user.name,
        uploadedAt: new Date(),
      }
    );

    const pdfDoc = await PdfDocument.create({
      title: title.trim(),
      description: (description || '').trim(),
      coverImage: coverImage || '',
      fileId,
      filename: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype || 'application/pdf',
      category: category || 'General',
      author: author || req.user.name || 'Sourav Kumar',
      tags: parsedTags,
      uploadedBy: req.user.id,
    });

    res.status(201).json(pdfDoc);
  } catch (err) {
    console.error('Upload PDF failed:', err);
    res.status(500).json({ message: 'PDF upload failed: ' + err.message });
  }
});

// PUT /api/pdfs/:id - Update PDF metadata
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { title, description, coverImage, category, author, tags } = req.body;
    const update = {};
    if (title !== undefined) update.title = title.trim();
    if (description !== undefined) update.description = description.trim();
    if (coverImage !== undefined) update.coverImage = coverImage;
    if (category !== undefined) update.category = category;
    if (author !== undefined) update.author = author.trim();
    if (tags !== undefined) {
      update.tags = Array.isArray(tags)
        ? tags
        : typeof tags === 'string'
        ? tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [];
    }

    const doc = await PdfDocument.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });

    if (!doc) return res.status(404).json({ message: 'PDF document not found' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/pdfs/:id - Delete PDF and its GridFS chunks
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const doc = await PdfDocument.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'PDF document not found' });

    // Remove from GridFS
    await deleteFromGridFS(doc.fileId);

    // Remove record
    await PdfDocument.findByIdAndDelete(req.params.id);

    res.json({ message: 'PDF document deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

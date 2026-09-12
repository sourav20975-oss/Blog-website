const express = require('express');
const Bookmark = require('../models/Bookmark');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

function getOwnerQuery(req) {
  if (req.user && req.user._id) {
    return { user: req.user._id };
  }
  const sessionId = req.headers['x-session-id'] || req.query.sessionId || '';
  if (sessionId) {
    return { sessionId, user: null };
  }
  return null;
}

// GET /api/bookmarks - Get all saved items for current user or session from MongoDB
router.get('/', optionalAuth, async (req, res) => {
  try {
    const ownerQuery = getOwnerQuery(req);
    if (!ownerQuery) {
      return res.json({ bookmarks: [] });
    }

    const bookmarks = await Bookmark.find(ownerQuery).sort({ createdAt: -1 });
    res.json({ bookmarks });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/bookmarks/toggle - Toggle save in MongoDB
router.post('/toggle', optionalAuth, async (req, res) => {
  try {
    const {
      itemType,
      itemId,
      title,
      slug,
      author,
      category,
      coverImage,
      readTime,
      fileSizeBytes,
      pageCount,
    } = req.body;

    if (!itemType || !itemId) {
      return res.status(400).json({ message: 'itemType and itemId are required' });
    }

    const sessionId = req.headers['x-session-id'] || req.body.sessionId || '';
    const userId = req.user ? req.user._id : null;

    if (!userId && !sessionId) {
      return res.status(400).json({ message: 'Session ID or Auth token required' });
    }

    const filter = userId
      ? { user: userId, itemId: String(itemId) }
      : { sessionId, itemId: String(itemId), user: null };

    const existing = await Bookmark.findOne(filter);

    if (existing) {
      await Bookmark.findByIdAndDelete(existing._id);
      return res.json({ saved: false, message: 'Bookmark removed from database' });
    }

    const newBookmark = await Bookmark.create({
      user: userId,
      sessionId: userId ? '' : sessionId,
      itemType,
      itemId: String(itemId),
      title: title || 'Untitled',
      slug: slug || '',
      author: author || '',
      category: category || 'General',
      coverImage: coverImage || '',
      readTime: Number(readTime) || 3,
      fileSizeBytes: Number(fileSizeBytes) || 0,
      pageCount: Number(pageCount) || 0,
    });

    res.status(201).json({ saved: true, bookmark: newBookmark, message: 'Saved to database' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/bookmarks/clear - Clear all bookmarks for user or session in MongoDB
router.delete('/clear', optionalAuth, async (req, res) => {
  try {
    const ownerQuery = getOwnerQuery(req);
    if (!ownerQuery) {
      return res.json({ message: 'Nothing to clear' });
    }

    await Bookmark.deleteMany(ownerQuery);
    res.json({ message: 'All saved items deleted from database' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

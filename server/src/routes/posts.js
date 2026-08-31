const express = require('express');
const Post = require('../models/Post');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/posts?page=1&limit=6&q=react - paginated list (content ke bina, fast)
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 6));
    const q = String(req.query.q || '').trim();

    const filter = {};
    if (q) {
      // regex special chars escape taaki search crash na ho
      const safe = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const rx = new RegExp(safe, 'i');
      filter.$or = [{ title: rx }, { author: rx }];
    }

    const total = await Post.countDocuments(filter);
    const posts = await Post.find(filter)
      .select('-content')
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ posts, total, page, pages: Math.ceil(total / limit) || 1, limit });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/posts/:slug - single post full content
router.get('/:slug', async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/posts - create (auth required)
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { title, slug, quote, coverImage, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }
    const finalSlug = slug ? Post.slugify(slug) : Post.slugify(title);
    const exists = await Post.findOne({ slug: finalSlug });
    if (exists) {
      return res.status(409).json({ message: `Slug "${finalSlug}" already exists` });
    }
    const post = await Post.create({
      title,
      slug: finalSlug,
      author: req.user.name,
      quote,
      coverImage,
      content,
    });
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/posts/:slug - update (auth required)
router.put('/:slug', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { title, slug, author, quote, coverImage, content } = req.body;
    const update = {};
    if (title !== undefined) update.title = title;
    if (author !== undefined) update.author = author;
    if (quote !== undefined) update.quote = quote;
    if (coverImage !== undefined) update.coverImage = coverImage;
    if (content !== undefined) update.content = content;
    if (slug !== undefined && slug) update.slug = Post.slugify(slug);

    const post = await Post.findOneAndUpdate({ slug: req.params.slug }, update, {
      new: true,
      runValidators: true,
    });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/posts/:slug (auth required)
router.delete('/:slug', requireAuth, requireAdmin, async (req, res) => {
  try {
    const post = await Post.findOneAndDelete({ slug: req.params.slug });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

const express = require('express');
const Post = require('../models/Post');

const router = express.Router();

// GET /api/posts - list (without full content for speed)
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find()
      .select('-content')
      .sort({ updatedAt: -1 });
    res.json(posts);
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

// POST /api/posts - create
router.post('/', async (req, res) => {
  try {
    const { title, slug, author, quote, coverImage, content } = req.body;
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
      author,
      quote,
      coverImage,
      content,
    });
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/posts/:slug - update
router.put('/:slug', async (req, res) => {
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

// DELETE /api/posts/:slug
router.delete('/:slug', async (req, res) => {
  try {
    const post = await Post.findOneAndDelete({ slug: req.params.slug });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

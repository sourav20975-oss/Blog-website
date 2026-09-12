const express = require('express');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const { requireAuth, requireAdmin, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/posts - Paginated & filterable list of posts
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 6));
    const q = String(req.query.q || '').trim();
    const category = String(req.query.category || '').trim();
    const tag = String(req.query.tag || '').trim();
    const sort = String(req.query.sort || 'newest').trim();

    const filter = {};
    if (category && category !== 'All') {
      filter.category = category;
    }
    if (tag) {
      filter.tags = tag;
    }
    if (q) {
      const safe = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const rx = new RegExp(safe, 'i');
      filter.$or = [{ title: rx }, { author: rx }, { quote: rx }, { tags: rx }];
    }

    let sortObj = { createdAt: -1 };
    if (sort === 'popular') {
      sortObj = { likes: -1, views: -1 };
    } else if (sort === 'views') {
      sortObj = { views: -1 };
    }

    const total = await Post.countDocuments(filter);
    const posts = await Post.find(filter)
      .select('-content')
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      posts,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      limit,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/posts/:slug - Single post full content + increment view
router.get('/:slug', async (req, res) => {
  try {
    const post = await Post.findOneAndUpdate(
      { slug: req.params.slug },
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const postObj = post.toObject();
    if (postObj.content && postObj.content.startsWith('[GZ]')) {
      try {
        const zlib = require('zlib');
        postObj.content = zlib.gunzipSync(Buffer.from(postObj.content.slice(4), 'base64')).toString('utf8');
      } catch (err) {
        console.error('Content gunzip failed:', err.message);
      }
    }
    res.json(postObj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/posts/:slug/like - Increment like count
router.post('/:slug/like', async (req, res) => {
  try {
    const post = await Post.findOneAndUpdate(
      { slug: req.params.slug },
      { $inc: { likes: 1 } },
      { new: true }
    );
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json({ likes: post.likes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/posts - Create post (admin only)
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { title, slug, quote, coverImage, content, category, tags, author } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const finalSlug = slug ? Post.slugify(slug) : Post.slugify(title);
    const exists = await Post.findOne({ slug: finalSlug });
    if (exists) {
      return res.status(409).json({ message: `Slug "${finalSlug}" already exists` });
    }

    const parsedTags = Array.isArray(tags)
      ? tags
      : typeof tags === 'string'
      ? tags.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    const wordCount = content.trim().split(/\s+/).length;
    const readTime = Math.max(1, Math.ceil(wordCount / 200));

    const post = await Post.create({
      title: title.trim(),
      slug: finalSlug,
      author: author || req.user.name || 'Sourav Kumar',
      quote: quote ? quote.trim() : '',
      coverImage: coverImage || '',
      content,
      category: category || 'General',
      tags: parsedTags,
      readTime,
    });

    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/posts/:slug - Update post (admin only)
router.put('/:slug', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { title, slug, author, quote, coverImage, content, category, tags } = req.body;
    const update = {};
    if (title !== undefined) update.title = title.trim();
    if (author !== undefined) update.author = author.trim();
    if (quote !== undefined) update.quote = quote.trim();
    if (coverImage !== undefined) update.coverImage = coverImage;
    if (category !== undefined) update.category = category;
    if (content !== undefined) {
      update.content = content;
      const wordCount = content.trim().split(/\s+/).length;
      update.readTime = Math.max(1, Math.ceil(wordCount / 200));
    }
    if (tags !== undefined) {
      update.tags = Array.isArray(tags)
        ? tags
        : typeof tags === 'string'
        ? tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [];
    }
    if (slug !== undefined && slug) {
      update.slug = Post.slugify(slug);
    }

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

// DELETE /api/posts/:slug (admin only)
router.delete('/:slug', requireAuth, requireAdmin, async (req, res) => {
  try {
    const post = await Post.findOneAndDelete({ slug: req.params.slug });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    await Comment.deleteMany({ post: post._id });
    res.json({ message: 'Post and comments deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ================= COMMENTS ENDPOINTS =================

// GET /api/posts/:slug/comments - Fetch comments for a post
router.get('/:slug/comments', async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug }).select('_id');
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comments = await Comment.find({ post: post._id })
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ comments, count: comments.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/posts/:slug/comments - Add comment (logged-in or guest)
router.post('/:slug/comments', optionalAuth, async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug }).select('_id');
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const content = String(req.body.content || '').trim();
    if (!content || content.length < 2) {
      return res.status(400).json({ message: 'Comment text is required (min 2 characters)' });
    }

    let userName = 'Guest Reader';
    let userEmail = '';
    let role = 'guest';
    let userId = null;

    if (req.user) {
      userName = req.user.name;
      userEmail = req.user.email;
      role = req.user.role || 'user';
      userId = req.user._id;
    } else if (req.body.userName && String(req.body.userName).trim()) {
      userName = String(req.body.userName).trim().slice(0, 50);
      userEmail = String(req.body.userEmail || '').trim().slice(0, 100);
    }

    const comment = await Comment.create({
      post: post._id,
      user: userId,
      userName,
      userEmail,
      content,
      role,
    });

    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/posts/:slug/comments/:commentId - Delete comment (admin or author)
router.delete('/:slug/comments/:commentId', requireAuth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    const isAdmin = req.user.role === 'admin';
    const isOwner = comment.user && comment.user.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'You are not authorized to delete this comment' });
    }

    await Comment.findByIdAndDelete(req.params.commentId);
    res.json({ message: 'Comment deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

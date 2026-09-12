const mongoose = require('mongoose');
require('dotenv').config();
const { get: getContent } = require('../utils/contentCodec');

const PostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    author: { type: String, default: 'Sourav Kumar', trim: true },
    quote: { type: String, default: '' },
    coverImage: { type: String, default: '' },
    content: { type: String, required: true, get: getContent },
    category: {
      type: String,
      default: 'General',
      enum: ['General', 'Web Development', 'Programming', 'DevOps & Linux', 'Cloud & AI', 'System Design', 'Tutorials'],
    },
    tags: [{ type: String, trim: true }],
    readTime: { type: Number, default: 3 }, // in minutes
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
  },
  { timestamps: true, toJSON: { getters: true } }
);

PostSchema.statics.slugify = function (title) {
  return (
    String(title)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'post'
  );
};

PostSchema.pre('save', function (next) {
  if (this.isModified('content')) {
    const wordCount = (this.content || '').trim().split(/\s+/).length;
    this.readTime = Math.max(1, Math.ceil(wordCount / 200));
  }
  next();
});

module.exports = mongoose.models.Post || mongoose.model('Post', PostSchema);

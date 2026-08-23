const mongoose = require('mongoose');
require('dotenv').config();

const PostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    author: { type: String, default: 'Anonymous', trim: true },
    quote: { type: String, default: '' },
    coverImage: { type: String, default: '' },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

PostSchema.statics.slugify = function (title) {
  return String(title)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'post';
};

module.exports = mongoose.models.Post || mongoose.model('Post', PostSchema);

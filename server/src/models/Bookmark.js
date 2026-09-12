const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    sessionId: {
      type: String,
      default: '',
      index: true,
    },
    itemType: {
      type: String,
      enum: ['post', 'pdf'],
      required: true,
    },
    itemId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      default: '',
    },
    author: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      default: '',
    },
    coverImage: {
      type: String,
      default: '',
    },
    readTime: {
      type: Number,
      default: 3,
    },
    fileSizeBytes: {
      type: Number,
      default: 0,
    },
    pageCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

bookmarkSchema.index({ user: 1, itemId: 1 });
bookmarkSchema.index({ sessionId: 1, itemId: 1 });

module.exports = mongoose.model('Bookmark', bookmarkSchema);

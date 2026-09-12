const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
    },
    userEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000,
    },
    role: {
      type: String,
      enum: ['admin', 'user', 'guest'],
      default: 'guest',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Comment', commentSchema);

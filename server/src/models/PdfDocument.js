const mongoose = require('mongoose');

const PdfDocumentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    coverImage: { type: String, default: '' },
    fileId: { type: mongoose.Schema.Types.ObjectId, required: true },
    filename: { type: String, required: true },
    fileSize: { type: Number, required: true }, // in bytes
    mimeType: { type: String, default: 'application/pdf' },
    category: {
      type: String,
      default: 'General',
      enum: ['General', 'Notes', 'Computer Science', 'Web Development', 'DevOps & Linux', 'Programming', 'Cheat Sheets', 'Books'],
    },
    tags: [{ type: String, trim: true }],
    author: { type: String, default: 'Sourav Kumar', trim: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    downloads: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Clean separate indexes
PdfDocumentSchema.index({ title: 'text', description: 'text' });
PdfDocumentSchema.index({ category: 1 });
PdfDocumentSchema.index({ tags: 1 });
PdfDocumentSchema.index({ createdAt: -1 });
PdfDocumentSchema.index({ downloads: -1 });

module.exports = mongoose.models.PdfDocument || mongoose.model('PdfDocument', PdfDocumentSchema);

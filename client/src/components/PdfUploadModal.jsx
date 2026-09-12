import { useRef, useState } from 'react';
import { uploadPdf, uploadImage } from '../api';
import { formatBytes } from './PdfCard';
import { X, UploadCloud, FileText, AlertCircle, Loader2, Image as ImageIcon } from 'lucide-react';

const CATEGORIES = [
  'General',
  'Notes',
  'Computer Science',
  'Web Development',
  'DevOps & Linux',
  'Programming',
  'Cheat Sheets',
  'Books',
];

export default function PdfUploadModal({ onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [coverImage, setCoverImage] = useState('');
  const [coverUploading, setCoverUploading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Notes',
    author: 'Sourav Kumar',
    tags: '',
  });

  const pdfFileRef = useRef(null);
  const coverFileRef = useRef(null);

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;
    if (!selectedFile.name.toLowerCase().endsWith('.pdf') && selectedFile.type !== 'application/pdf') {
      setError('Please select a valid PDF document.');
      return;
    }
    if (selectedFile.size > 50 * 1024 * 1024) {
      setError(`File size is ${formatBytes(selectedFile.size)}. Maximum allowed is 50MB.`);
      return;
    }

    setError('');
    setFile(selectedFile);
    if (!form.title) {
      const clean = selectedFile.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
      setForm((prev) => ({ ...prev, title: clean }));
    }
  };

  const handleCoverUpload = async (imageFile) => {
    if (!imageFile) return;
    setCoverUploading(true);
    setError('');
    try {
      const res = await uploadImage(imageFile);
      setCoverImage(res.url);
    } catch (err) {
      setError(err.message || 'Failed to upload cover image');
    } finally {
      setCoverUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please choose a PDF document.');
      return;
    }
    if (!form.title.trim()) {
      setError('Document title is required.');
      return;
    }

    setUploading(true);
    setProgress(0);
    setError('');

    try {
      const fd = new FormData();
      fd.append('pdf', file);
      fd.append('title', form.title.trim());
      fd.append('description', form.description.trim());
      fd.append('category', form.category);
      fd.append('author', form.author.trim());
      fd.append('coverImage', coverImage);
      fd.append('tags', form.tags);

      await uploadPdf(fd, (pct) => setProgress(pct));
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const inputClass =
    'w-full rounded-lg border border-borderc bg-card px-3 py-2 text-xs sm:text-sm outline-none transition-all focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/20';
  const labelClass = 'mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative my-auto w-full max-w-xl overflow-hidden rounded-xl border border-borderc bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-borderc px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-white">
              Upload Handbook or Notes
            </h2>
            <p className="text-xs text-zinc-500">
              PDF document (up to 50MB supported)
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={uploading}
            className="rounded-lg p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* PDF Select */}
          <div>
            <label className={labelClass}>Document File *</label>
            <div
              onClick={() => !uploading && pdfFileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (!uploading && e.dataTransfer?.files?.[0]) {
                  handleFileSelect(e.dataTransfer.files[0]);
                }
              }}
              className={`flex flex-col items-center justify-center rounded-xl border border-dashed p-6 text-center transition-all cursor-pointer ${
                file
                  ? 'border-zinc-400 bg-zinc-50 dark:bg-zinc-800/40'
                  : 'border-borderc hover:border-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/30'
              }`}
            >
              {file ? (
                <div className="flex items-center gap-3">
                  <FileText className="h-6 w-6 text-zinc-700 dark:text-zinc-300" />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate max-w-xs">
                      {file.name}
                    </p>
                    <p className="text-xs text-zinc-500 font-mono">
                      {formatBytes(file.size)} &middot; Selected
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                    className="ml-2 text-zinc-400 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <UploadCloud className="h-7 w-7 text-zinc-400 mb-1.5" />
                  <p className="text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Click to select PDF or drag and drop file here
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-400">
                    Up to 50MB file size
                  </p>
                </>
              )}
            </div>
            <input
              ref={pdfFileRef}
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files?.[0])}
            />
          </div>

          {/* Title & Category */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Title *</label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Linux Command Handbook"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className={inputClass}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Author & Tags */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Author / Source</label>
              <input
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Tags (comma-separated)</label>
              <input
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="linux, devops, cheatsheet"
                className={inputClass}
              />
            </div>
          </div>

          {/* Cover Image Upload */}
          <div>
            <label className={labelClass}>Cover Image (Optional)</label>
            <div className="flex gap-2">
              <input
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="Image URL or click upload"
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => coverFileRef.current?.click()}
                disabled={coverUploading}
                className="flex shrink-0 items-center gap-1.5 rounded-lg border border-borderc bg-card px-3 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                {coverUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <ImageIcon className="h-3.5 w-3.5" />
                    <span>Upload</span>
                  </>
                )}
              </button>
              <input
                ref={coverFileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleCoverUpload(e.target.files?.[0])}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>Description / Summary</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              placeholder="Brief summary of topics covered in this document..."
              className={inputClass}
            />
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs font-medium text-zinc-600 dark:text-zinc-400">
                <span>Uploading document...</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div
                  className="h-full bg-orange-500 transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-borderc">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="rounded-lg border border-borderc px-3.5 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !file}
              className="rounded-lg bg-zinc-900 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 disabled:opacity-40"
            >
              {uploading ? `Uploading (${progress}%)...` : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

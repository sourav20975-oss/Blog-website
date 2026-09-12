import { useRef, useState } from 'react';
import { uploadImage } from '../api';
import MarkdownEditor from './MarkdownEditor';
import { Upload, X, Image as ImageIcon, Sparkles, Loader2 } from 'lucide-react';

const CATEGORIES = [
  'General',
  'Web Development',
  'Programming',
  'DevOps & Linux',
  'Cloud & AI',
  'System Design',
  'Tutorials',
];

export default function PostForm({ initial, onSubmit, submitting, error }) {
  const [form, setForm] = useState({
    title: initial?.title || '',
    slug: initial?.slug || '',
    author: initial?.author || 'Sourav Kumar',
    quote: initial?.quote || '',
    coverImage: initial?.coverImage || '',
    category: initial?.category || 'General',
    tags: Array.isArray(initial?.tags) ? initial.tags.join(', ') : initial?.tags || '',
    content: initial?.content || '',
  });

  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverError, setCoverError] = useState('');
  const coverFileRef = useRef(null);

  const set = (key) => (e) => {
    const value = e.target.value;
    if (key === 'title' && !slugTouched) {
      setForm((f) => ({
        ...f,
        title: value,
        slug: value
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/[\s_]+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, ''),
      }));
    } else {
      setForm((f) => ({ ...f, [key]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      tags: form.tags
        ? form.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [],
    };
    onSubmit(payload);
  };

  async function handleCoverUpload(file) {
    if (!file) return;
    setCoverUploading(true);
    setCoverError('');
    try {
      const res = await uploadImage(file);
      setForm((f) => ({ ...f, coverImage: res.url }));
    } catch (err) {
      setCoverError(err.message || 'Failed to upload cover image');
    } finally {
      setCoverUploading(false);
    }
  }

  const inputClass =
    'w-full rounded-xl border border-borderc bg-card px-3.5 py-2.5 text-sm outline-none transition-all placeholder:text-zinc-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20';
  const labelClass = 'mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Top Metadata Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          <label className={labelClass}>Post Title *</label>
          <input
            required
            value={form.title}
            onChange={set('title')}
            placeholder="e.g. Master React 19 & Next.js in 2026"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Custom URL Slug</label>
          <input
            value={form.slug}
            onChange={(e) => {
              setSlugTouched(true);
              set('slug')(e);
            }}
            placeholder="auto-generated-from-title"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Category</label>
          <select value={form.category} onChange={set('category')} className={inputClass}>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Author Name</label>
          <input value={form.author} onChange={set('author')} className={inputClass} />
        </div>
      </div>

      {/* Tags & Cover */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          <label className={labelClass}>Tags (comma separated)</label>
          <input
            value={form.tags}
            onChange={set('tags')}
            placeholder="react, javascript, tutorial, frontend"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Cover Image</label>
          <div className="flex gap-2">
            <input
              value={form.coverImage}
              onChange={set('coverImage')}
              placeholder="https://images.unsplash.com/... or upload"
              className={inputClass}
            />
            <button
              type="button"
              onClick={() => coverFileRef.current?.click()}
              disabled={coverUploading}
              className="flex shrink-0 items-center gap-1.5 rounded-xl border border-borderc bg-card px-4 text-xs font-semibold transition-all hover:border-orange-500 hover:text-orange-600 disabled:opacity-50"
            >
              {coverUploading ? (
                <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
              ) : (
                <>
                  <Upload className="h-3.5 w-3.5" />
                  <span>Upload</span>
                </>
              )}
            </button>
            <input
              ref={coverFileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleCoverUpload(e.target.files[0]);
                  e.target.value = '';
                }
              }}
            />
          </div>

          {coverError && (
            <p className="mt-1 text-xs text-red-500">{coverError}</p>
          )}

          {form.coverImage && (
            <div className="relative mt-3 group overflow-hidden rounded-xl border border-borderc aspect-video max-h-48 w-full bg-zinc-950">
              <img
                src={form.coverImage}
                alt="Cover Preview"
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, coverImage: '' }))}
                className="absolute right-2 top-2 rounded-full bg-black/70 p-1.5 text-white backdrop-blur transition-opacity hover:bg-red-600"
                title="Remove cover image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div>
        <label className={labelClass}>Short Description / Highlight Quote</label>
        <textarea
          value={form.quote}
          onChange={set('quote')}
          rows={2}
          placeholder="A catchy 1-2 sentence preview for search results and social cards..."
          className={inputClass}
        />
      </div>

      {/* Markdown Content Section */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className={labelClass}>Article Content (Markdown + Mid-Article Images) *</label>
          <span className="text-xs text-zinc-400">Drag/drop or paste images anywhere in text</span>
        </div>
        <MarkdownEditor
          value={form.content}
          onChange={(v) => setForm((f) => ({ ...f, content: v }))}
        />
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-borderc">
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white shadow-lg shadow-orange-500/25 transition-all hover:bg-orange-600 hover:shadow-orange-500/40 active:scale-[0.98] disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Saving Post...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>Publish Article</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

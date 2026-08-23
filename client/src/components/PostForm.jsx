import { useRef, useState } from 'react';
import { uploadImage } from '../api';
import Markdown from '../components/Markdown';
import MarkdownEditor from '../components/MarkdownEditor';

export default function PostForm({ initial, onSubmit, submitting, error }) {
  const [form, setForm] = useState({
    title: initial?.title || '',
    slug: initial?.slug || '',
    author: initial?.author || 'Sourav Kumar',
    quote: initial?.quote || '',
    coverImage: initial?.coverImage || '',
    content: initial?.content || '',
  });
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [coverUploading, setCoverUploading] = useState(false);
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
    onSubmit(form);
  };

  async function handleCoverUpload(file) {
    if (!file) return;
    setCoverUploading(true);
    try {
      const { url } = await uploadImage(file);
      setForm((f) => ({ ...f, coverImage: url }));
    } catch {
      /* error shown implicitly by no-op; keep simple */
    } finally {
      setCoverUploading(false);
    }
  }

  const inputClass =
    'w-full rounded-lg border border-borderc bg-card px-3 py-2 text-sm outline-none transition-colors placeholder:text-zinc-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/40';
  const labelClass = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass}>Title *</label>
          <input required value={form.title} onChange={set('title')} placeholder="My Awesome Tutorial" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Slug</label>
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
          <label className={labelClass}>Author</label>
          <input value={form.author} onChange={set('author')} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Cover Image</label>
          <div className="flex gap-2">
            <input
              value={form.coverImage}
              onChange={set('coverImage')}
              placeholder="https://... ya upload karo"
              className={inputClass}
            />
            <button
              type="button"
              onClick={() => coverFileRef.current?.click()}
              disabled={coverUploading}
              className="shrink-0 rounded-lg border border-borderc px-3 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              {coverUploading ? '...' : 'Upload'}
            </button>
            <input
              ref={coverFileRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="hidden"
              onChange={(e) => {
                handleCoverUpload(e.target.files[0]);
                e.target.value = '';
              }}
            />
          </div>
          {form.coverImage && (
            <img src={form.coverImage} alt="cover preview" className="mt-2 aspect-video w-full rounded-lg border border-borderc object-cover" />
          )}
        </div>
      </div>

      <div>
        <label className={labelClass}>Short Quote / Description</label>
        <textarea value={form.quote} onChange={set('quote')} rows="2" placeholder="One line description..." className={inputClass} />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-400">Content (Markdown) *</label>
        <MarkdownEditor value={form.content} onChange={(v) => setForm((f) => ({ ...f, content: v }))} />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-orange-500 px-4 py-3 font-semibold text-white shadow-sm shadow-orange-500/30 transition-all hover:bg-orange-600 hover:shadow-md active:scale-[0.99] disabled:opacity-50 sm:w-auto sm:px-8"
      >
        {submitting ? 'Saving...' : 'Save Post'}
      </button>
    </form>
  );
}

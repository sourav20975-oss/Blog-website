import { useEffect, useState } from 'react';
import { fetchPdfs, deletePdf } from '../api';
import PdfCard from '../components/PdfCard';
import PdfViewerModal from '../components/PdfViewerModal';
import PdfUploadModal from '../components/PdfUploadModal';
import { useAuth } from '../AuthContext';
import {
  Search,
  Plus,
  ArrowUpDown,
  BookOpen,
  AlertCircle,
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Notes',
  'Computer Science',
  'Web Development',
  'DevOps & Linux',
  'Programming',
  'Cheat Sheets',
  'Books',
];

export default function PdfLibrary() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);

  const [activePdf, setActivePdf] = useState(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  const { isAdmin } = useAuth();

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQ, category, sort]);

  const loadData = () => {
    setLoading(true);
    setError('');
    fetchPdfs({ page, limit: 9, q: debouncedQ, category, sort })
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(loadData, [page, debouncedQ, category, sort]);

  const handleDelete = async (pdf) => {
    if (!window.confirm(`Are you sure you want to delete "${pdf.title}"?`)) return;
    try {
      await deletePdf(pdf._id);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to delete PDF');
    }
  };

  const pdfs = data?.pdfs || [];
  const total = data?.total || 0;
  const pages = data?.pages || 1;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-14">
      {/* Header */}
      <section className="border-b border-borderc pb-10 pt-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">
              Reference Library
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl text-zinc-900 dark:text-zinc-50">
              Handbooks &amp; Study Notes
            </h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Curated programming handbooks, Linux references, and computer science notes. Read online directly in your browser or download for offline study.
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={() => setUploadOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors shrink-0"
            >
              <Plus className="h-4 w-4" /> Upload Document
            </button>
          )}
        </div>

        {/* Search and Filters */}
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter by title, author, or topic..."
              className="w-full rounded-xl border border-borderc bg-card py-2 pl-9 pr-4 text-xs sm:text-sm outline-none transition-all placeholder:text-zinc-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    category === cat
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800/60'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative shrink-0">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="rounded-lg border border-borderc bg-card py-1.5 pl-3 pr-6 text-xs font-medium text-zinc-700 dark:text-zinc-300 outline-none hover:border-zinc-400"
              >
                <option value="newest">Newest</option>
                <option value="popular">Downloads</option>
                <option value="views">Views</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Error state */}
      {error && (
        <div className="mt-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-600 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && !data && (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse overflow-hidden rounded-xl border border-borderc bg-card">
              <div className="aspect-video bg-zinc-100 dark:bg-zinc-800/60" />
              <div className="p-5 space-y-3">
                <div className="h-4 w-3/4 rounded bg-zinc-100 dark:bg-zinc-800/60" />
                <div className="h-3 w-full rounded bg-zinc-100 dark:bg-zinc-800/60" />
                <div className="h-8 w-full rounded-lg bg-zinc-100 dark:bg-zinc-800/60 mt-4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && pdfs.length === 0 && (
        <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-dashed border-borderc p-12 text-center">
          <BookOpen className="h-8 w-8 text-zinc-400 mb-2" />
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            No handbooks found
          </h3>
          <p className="mt-1 max-w-sm text-xs text-zinc-500">
            {debouncedQ || category !== 'All'
              ? 'Try adjusting your search filter.'
              : 'Documents will appear here once uploaded.'}
          </p>
        </div>
      )}

      {/* Grid of PDFs */}
      {pdfs.length > 0 && (
        <>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pdfs.map((pdf) => (
              <PdfCard
                key={pdf._id}
                pdf={pdf}
                isAdmin={isAdmin}
                onRead={(p) => setActivePdf(p)}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {pages > 1 && (
            <nav className="mt-12 flex items-center justify-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-borderc px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30"
              >
                Previous
              </button>
              {[...Array(pages)].map((_, i) => {
                const n = i + 1;
                const active = n === page;
                return (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`min-w-[32px] rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                      active
                        ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                        : 'border border-borderc text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {n}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="rounded-lg border border-borderc px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30"
              >
                Next
              </button>
            </nav>
          )}
        </>
      )}

      {/* Reader Modal */}
      {activePdf && (
        <PdfViewerModal
          pdf={activePdf}
          onClose={() => setActivePdf(null)}
        />
      )}

      {/* Upload Modal */}
      {uploadOpen && (
        <PdfUploadModal
          onClose={() => setUploadOpen(false)}
          onSuccess={() => loadData()}
        />
      )}
    </main>
  );
}

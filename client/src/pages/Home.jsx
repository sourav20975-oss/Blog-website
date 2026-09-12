import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchPosts, fetchPdfs, deletePost, getPdfDownloadUrl } from '../api';
import PostCard from '../components/PostCard';
import PdfCard from '../components/PdfCard';
import PdfViewerModal from '../components/PdfViewerModal';
import { useAuth } from '../AuthContext';
import {
  Search,
  BookOpen,
  ArrowRight,
  Eye,
  Download,
  FileText,
  Sparkles,
  Terminal,
} from 'lucide-react';

const PAGE_SIZE = 6;

const CATEGORIES = [
  'All',
  'Web Development',
  'Programming',
  'DevOps & Linux',
  'Cloud & AI',
  'System Design',
  'Tutorials',
];

export default function Home() {
  const [data, setData] = useState(null);
  const [pdfData, setPdfData] = useState(null);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [activePdf, setActivePdf] = useState(null);

  const { isAdmin } = useAuth();

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQ, category]);

  const load = () => {
    fetchPosts({ page, limit: PAGE_SIZE, q: debouncedQ, category })
      .then(setData)
      .catch((e) => setError(e.message));
  };

  useEffect(load, [page, debouncedQ, category]);

  useEffect(() => {
    fetchPdfs({ page: 1, limit: 3 })
      .then(setPdfData)
      .catch(() => {});
  }, []);

  const handleDelete = async (post) => {
    if (!window.confirm(`Delete "${post.title}"?`)) return;
    try {
      await deletePost(post.slug);
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const posts = data?.posts || [];
  const pages = data?.pages || 1;
  const total = data?.total || 0;
  const pdfs = pdfData?.pdfs || [];
  const featuredPdf = pdfs[0];

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Editorial Hero Section with Subtle Ambient Grid & Split Layout */}
      <section className="relative overflow-hidden rounded-3xl border border-borderc bg-card/60 bg-grid-pattern p-6 sm:p-10 lg:p-12 shadow-sm">
        {/* Soft Warm Radial Glow in Dark Mode */}
        <div className="pointer-events-none absolute -top-24 right-0 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-0 h-96 w-96 rounded-full bg-zinc-500/10 blur-3xl" />

        <div className="relative grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
          {/* Left Column: Narrative & Search */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-borderc bg-surface/80 px-3 py-1 text-xs text-zinc-600 dark:text-zinc-300 shadow-sm backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">Engineering Journal</span>
              <span className="text-zinc-300 dark:text-zinc-600">&middot;</span>
              <span className="text-zinc-500 dark:text-zinc-400">Open Reference</span>
            </div>

            <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-5xl text-zinc-900 dark:text-white leading-[1.12]">
              Practical notes for engineers who build systems.
            </h1>

            <p className="mt-4 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-xl">
              In-depth articles covering Linux internals, database architecture, backend engineering, and distributed design. Read online or save complete handbooks.
            </p>

            {/* High-Craft Search Box */}
            <div className="mt-7 max-w-md">
              <div className="relative flex items-center">
                <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-zinc-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search articles, topics, commands..."
                  className="w-full rounded-xl border border-borderc bg-surface/90 py-2.5 pl-10 pr-12 text-sm shadow-sm outline-none transition-all placeholder:text-zinc-500 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/20"
                />
                <span className="pointer-events-none absolute right-3 rounded border border-borderc bg-card px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
                  /
                </span>
              </div>

              {/* Quick Topics */}
              <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-zinc-500">
                <span className="text-[11px] font-medium">Topics:</span>
                {['Linux', 'SQL', 'Docker', 'React', 'Git'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="rounded-md border border-borderc bg-card/70 px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Featured Handbook Showcase Card */}
          <div className="lg:col-span-5">
            {featuredPdf ? (
              <div className="relative overflow-hidden rounded-2xl border border-borderc bg-surface p-5 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-orange-500/10 px-2 py-0.5 text-[11px] font-bold text-orange-600 dark:text-orange-400">
                    Featured Handbook
                  </span>
                  <span className="text-[11px] font-mono text-zinc-400">
                    {featuredPdf.category || 'Reference'}
                  </span>
                </div>

                {featuredPdf.coverImage ? (
                  <div
                    onClick={() => setActivePdf(featuredPdf)}
                    className="mt-3 aspect-[16/10] w-full overflow-hidden rounded-xl border border-borderc bg-zinc-900 cursor-pointer"
                  >
                    <img
                      src={featuredPdf.coverImage}
                      alt={featuredPdf.title}
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                ) : (
                  <div
                    onClick={() => setActivePdf(featuredPdf)}
                    className="mt-3 flex aspect-video w-full flex-col items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800/60 p-4 text-zinc-400 cursor-pointer border border-borderc"
                  >
                    <FileText className="h-10 w-10 text-orange-500 stroke-[1.5]" />
                    <span className="mt-2 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                      Technical Handbook
                    </span>
                  </div>
                )}

                <div className="mt-4">
                  <h3
                    onClick={() => setActivePdf(featuredPdf)}
                    className="cursor-pointer text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                  >
                    {featuredPdf.title}
                  </h3>
                  <p className="mt-1 text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                    {featuredPdf.description || 'Complete source-faithful technical handbook.'}
                  </p>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() => setActivePdf(featuredPdf)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-zinc-900 py-2 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5" /> Read Handbook
                  </button>
                  <a
                    href={getPdfDownloadUrl(featuredPdf._id)}
                    download={featuredPdf.filename || 'handbook.pdf'}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-borderc bg-card px-3.5 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    title="Download Handbook"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-borderc p-8 text-center">
                <Terminal className="h-8 w-8 text-zinc-400 mb-2" />
                <p className="text-xs text-zinc-500">Engineering guides available below</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* REFERENCE HANDBOOKS HIGHLIGHT ROW */}
      {pdfs.length > 0 && (
        <section className="mt-14 border-b border-borderc pb-12">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-2xl">
                Reference Handbooks &amp; Notes
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-zinc-500">
                Detailed offline guides and cheat sheets for instant reading and practice.
              </p>
            </div>
            <Link
              to="/pdfs"
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-orange-600 dark:text-orange-400 hover:underline"
            >
              <span>View All Handbooks</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pdfs.map((pdf) => (
              <PdfCard
                key={pdf._id}
                pdf={pdf}
                isAdmin={false}
                onRead={(p) => setActivePdf(p)}
              />
            ))}
          </div>
        </section>
      )}

      {/* ARTICLES & TUTORIALS WITH CLEAN CATEGORY TABS */}
      <section className="mt-14">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-2xl">
              All Articles &amp; Deep-Dives
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-zinc-500">
              {category !== 'All' ? `Filtered by ${category}` : 'Explore tutorials, code walkthroughs, and practice notes'}
            </p>
          </div>

          {isAdmin && (
            <Link
              to="/create"
              className="self-start sm:self-auto rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors"
            >
              + Write Post
            </Link>
          )}
        </div>

        {/* Category Tabs */}
        <div className="mt-6 flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-borderc">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`shrink-0 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
                category === cat
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-semibold'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-xs sm:text-sm text-red-600 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Loading Skeletons */}
        {!data && !error && (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse overflow-hidden rounded-xl border border-borderc bg-card">
                <div className="aspect-video bg-zinc-100 dark:bg-zinc-800/60" />
                <div className="p-5 space-y-3">
                  <div className="h-4 w-3/4 rounded bg-zinc-100 dark:bg-zinc-800/60" />
                  <div className="h-3 w-full rounded bg-zinc-100 dark:bg-zinc-800/60" />
                  <div className="h-3 w-1/2 rounded bg-zinc-100 dark:bg-zinc-800/60" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {data && posts.length === 0 && (
          <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-dashed border-borderc p-12 text-center">
            <BookOpen className="h-8 w-8 text-zinc-400 mb-2" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              No articles found
            </h3>
            <p className="mt-1 text-xs text-zinc-500 max-w-sm">
              Try adjusting your search filter or selecting another category.
            </p>
          </div>
        )}

        {/* Articles Grid */}
        {posts.length > 0 && (
          <>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <PostCard
                  key={post.slug}
                  post={post}
                  isAdmin={isAdmin}
                  onDelete={isAdmin ? handleDelete : null}
                />
              ))}
            </div>

            {/* Pagination */}
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
      </section>

      {/* PDF Reader Modal */}
      {activePdf && (
        <PdfViewerModal
          pdf={activePdf}
          onClose={() => setActivePdf(null)}
        />
      )}
    </main>
  );
}

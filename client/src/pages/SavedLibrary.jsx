import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSavedPosts, getSavedPdfs, removeSavedItem, clearAllSaved, syncBookmarksFromDB } from '../utils/bookmarks';
import { Bookmark, FileText, BookOpen, Trash2, ArrowRight, Clock, Folder } from 'lucide-react';
import PdfViewerModal from '../components/PdfViewerModal';

export default function SavedLibrary() {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'posts' | 'pdfs'
  const [posts, setPosts] = useState([]);
  const [pdfs, setPdfs] = useState([]);
  const [activePdf, setActivePdf] = useState(null);

  const loadData = () => {
    setPosts(getSavedPosts());
    setPdfs(getSavedPdfs());
  };

  useEffect(() => {
    loadData();
    syncBookmarksFromDB();
    const handleUpdate = () => loadData();
    window.addEventListener('bv:bookmarks-changed', handleUpdate);
    return () => window.removeEventListener('bv:bookmarks-changed', handleUpdate);
  }, []);

  const handleRemove = (type, key) => {
    removeSavedItem(type, key);
    loadData();
  };

  const handleClearAll = () => {
    if (window.confirm('Remove all saved articles and handbooks from your local library?')) {
      clearAllSaved();
      loadData();
    }
  };

  const totalCount = posts.length + pdfs.length;

  const displayedPosts = activeTab === 'pdfs' ? [] : posts;
  const displayedPdfs = activeTab === 'posts' ? [] : pdfs;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-borderc/80 pb-8">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-600 dark:text-orange-400 mb-3">
            <Bookmark className="h-3.5 w-3.5" />
            <span>Personal Vault</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
            Saved Articles & Handbooks
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Your offline-ready curated reading list stored safely on your device.
          </p>
        </div>

        {totalCount > 0 && (
          <button
            onClick={handleClearAll}
            className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 transition hover:bg-rose-500/20"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear Library</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="mt-8 flex items-center gap-2 border-b border-borderc/60 pb-4">
        <button
          onClick={() => setActiveTab('all')}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
            activeTab === 'all'
              ? 'bg-orange-500 text-white shadow-sm'
              : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
          }`}
        >
          All Items ({totalCount})
        </button>
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition ${
            activeTab === 'posts'
              ? 'bg-orange-500 text-white shadow-sm'
              : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
          }`}
        >
          <FileText className="h-3.5 w-3.5" />
          <span>Articles ({posts.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('pdfs')}
          className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition ${
            activeTab === 'pdfs'
              ? 'bg-orange-500 text-white shadow-sm'
              : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
          }`}
        >
          <BookOpen className="h-3.5 w-3.5" />
          <span>Handbooks ({pdfs.length})</span>
        </button>
      </div>

      {/* Empty State */}
      {totalCount === 0 ? (
        <div className="my-16 rounded-3xl border border-dashed border-borderc p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500 mb-4">
            <Bookmark className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Your reading vault is empty
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500 dark:text-zinc-400">
            Save articles or PDF study handbooks while browsing by clicking the bookmark icon on any card.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-orange-600 transition"
            >
              <FileText className="h-4 w-4" /> Explore Articles
            </Link>
            <Link
              to="/pdfs"
              className="inline-flex items-center gap-2 rounded-xl border border-borderc bg-card px-5 py-2.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:border-orange-500/50 transition"
            >
              <BookOpen className="h-4 w-4 text-blue-500" /> Explore Handbooks
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-8 space-y-12">
          {/* Saved Posts Grid */}
          {displayedPosts.length > 0 && (
            <div>
              {activeTab === 'all' && (
                <div className="flex items-center gap-2 mb-4 text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  <FileText className="h-4 w-4 text-orange-500" />
                  <span>Articles ({displayedPosts.length})</span>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedPosts.map((post) => (
                  <div
                    key={post.slug}
                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-borderc bg-card/60 transition-all hover:shadow-lg dark:hover:border-orange-500/40"
                  >
                    {/* Thumbnail */}
                    <Link to={`/blogpost/${post.slug}`} className="block relative aspect-[16/10] overflow-hidden bg-zinc-900">
                      {post.coverImage ? (
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-zinc-800 text-zinc-500">
                          <FileText className="h-10 w-10 opacity-40" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3 rounded-full bg-black/60 px-2.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur">
                        {post.category || 'Article'}
                      </div>
                    </Link>

                    {/* Content */}
                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex items-center gap-2 text-xs text-zinc-500 mb-2">
                        <span>{post.author || 'Author'}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {post.readTime || 5} min read
                        </span>
                      </div>

                      <Link to={`/blogpost/${post.slug}`} className="block flex-1">
                        <h3 className="line-clamp-2 text-base font-bold text-zinc-900 group-hover:text-orange-600 dark:text-zinc-100 dark:group-hover:text-orange-400 transition-colors">
                          {post.title}
                        </h3>
                      </Link>

                      {/* Card Footer Actions */}
                      <div className="mt-4 pt-3 border-t border-borderc/60 flex items-center justify-between">
                        <Link
                          to={`/blogpost/${post.slug}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline"
                        >
                          <span>Read Note</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          onClick={() => handleRemove('post', post.slug)}
                          className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-rose-500/10 hover:text-rose-500"
                          title="Remove from saved"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Saved PDFs Grid */}
          {displayedPdfs.length > 0 && (
            <div>
              {activeTab === 'all' && (
                <div className="flex items-center gap-2 mb-4 text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  <BookOpen className="h-4 w-4 text-blue-500" />
                  <span>Handbooks & Notes ({displayedPdfs.length})</span>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedPdfs.map((pdf) => (
                  <div
                    key={pdf._id}
                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-borderc bg-card/60 transition-all hover:shadow-lg dark:hover:border-blue-500/40"
                  >
                    {/* Thumbnail */}
                    <div
                      onClick={() => setActivePdf(pdf)}
                      className="block cursor-pointer relative aspect-[16/10] overflow-hidden bg-zinc-900"
                    >
                      {pdf.coverImage ? (
                        <img
                          src={pdf.coverImage}
                          alt={pdf.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-zinc-800 text-zinc-500">
                          <BookOpen className="h-10 w-10 opacity-40 text-blue-400" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3 rounded-full bg-black/60 px-2.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur">
                        {pdf.category || 'Handbook'}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex items-center gap-2 text-xs text-zinc-500 mb-2">
                        <span>{pdf.author || 'Author'}</span>
                        {pdf.pageCount > 0 && (
                          <>
                            <span>•</span>
                            <span>{pdf.pageCount} pages</span>
                          </>
                        )}
                      </div>

                      <div onClick={() => setActivePdf(pdf)} className="cursor-pointer flex-1">
                        <h3 className="line-clamp-2 text-base font-bold text-zinc-900 group-hover:text-blue-600 dark:text-zinc-100 dark:group-hover:text-blue-400 transition-colors">
                          {pdf.title}
                        </h3>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="mt-4 pt-3 border-t border-borderc/60 flex items-center justify-between">
                        <button
                          onClick={() => setActivePdf(pdf)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          <BookOpen className="h-3.5 w-3.5" />
                          <span>Open Reader</span>
                        </button>
                        <button
                          onClick={() => handleRemove('pdf', pdf._id)}
                          className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-rose-500/10 hover:text-rose-500"
                          title="Remove from saved"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* PDF Streaming Viewer Modal */}
      {activePdf && (
        <PdfViewerModal pdf={activePdf} onClose={() => setActivePdf(null)} />
      )}
    </div>
  );
}

import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fetchPost, deletePost, likePost } from '../api';
import Markdown from '../components/Markdown';
import TableOfContents, { parseHeadings } from '../components/TableOfContents';
import CommentSection from '../components/CommentSection';
import { isPostSaved, toggleSavePost } from '../utils/bookmarks';
import { formatDate } from '../components/PostCard';
import { useAuth } from '../AuthContext';
import {
  ArrowLeft,
  Clock,
  Eye,
  Heart,
  Share2,
  Check,
  Edit3,
  Trash2,
  Calendar,
  User,
  Sparkles,
  BookOpen,
  Bookmark,
} from 'lucide-react';

export default function BlogPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [error, setError] = useState('');
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [saved, setSaved] = useState(false);
  const [fontSize, setFontSize] = useState('normal'); // 'normal' | 'large'
  const [isFocusMode, setIsFocusMode] = useState(false);

  const { isAdmin } = useAuth();

  useEffect(() => {
    setSaved(isPostSaved(slug));
    const handleBookmarkChange = () => setSaved(isPostSaved(slug));
    window.addEventListener('bv:bookmarks-changed', handleBookmarkChange);
    return () => window.removeEventListener('bv:bookmarks-changed', handleBookmarkChange);
  }, [slug]);

  const handleToggleSave = () => {
    if (!post) return;
    const nowSaved = toggleSavePost(post);
    setSaved(nowSaved);
  };

  // Track scroll reading progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = Math.round((window.scrollY / totalHeight) * 100);
        setScrollProgress(progress);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setPost(null);
    setError('');
    fetchPost(slug)
      .then((data) => {
        setPost(data);
        setLikesCount(data.likes || 0);
      })
      .catch((e) => setError(e.message));
  }, [slug]);

  useEffect(() => {
    try {
      const alreadyLiked = localStorage.getItem('bv_liked_' + slug) === 'true';
      setLiked(alreadyLiked);
    } catch {
      /* ignore */
    }
  }, [slug]);

  const headings = useMemo(() => parseHeadings(post?.content), [post?.content]);

  const handleLike = async () => {
    if (liked) return;
    try {
      setLiked(true);
      setLikesCount((prev) => prev + 1);
      try {
        localStorage.setItem('bv_liked_' + slug, 'true');
      } catch {
        /* ignore */
      }
      await likePost(slug);
    } catch {
      // no-op
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* ignore */
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${post.title}"?`)) return;
    try {
      await deletePost(slug);
      navigate('/');
    } catch (e) {
      setError(e.message);
    }
  };

  if (error) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-24 text-center">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-900/60 dark:bg-red-950/40">
          <p className="text-base font-semibold text-red-600 dark:text-red-400">{error}</p>
          <Link
            to="/"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-xs font-bold text-white shadow hover:bg-orange-600"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
        </div>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-20 animate-pulse space-y-6">
        <div className="h-6 w-32 rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="aspect-video w-full rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-10 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-1/2 rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="space-y-3 pt-6">
          <div className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-4 w-2/3 rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </main>
    );
  }

  return (
    <>
      {/* Top Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-zinc-200/40 dark:bg-zinc-800/40">
        <div
          className="h-full bg-orange-500 transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <main className={`mx-auto px-4 py-8 sm:px-6 sm:py-12 transition-all duration-300 ${isFocusMode ? 'max-w-4xl' : 'max-w-7xl'}`}>
        {/* Back navigation & Category */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-orange-500 dark:text-zinc-400 dark:hover:text-orange-400 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> All Articles
          </Link>

          {post.category && (
            <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-600 dark:text-orange-400">
              {post.category}
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl text-zinc-900 dark:text-white leading-tight">
          {post.title}
        </h1>

        {/* Quote / Subtitle */}
        {post.quote && (
          <p className="mt-4 text-base sm:text-lg text-zinc-600 dark:text-zinc-300 font-medium italic border-l-4 border-orange-500 pl-4 py-1">
            &ldquo;{post.quote}&rdquo;
          </p>
        )}

        {/* Meta Header */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-y border-borderc py-4 text-xs text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500/10 font-bold text-orange-600">
              {post.author?.[0] || 'A'}
            </div>
            <div>
              <p className="font-bold text-zinc-800 dark:text-zinc-200">{post.author}</p>
              <p className="flex items-center gap-2">
                <span>{formatDate(post.createdAt || post.updatedAt)}</span>
                <span>&middot;</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {post.readTime || 3} min read
                </span>
              </p>
            </div>
          </div>

          {/* Social, Bookmark & Admin Bar */}
          <div className="flex items-center gap-2">
            {/* Bookmark button */}
            <button
              onClick={handleToggleSave}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
                saved
                  ? 'border-orange-500/40 bg-orange-500/10 text-orange-600 dark:text-orange-400'
                  : 'border-borderc bg-card hover:border-orange-500/40 hover:text-orange-600'
              }`}
              title={saved ? 'Saved in personal library' : 'Save for offline reading'}
            >
              <Bookmark className={`h-3.5 w-3.5 ${saved ? 'fill-current' : ''}`} />
              <span>{saved ? 'Saved' : 'Save'}</span>
            </button>

            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
                liked
                  ? 'border-rose-500/40 bg-rose-500/10 text-rose-500'
                  : 'border-borderc bg-card hover:border-rose-500/40 hover:text-rose-500'
              }`}
            >
              <Heart className={`h-3.5 w-3.5 ${liked ? 'fill-current' : ''}`} />
              <span>{likesCount}</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 rounded-xl border border-borderc bg-card px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:border-orange-500 dark:text-zinc-300 transition-colors"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Share2 className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied' : 'Share'}</span>
            </button>

            {isAdmin && (
              <div className="flex items-center gap-1 ml-2 border-l border-borderc pl-2">
                <Link
                  to={`/edit/${post.slug}`}
                  className="rounded-lg border border-borderc p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white"
                  title="Edit post"
                >
                  <Edit3 className="h-4 w-4" />
                </Link>
                <button
                  onClick={handleDelete}
                  className="rounded-lg border border-red-200 p-1.5 text-red-500 hover:bg-red-50 dark:border-red-900/60 dark:hover:bg-red-950"
                  title="Delete post"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Hero Cover Image */}
        {post.coverImage && (
          <div className="mt-8 flex justify-center overflow-hidden rounded-2xl border border-borderc bg-zinc-100/40 dark:bg-zinc-900/40 p-2 shadow-sm">
            <img
              src={post.coverImage}
              alt={post.title}
              className="max-h-[440px] w-full object-contain rounded-xl"
            />
          </div>
        )}

        {/* Content Layout: Main Prose + Sticky TOC */}
        <div className={`mt-10 grid grid-cols-1 ${!isFocusMode && headings.length > 0 ? 'lg:grid-cols-12 gap-10' : ''}`}>
          {/* Main Article Content */}
          <div className={!isFocusMode && headings.length > 0 ? 'lg:col-span-8 xl:col-span-9' : 'max-w-4xl mx-auto w-full'}>
            {/* Mobile TOC Drawer */}
            {headings.length > 0 && (
              <TableOfContents
                headings={headings}
                fontSize={fontSize}
                setFontSize={setFontSize}
                isFocusMode={isFocusMode}
                setIsFocusMode={setIsFocusMode}
              />
            )}

            <article
              className={`blog-content prose prose-zinc dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-zinc-900 dark:prose-headings:text-white prose-p:text-zinc-700 dark:prose-p:text-zinc-300 prose-p:leading-relaxed prose-li:text-zinc-700 dark:prose-li:text-zinc-300 prose-strong:text-zinc-900 dark:prose-strong:text-white prose-table:text-sm ${
                fontSize === 'large' ? 'text-lg prose-p:text-lg prose-p:leading-8' : 'text-base'
              }`}
            >
              <Markdown>{post.content}</Markdown>
            </article>

            {/* Tags */}
            {post.tags?.length > 0 && (
              <div className="mt-12 flex flex-wrap items-center gap-2 border-t border-borderc pt-6">
                <span className="text-xs font-semibold text-zinc-500">Related Tags:</span>
                {post.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="rounded-lg bg-orange-500/10 px-2.5 py-1 text-xs font-semibold text-orange-600 dark:text-orange-400"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Author Bio Card */}
            <div className="mt-8 flex items-center gap-4 rounded-2xl border border-borderc bg-card p-6">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-xl font-extrabold text-white shadow-md">
                {post.author?.[0] || 'S'}
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                  Written by {post.author}
                </h3>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Tech author, open-source enthusiast, and computer science educator. Explore more notes, guides, and PDF handbooks on BlogVerse.
                </p>
              </div>
            </div>

            {/* Discussion & Comments System */}
            <CommentSection postSlug={slug} />
          </div>

          {/* Desktop Right Sidebar TOC */}
          {!isFocusMode && headings.length > 0 && (
            <div className="hidden lg:block lg:col-span-4 xl:col-span-3">
              <TableOfContents
                headings={headings}
                fontSize={fontSize}
                setFontSize={setFontSize}
                isFocusMode={isFocusMode}
                setIsFocusMode={setIsFocusMode}
              />
            </div>
          )}
        </div>
      </main>
    </>
  );
}

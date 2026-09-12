import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Eye, Heart, Edit3, Trash2, Bookmark } from 'lucide-react';
import { isPostSaved, toggleSavePost } from '../utils/bookmarks';

export function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function PostCard({ post, onDelete, isAdmin }) {
  const [saved, setSaved] = useState(() => isPostSaved(post.slug));

  useEffect(() => {
    const check = () => setSaved(isPostSaved(post.slug));
    window.addEventListener('bv:bookmarks-changed', check);
    return () => window.removeEventListener('bv:bookmarks-changed', check);
  }, [post.slug]);

  const handleToggleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const nowSaved = toggleSavePost(post);
    setSaved(nowSaved);
  };
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-borderc bg-card transition-all duration-200 hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-sm">
      {/* Cover Image */}
      <Link
        to={`/blogpost/${post.slug}`}
        className="relative block aspect-[16/10] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900 border-b border-borderc"
      >
        {post.coverImage ? (
          <img
            src={post.coverImage}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-mono text-2xl font-bold text-zinc-300 dark:text-zinc-700">
            &lt;/&gt;
          </div>
        )}

        {post.category && (
          <span className="absolute left-2.5 top-2.5 rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
            {post.category}
          </span>
        )}

        <span className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-medium text-zinc-200 backdrop-blur">
          <Clock className="h-2.5 w-2.5" />
          <span>{post.readTime || 3} min read</span>
        </span>
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <Link to={`/blogpost/${post.slug}`}>
          <h2 className="text-sm sm:text-base font-bold text-zinc-900 line-clamp-2 dark:text-zinc-100 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors leading-snug">
            {post.title}
          </h2>
        </Link>

        {post.quote && (
          <p className="mt-1.5 text-xs text-zinc-500 line-clamp-2 leading-relaxed">
            {post.quote}
          </p>
        )}

        {/* Footer */}
        <div className="mt-auto pt-3">
          <div className="flex items-center justify-between border-t border-borderc pt-2.5 text-[11px] text-zinc-400">
            <span>{formatDate(post.createdAt || post.updatedAt)}</span>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" /> {post.views || 0}
              </span>
              <span className="flex items-center gap-1 text-rose-500">
                <Heart className="h-3 w-3 fill-current opacity-70" /> {post.likes || 0}
              </span>
            </div>
          </div>

          <div className="mt-2.5 flex items-center justify-between pt-1">
            <div className="flex items-center gap-3">
              <Link
                to={`/blogpost/${post.slug}`}
                className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:text-orange-600 dark:hover:text-orange-400"
              >
                Read Guide &rarr;
              </Link>
              <button
                onClick={handleToggleSave}
                className={`flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs transition ${
                  saved
                    ? 'text-orange-600 dark:text-orange-400 bg-orange-500/10'
                    : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                }`}
                title={saved ? 'Remove bookmark' : 'Bookmark note'}
              >
                <Bookmark className={`h-3.5 w-3.5 ${saved ? 'fill-current' : ''}`} />
                <span className="text-[11px]">{saved ? 'Saved' : 'Save'}</span>
              </button>
            </div>

            {isAdmin && (
              <div className="flex items-center gap-1">
                <Link
                  to={`/edit/${post.slug}`}
                  className="p-1 rounded-md border border-borderc text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                >
                  <Edit3 className="h-3 w-3" />
                </Link>
                {onDelete && (
                  <button
                    onClick={() => onDelete(post)}
                    className="p-1 rounded-md border border-borderc text-zinc-500 hover:text-red-500"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchPosts, deletePost } from '../api';
import PostCard from '../components/PostCard';
import { useAuth } from '../AuthContext';

export default function Home() {
  const [posts, setPosts] = useState(null);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const { isAdmin } = useAuth();

  const load = () => {
    fetchPosts()
      .then(setPosts)
      .catch((e) => setError(e.message));
  };

  useEffect(load, []);

  const handleDelete = async (post) => {
    if (!window.confirm(`Delete "${post.title}"?`)) return;
    try {
      await deletePost(post.slug);
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const filtered = (posts || []).filter(
    (p) =>
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      (p.author || '').toLowerCase().includes(query.toLowerCase())
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <section className="text-center">
        <span className="inline-block rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-600 dark:text-orange-400">
          MERN Stack Blog
        </span>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
          Learn to{' '}
          <span className="bg-gradient-to-r from-orange-500 via-orange-400 to-amber-400 bg-clip-text text-transparent">
            Code
          </span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-zinc-600 sm:text-base dark:text-zinc-400">
          Tutorials, notes and blogs — sab kuch ek jagah. Free forever.
        </p>
      </section>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title or author..."
            className="w-full rounded-lg border border-borderc bg-card py-2.5 pl-9 pr-4 text-sm outline-none transition-colors placeholder:text-zinc-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/40"
          />
        </div>
        {isAdmin ? (
          <Link
            to="/create"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-orange-500/30 transition-all hover:bg-orange-600 hover:shadow-md hover:shadow-orange-500/30 active:scale-[0.98]"
          >
            + Write a Post
          </Link>
        ) : null}
      </div>

      {error && (
        <p className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      )}

      {!posts && !error && (
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse overflow-hidden rounded-xl border border-borderc bg-card">
              <div className="aspect-video bg-zinc-200 dark:bg-zinc-800"></div>
              <div className="space-y-3 p-5">
                <div className="h-5 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800"></div>
                <div className="h-3 w-full rounded bg-zinc-200 dark:bg-zinc-800"></div>
                <div className="h-3 w-2/3 rounded bg-zinc-200 dark:bg-zinc-800"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {posts && filtered.length === 0 && (
        <p className="mt-10 text-center text-zinc-500">Koi post nahi mila.</p>
      )}

      {filtered.length > 0 && (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post) => (
            <PostCard key={post.slug} post={post} onDelete={isAdmin ? handleDelete : null} />
          ))}
        </div>
      )}
    </main>
  );
}

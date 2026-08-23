import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchPosts, deletePost } from '../api';
import PostCard from '../components/PostCard';

export default function Home() {
  const [posts, setPosts] = useState(null);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

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
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <section className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
          Learn to <span className="text-orange-400">Code</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-zinc-400 sm:text-base">
          Tutorials, notes and blogs — sab kuch ek jagah. Free forever.
        </p>
      </section>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title or author..."
          className="w-full rounded-lg border border-borderc bg-card px-4 py-2.5 text-sm outline-none placeholder:text-zinc-500 focus:border-orange-500 sm:max-w-xs"
        />
        <Link
          to="/create"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
        >
          + Write a Post
        </Link>
      </div>

      {error && (
        <p className="mt-6 rounded-lg border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">{error}</p>
      )}

      {!posts && !error && <p className="mt-10 text-center text-zinc-500">Loading posts...</p>}

      {posts && filtered.length === 0 && (
        <p className="mt-10 text-center text-zinc-500">Koi post nahi mila.</p>
      )}

      {filtered.length > 0 && (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post) => (
            <PostCard key={post.slug} post={post} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </main>
  );
}

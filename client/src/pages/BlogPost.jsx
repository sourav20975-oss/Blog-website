import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fetchPost, deletePost } from '../api';
import Markdown from '../components/Markdown';
import { formatDate } from '../components/PostCard';

export default function BlogPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setPost(null);
    setError('');
    fetchPost(slug)
      .then(setPost)
      .catch((e) => setError(e.message));
  }, [slug]);

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${post.title}"?`)) return;
    try {
      await deletePost(slug);
      navigate('/');
    } catch (e) {
      setError(e.message);
    }
  };

  if (error) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-red-400">{error}</p>
        <Link to="/" className="mt-4 inline-block text-orange-400 hover:underline">
          &larr; Back to Home
        </Link>
      </main>
    );
  }

  if (!post) {
    return <main className="py-20 text-center text-zinc-500">Loading...</main>;
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link to="/" className="text-sm text-zinc-400 hover:text-orange-400">
        &larr; All Posts
      </Link>

      {post.coverImage && (
        <img
          src={post.coverImage}
          alt={post.title}
          className="mt-6 aspect-video w-full rounded-xl border border-borderc object-cover"
        />
      )}

      <h1 className="mt-8 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
        {post.title}
      </h1>

      {post.quote && (
        <blockquote className="mt-4 border-l-4 border-orange-500 pl-4 italic text-zinc-300">
          "{post.quote}"
        </blockquote>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-b border-borderc pb-6 text-sm text-zinc-500">
        <span className="italic">By {post.author}</span>
        <span>Updated: {formatDate(post.updatedAt)}</span>
      </div>

      <div className="mt-2 flex justify-end gap-2">
        <Link
          to={`/edit/${post.slug}`}
          className="rounded-lg border border-borderc px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800"
        >
          Edit
        </Link>
        <button
          onClick={handleDelete}
          className="rounded-lg border border-red-900/60 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-950"
        >
          Delete
        </button>
      </div>

      <article className="blog-content prose prose-invert mt-8 max-w-none prose-headings:text-white prose-p:text-zinc-300 prose-li:text-zinc-300 prose-strong:text-white">
        <Markdown>{post.content}</Markdown>
      </article>
    </main>
  );
}

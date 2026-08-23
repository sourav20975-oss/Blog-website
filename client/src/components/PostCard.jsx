import { Link } from 'react-router-dom';

export function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function PostCard({ post, onDelete }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-borderc bg-card transition-colors hover:border-zinc-600">
      <Link to={`/blogpost/${post.slug}`} className="block aspect-video overflow-hidden bg-zinc-800">
        {post.coverImage ? (
          <img
            src={post.coverImage}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-mono text-4xl text-zinc-600">&lt;/&gt;</div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <Link to={`/blogpost/${post.slug}`}>
          <h2 className="text-lg font-bold leading-snug text-white group-hover:text-orange-400">
            {post.title}
          </h2>
        </Link>
        {post.quote && (
          <p className="mt-2 line-clamp-3 text-sm text-zinc-400">{post.quote}</p>
        )}
        <div className="mt-3 text-xs text-zinc-500">
          By {post.author} &middot; Updated: {formatDate(post.updatedAt)}
        </div>

        <div className="mt-4 flex items-center gap-2 border-t border-borderc pt-4">
          <Link
            to={`/blogpost/${post.slug}`}
            className="rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-orange-600"
          >
            Read More
          </Link>
          <Link
            to={`/edit/${post.slug}`}
            className="rounded-lg border border-borderc px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-800"
          >
            Edit
          </Link>
          <button
            onClick={() => onDelete(post)}
            className="rounded-lg border border-red-900/60 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-950"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fetchPost, updatePost } from '../api';
import PostForm from '../components/PostForm';

export default function EditPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPost(slug)
      .then(setPost)
      .catch((e) => setError(e.message));
  }, [slug]);

  const handleSubmit = async (form) => {
    setSubmitting(true);
    setError('');
    try {
      await updatePost(slug, form);
      navigate(`/blogpost/${form.slug || slug}`);
    } catch (e) {
      setError(e.message);
      setSubmitting(false);
    }
  };

  if (error && !post) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-red-500 dark:text-red-400">{error}</p>
        <Link to="/" className="mt-4 inline-block text-orange-500 hover:underline dark:text-orange-400">&larr; Back to Home</Link>
      </main>
    );
  }

  if (!post) return <main className="py-20 text-center text-zinc-500">Loading...</main>;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-extrabold sm:text-3xl">Edit Post</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{post.title}</p>
      <div className="mt-8">
        <PostForm initial={post} onSubmit={handleSubmit} submitting={submitting} error={error} />
      </div>
    </main>
  );
}

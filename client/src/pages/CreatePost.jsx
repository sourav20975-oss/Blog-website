import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPost } from '../api';
import PostForm from '../components/PostForm';

export default function CreatePost() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (form) => {
    setSubmitting(true);
    setError('');
    try {
      const post = await createPost(form);
      navigate(`/blogpost/${post.slug}`);
    } catch (e) {
      setError(e.message);
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-extrabold text-white sm:text-3xl">Write a New Post</h1>
      <p className="mt-1 text-sm text-zinc-400">Markdown supported — code blocks, tables, lists, sab kuch.</p>
      <div className="mt-8">
        <PostForm onSubmit={handleSubmit} submitting={submitting} error={error} />
      </div>
    </main>
  );
}

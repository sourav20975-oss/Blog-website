import { useState, useEffect } from 'react';
import { fetchComments, createComment, deleteComment } from '../api';
import { useAuth } from '../AuthContext';
import Markdown from './Markdown';
import { MessageSquare, Send, Trash2, Shield, User, CornerDownRight, Eye, Code } from 'lucide-react';

function timeAgo(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getInitials(name) {
  if (!name) return '?';
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function CommentSection({ postSlug }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [content, setContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const loadComments = async () => {
    try {
      setLoading(true);
      const data = await fetchComments(postSlug);
      setComments(data.comments || []);
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (postSlug) {
      loadComments();
    }
  }, [postSlug]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      setSubmitting(true);
      setError('');
      const payload = {
        content: content.trim(),
      };
      if (!user) {
        payload.userName = guestName.trim() || 'Guest Reader';
        payload.userEmail = guestEmail.trim();
      }

      const newComment = await createComment(postSlug, payload);
      setComments([newComment, ...comments]);
      setContent('');
      setShowPreview(false);
    } catch (err) {
      setError(err.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await deleteComment(postSlug, commentId);
      setComments(comments.filter((c) => c._id !== commentId));
    } catch (err) {
      alert(err.message || 'Failed to delete comment');
    }
  };

  return (
    <section className="mt-16 pt-12 border-t border-borderc/80">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
              Discussion & Notes ({comments.length})
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Questions, insights, and technical discussion
            </p>
          </div>
        </div>
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mb-12 rounded-2xl border border-borderc bg-card/70 p-5 shadow-sm backdrop-blur">
        {error && (
          <div className="mb-4 rounded-xl bg-rose-500/10 p-3 text-xs font-medium text-rose-600 dark:text-rose-400">
            {error}
          </div>
        )}

        {/* User Identity Header */}
        <div className="flex items-center justify-between mb-3 text-xs">
          {user ? (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                Commenting as {user.name}
              </span>
              {user.role === 'admin' && (
                <span className="inline-flex items-center gap-1 rounded bg-orange-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-orange-600 dark:text-orange-400">
                  <Shield className="h-3 w-3" /> Admin
                </span>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mb-2">
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Your Name (e.g. Alex Chen)"
                className="rounded-xl border border-borderc bg-zinc-50/50 dark:bg-zinc-900/50 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:border-orange-500 focus:outline-none"
              />
              <input
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="Your Email (optional, for gravatar)"
                className="rounded-xl border border-borderc bg-zinc-50/50 dark:bg-zinc-900/50 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:border-orange-500 focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Text Area / Preview Toggle */}
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-zinc-500">Supports Markdown & code blocks</span>
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="inline-flex items-center gap-1 text-xs font-medium text-orange-600 dark:text-orange-400 hover:underline"
            >
              {showPreview ? <Code className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {showPreview ? 'Edit' : 'Preview'}
            </button>
          </div>

          {showPreview ? (
            <div className="min-h-[100px] rounded-xl border border-borderc/60 bg-zinc-50/50 dark:bg-zinc-900/40 p-4 text-sm blog-content">
              {content ? <Markdown>{content}</Markdown> : <p className="text-zinc-400 italic text-xs">Nothing to preview</p>}
            </div>
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write a constructive comment or share a code snippet..."
              rows={3}
              required
              className="w-full rounded-xl border border-borderc bg-zinc-50/50 dark:bg-zinc-900/50 p-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-orange-500 focus:outline-none dark:text-zinc-100"
            />
          )}
        </div>

        {/* Action Bar */}
        <div className="mt-3 flex items-center justify-end">
          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:opacity-50"
          >
            {submitting ? (
              <span>Posting...</span>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                <span>Post Comment</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Comment List */}
      {loading ? (
        <div className="py-8 text-center text-xs text-zinc-500">Loading comments...</div>
      ) : comments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-borderc/80 p-8 text-center">
          <MessageSquare className="mx-auto h-8 w-8 text-zinc-400 mb-2" />
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            No comments yet
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            Be the first to leave a thoughtful remark or question!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((c) => {
            const isOwner = user && c.user && (c.user === user.id || c.user._id === user.id || c.user === user._id);
            const isAdmin = user && user.role === 'admin';
            const canDelete = isOwner || isAdmin;

            return (
              <div
                key={c._id}
                className="group rounded-2xl border border-borderc/70 bg-card/50 p-5 backdrop-blur transition hover:border-borderc"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {/* Avatar Initials */}
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 font-mono text-xs font-bold text-white shadow-xs">
                      {getInitials(c.userName)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                          {c.userName}
                        </span>
                        {c.role === 'admin' && (
                          <span className="inline-flex items-center gap-1 rounded bg-orange-500/15 px-1.5 py-0.2 text-[10px] font-semibold text-orange-600 dark:text-orange-400">
                            <Shield className="h-2.5 w-2.5" /> Admin
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        {timeAgo(c.createdAt)}
                      </span>
                    </div>
                  </div>

                  {canDelete && (
                    <button
                      onClick={() => handleDelete(c._id)}
                      className="opacity-0 group-hover:opacity-100 rounded-lg p-1.5 text-zinc-400 transition hover:bg-rose-500/10 hover:text-rose-500"
                      title="Delete comment"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="mt-3 text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed blog-content pl-12">
                  <Markdown>{c.content}</Markdown>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

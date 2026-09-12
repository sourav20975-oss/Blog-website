import { fetchBookmarksApi, toggleBookmarkApi, clearBookmarksApi } from '../api';

// Bookmark storage helper with MongoDB database persistence & reactive custom events
const POSTS_KEY = 'bv_saved_posts';
const PDFS_KEY = 'bv_saved_pdfs';

function safeGet(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function safeSet(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
    window.dispatchEvent(new CustomEvent('bv:bookmarks-changed'));
  } catch (err) {
    console.error('Failed to save bookmark to localStorage:', err);
  }
}

// Sync bookmarks from MongoDB Atlas into local cache
export async function syncBookmarksFromDB() {
  try {
    const res = await fetchBookmarksApi();
    if (res && Array.isArray(res.bookmarks)) {
      const posts = res.bookmarks
        .filter((b) => b.itemType === 'post')
        .map((b) => ({
          _id: b._id,
          slug: b.slug || b.itemId,
          title: b.title,
          author: b.author,
          category: b.category,
          coverImage: b.coverImage,
          readTime: b.readTime,
          createdAt: b.createdAt,
          type: 'post',
        }));

      const pdfs = res.bookmarks
        .filter((b) => b.itemType === 'pdf')
        .map((b) => ({
          _id: b.itemId,
          title: b.title,
          author: b.author,
          category: b.category,
          coverImage: b.coverImage,
          fileSizeBytes: b.fileSizeBytes,
          pageCount: b.pageCount,
          createdAt: b.createdAt,
          type: 'pdf',
        }));

      localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
      localStorage.setItem(PDFS_KEY, JSON.stringify(pdfs));
      window.dispatchEvent(new CustomEvent('bv:bookmarks-changed'));
      return { posts, pdfs };
    }
  } catch (err) {
    console.warn('Bookmarks DB sync deferred (offline/network):', err.message);
  }
  return { posts: safeGet(POSTS_KEY), pdfs: safeGet(PDFS_KEY) };
}

// Automatically initiate sync on module load
if (typeof window !== 'undefined') {
  syncBookmarksFromDB();
}

export function getSavedPosts() {
  return safeGet(POSTS_KEY);
}

export function getSavedPdfs() {
  return safeGet(PDFS_KEY);
}

export function isPostSaved(slug) {
  if (!slug) return false;
  return safeGet(POSTS_KEY).some((p) => p.slug === slug);
}

export function isPdfSaved(id) {
  if (!id) return false;
  return safeGet(PDFS_KEY).some((p) => p._id === id || p.id === id);
}

export function toggleSavePost(post) {
  if (!post || !post.slug) return false;
  const list = safeGet(POSTS_KEY);
  const exists = list.some((p) => p.slug === post.slug);

  const payload = {
    itemType: 'post',
    itemId: post.slug,
    title: post.title,
    slug: post.slug,
    author: post.author,
    category: post.category,
    coverImage: post.coverImage,
    readTime: post.readTime,
  };

  if (exists) {
    const filtered = list.filter((p) => p.slug !== post.slug);
    safeSet(POSTS_KEY, filtered);
    toggleBookmarkApi(payload).catch((err) => console.error('DB bookmark delete error:', err));
    return false; // un-saved
  } else {
    const item = {
      _id: post._id,
      slug: post.slug,
      title: post.title,
      author: post.author,
      category: post.category,
      coverImage: post.coverImage,
      readTime: post.readTime,
      createdAt: post.createdAt,
      type: 'post',
      savedAt: new Date().toISOString(),
    };
    safeSet(POSTS_KEY, [item, ...list]);
    toggleBookmarkApi(payload).catch((err) => console.error('DB bookmark save error:', err));
    return true; // saved
  }
}

export function toggleSavePdf(pdf) {
  if (!pdf || (!pdf._id && !pdf.id)) return false;
  const id = pdf._id || pdf.id;
  const list = safeGet(PDFS_KEY);
  const exists = list.some((p) => p._id === id || p.id === id);

  const payload = {
    itemType: 'pdf',
    itemId: id,
    title: pdf.title,
    author: pdf.author,
    category: pdf.category,
    coverImage: pdf.coverImage,
    fileSizeBytes: pdf.fileSize || pdf.fileSizeBytes,
    pageCount: pdf.pageCount,
  };

  if (exists) {
    const filtered = list.filter((p) => (p._id || p.id) !== id);
    safeSet(PDFS_KEY, filtered);
    toggleBookmarkApi(payload).catch((err) => console.error('DB bookmark delete error:', err));
    return false; // un-saved
  } else {
    const item = {
      _id: id,
      title: pdf.title,
      author: pdf.author,
      category: pdf.category,
      coverImage: pdf.coverImage,
      fileSizeBytes: pdf.fileSize || pdf.fileSizeBytes,
      pageCount: pdf.pageCount,
      createdAt: pdf.createdAt,
      type: 'pdf',
      savedAt: new Date().toISOString(),
    };
    safeSet(PDFS_KEY, [item, ...list]);
    toggleBookmarkApi(payload).catch((err) => console.error('DB bookmark save error:', err));
    return true; // saved
  }
}

export function removeSavedItem(type, key) {
  if (type === 'post') {
    const list = safeGet(POSTS_KEY).filter((p) => p.slug !== key);
    safeSet(POSTS_KEY, list);
    toggleBookmarkApi({ itemType: 'post', itemId: key }).catch((err) =>
      console.error('DB bookmark remove error:', err)
    );
  } else if (type === 'pdf') {
    const list = safeGet(PDFS_KEY).filter((p) => (p._id || p.id) !== key);
    safeSet(PDFS_KEY, list);
    toggleBookmarkApi({ itemType: 'pdf', itemId: key }).catch((err) =>
      console.error('DB bookmark remove error:', err)
    );
  }
}

export function clearAllSaved() {
  safeSet(POSTS_KEY, []);
  safeSet(PDFS_KEY, []);
  clearBookmarksApi().catch((err) => console.error('DB clear bookmarks error:', err));
}

export function getTotalSavedCount() {
  return safeGet(POSTS_KEY).length + safeGet(PDFS_KEY).length;
}

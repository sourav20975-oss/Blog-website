import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Auto-detect default API Base URL:
// 1. Check EXPO_PUBLIC_API_URL from .env
// 2. Fallback based on runtime environment (Android emulator: 10.0.2.2, iOS/Web: localhost)
const ENV_URL = process.env.EXPO_PUBLIC_API_URL;
const DEFAULT_URL =
  ENV_URL ||
  (Platform.OS === 'android' ? 'http://10.79.197.107:5000' : 'http://localhost:5000');

export let API_BASE = DEFAULT_URL;

const TOKEN_KEY = '@blogverse_token';
const USER_KEY = '@blogverse_user';
const SESSION_KEY = '@blogverse_session_id';

let cachedToken = null;
let cachedUser = null;
let cachedSessionId = null;

export async function getToken() {
  if (cachedToken) return cachedToken;
  try {
    cachedToken = await AsyncStorage.getItem(TOKEN_KEY);
    return cachedToken;
  } catch {
    return null;
  }
}

export async function getStoredUser() {
  if (cachedUser) return cachedUser;
  try {
    const raw = await AsyncStorage.getItem(USER_KEY);
    cachedUser = raw ? JSON.parse(raw) : null;
    return cachedUser;
  } catch {
    return null;
  }
}

export async function getSessionId() {
  if (cachedSessionId) return cachedSessionId;
  try {
    let sid = await AsyncStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid = 'mob_sess_' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
      await AsyncStorage.setItem(SESSION_KEY, sid);
    }
    cachedSessionId = sid;
    return sid;
  } catch {
    return 'mob_sess_fallback';
  }
}

export async function saveSession(token, user) {
  cachedToken = token;
  cachedUser = user;
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    /* storage write error */
  }
}

export async function clearSession() {
  cachedToken = null;
  cachedUser = null;
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
  } catch {
    /* storage remove error */
  }
}

async function authHeaders(extra = {}) {
  const [token, sessionId] = await Promise.all([getToken(), getSessionId()]);
  return {
    ...extra,
    'x-session-id': sessionId,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handle(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }
  return data;
}

// 60s timeout for server spin-up / free-tier
async function timedFetch(url, options = {}, ms = 60000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Server response timed out. Please try again.');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

// ================= POSTS API (Full CRUD) =================
export async function fetchPosts({ page = 1, limit = 6, q = '', category = '', tag = '', sort = 'newest' } = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (q) params.set('q', q);
  if (category && category !== 'All') params.set('category', category);
  if (tag) params.set('tag', tag);
  if (sort) params.set('sort', sort);
  const res = await timedFetch(`${API_BASE}/api/posts?${params.toString()}`);
  return handle(res);
}

export async function fetchPost(slug) {
  const res = await timedFetch(`${API_BASE}/api/posts/${slug}`);
  return handle(res);
}

export async function createPost(data) {
  const headers = await authHeaders({ 'Content-Type': 'application/json' });
  const res = await timedFetch(`${API_BASE}/api/posts`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  const created = await handle(res);
  notifySyncListeners('post_created', created);
  return created;
}

export async function updatePost(slug, data) {
  const headers = await authHeaders({ 'Content-Type': 'application/json' });
  const res = await timedFetch(`${API_BASE}/api/posts/${slug}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(data),
  });
  const updated = await handle(res);
  notifySyncListeners('post_updated', updated);
  return updated;
}

export async function deletePost(slug) {
  const headers = await authHeaders();
  const res = await timedFetch(`${API_BASE}/api/posts/${slug}`, {
    method: 'DELETE',
    headers,
  });
  const deleted = await handle(res);
  notifySyncListeners('post_deleted', { slug });
  return deleted;
}

export async function likePost(slug) {
  const headers = await authHeaders({ 'Content-Type': 'application/json' });
  const res = await timedFetch(`${API_BASE}/api/posts/${slug}/like`, {
    method: 'POST',
    headers,
  });
  const liked = await handle(res);
  notifySyncListeners('post_liked', { slug, likes: liked.likes });
  return liked;
}

// ================= COMMENTS API (MongoDB Discussions) =================
export async function fetchComments(slug) {
  const res = await timedFetch(`${API_BASE}/api/posts/${slug}/comments`);
  return handle(res);
}

export async function createComment(slug, data) {
  const headers = await authHeaders({ 'Content-Type': 'application/json' });
  const res = await timedFetch(`${API_BASE}/api/posts/${slug}/comments`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  const comment = await handle(res);
  notifySyncListeners('comment_created', { slug, comment });
  return comment;
}

export async function deleteComment(slug, commentId) {
  const headers = await authHeaders();
  const res = await timedFetch(`${API_BASE}/api/posts/${slug}/comments/${commentId}`, {
    method: 'DELETE',
    headers,
  });
  const result = await handle(res);
  notifySyncListeners('comment_deleted', { slug, commentId });
  return result;
}

// ================= BOOKMARKS API (MongoDB Persistent) =================
export async function fetchBookmarks() {
  const headers = await authHeaders();
  const res = await timedFetch(`${API_BASE}/api/bookmarks`, { headers });
  return handle(res);
}

export async function toggleBookmark(data) {
  const headers = await authHeaders({ 'Content-Type': 'application/json' });
  const res = await timedFetch(`${API_BASE}/api/bookmarks/toggle`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  const result = await handle(res);
  notifySyncListeners('bookmark_toggled', { ...data, saved: result.saved });
  return result;
}

export async function clearBookmarks() {
  const headers = await authHeaders();
  const res = await timedFetch(`${API_BASE}/api/bookmarks/clear`, {
    method: 'DELETE',
    headers,
  });
  const result = await handle(res);
  notifySyncListeners('bookmarks_cleared', {});
  return result;
}

// ================= HANDBOOKS & PDF API (GridFS 50MB) =================
export async function fetchPdfs({ page = 1, limit = 10, q = '', category = '', sort = 'newest' } = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (q) params.set('q', q);
  if (category && category !== 'All') params.set('category', category);
  if (sort) params.set('sort', sort);
  const res = await timedFetch(`${API_BASE}/api/pdfs?${params.toString()}`);
  return handle(res);
}

export async function fetchPdf(id) {
  const res = await timedFetch(`${API_BASE}/api/pdfs/${id}`);
  return handle(res);
}

export function getPdfViewUrl(id) {
  return `${API_BASE}/api/pdfs/${id}/view`;
}

export function getPdfDownloadUrl(id) {
  return `${API_BASE}/api/pdfs/${id}/download`;
}

// ================= IMAGE UPLOAD =================
export async function uploadImage({ uri, name, type }) {
  const headers = await authHeaders();
  const fd = new FormData();
  const filename = name || uri.split('/').pop() || 'upload.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const mimeType = type || (match ? `image/${match[1]}` : 'image/jpeg');

  fd.append('image', {
    uri,
    name: filename,
    type: mimeType,
  });

  const res = await timedFetch(`${API_BASE}/api/upload`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'multipart/form-data',
    },
    body: fd,
  });
  return handle(res);
}

// ================= AUTH API =================
export async function getCaptcha() {
  const res = await timedFetch(`${API_BASE}/api/auth/captcha`);
  return handle(res);
}

export async function signup(data) {
  const res = await timedFetch(`${API_BASE}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handle(res);
}

export async function login(data) {
  const res = await timedFetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handle(res);
}

export async function fetchMe(token) {
  const res = await timedFetch(`${API_BASE}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handle(res);
}

// ================= REAL-TIME SYNC SYSTEM =================
const syncListeners = new Set();

export function subscribeToLiveSync(listener) {
  syncListeners.add(listener);
  return () => {
    syncListeners.delete(listener);
  };
}

export function notifySyncListeners(event, payload) {
  syncListeners.forEach((listener) => {
    try {
      listener(event, payload);
    } catch {
      /* ignore listener error */
    }
  });
}

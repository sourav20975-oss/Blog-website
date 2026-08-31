import AsyncStorage from '@react-native-async-storage/async-storage';

// Securely read API Base URL from .env (EXPO_PUBLIC_API_URL)
export const API_BASE =
  process.env.EXPO_PUBLIC_API_URL || 'https://blog-website-jj8f.onrender.com';

const TOKEN_KEY = '@blogverse_token';
const USER_KEY = '@blogverse_user';

let cachedToken = null;
let cachedUser = null;

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
  const token = await getToken();
  return {
    ...extra,
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

// 60s timeout for free-tier spin-up
async function timedFetch(url, options = {}, ms = 60000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Server is taking too long to respond — please try again in a moment');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

// ---- Post API ----
export async function fetchPosts({ page = 1, limit = 6, q = '' } = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (q) params.set('q', q);
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

// React Native image upload to server via FormData
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

// ---- Auth API ----
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

// ---- Real-time sync listener system ----
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

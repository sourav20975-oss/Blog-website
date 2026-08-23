// Dev me vite proxy use hota hai (''). Production build me Render backend URL.
// VITE_API_URL se override bhi kar sakte ho.
const API_BASE =
  import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? '' : 'https://blog-website-jj8f.onrender.com');

const TOKEN_KEY = 'bv_token';
const USER_KEY = 'bv_user';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function saveSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function authHeaders(extra = {}) {
  const token = getToken();
  return {
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handle(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
}

// Free-tier servers cold-start slowly — 60s tak wait karo, phir friendly error
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

export function fetchPosts({ page = 1, limit = 6, q = '' } = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (q) params.set('q', q);
  return timedFetch(`${API_BASE}/api/posts?${params.toString()}`).then(handle);
}

export function fetchPost(slug) {
  return timedFetch(`${API_BASE}/api/posts/${slug}`).then(handle);
}

export function createPost(data) {
  return timedFetch(`${API_BASE}/api/posts`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(data),
  }).then(handle);
}

export function updatePost(slug, data) {
  return timedFetch(`${API_BASE}/api/posts/${slug}`, {
    method: 'PUT',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(data),
  }).then(handle);
}

export function deletePost(slug) {
  return timedFetch(`${API_BASE}/api/posts/${slug}`, {
    method: 'DELETE',
    headers: authHeaders(),
  }).then(handle);
}

export function uploadImage(file) {
  const fd = new FormData();
  fd.append('image', file);
  return timedFetch(`${API_BASE}/api/upload`, {
    method: 'POST',
    headers: authHeaders(),
    body: fd,
  }).then(handle);
}

// ---- Auth API ----
export function getCaptcha() {
  return timedFetch(`${API_BASE}/api/auth/captcha`).then(handle);
}

export function signup(data) {
  return timedFetch(`${API_BASE}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(handle);
}

export function login(data) {
  return timedFetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(handle);
}

export function fetchMe(token) {
  return timedFetch(`${API_BASE}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then(handle);
}

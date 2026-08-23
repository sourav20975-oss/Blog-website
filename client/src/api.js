// Dev me vite proxy use hota hai (''). Production build me Render backend URL.
// VITE_API_URL se override bhi kar sakte ho.
const API_BASE =
  import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? '' : 'https://blog-website-jj8f.onrender.com');

async function handle(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
}

export function fetchPosts() {
  return fetch(`${API_BASE}/api/posts`).then(handle);
}

export function fetchPost(slug) {
  return fetch(`${API_BASE}/api/posts/${slug}`).then(handle);
}

export function createPost(data) {
  return fetch(`${API_BASE}/api/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(handle);
}

export function updatePost(slug, data) {
  return fetch(`${API_BASE}/api/posts/${slug}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(handle);
}

export function deletePost(slug) {
  return fetch(`${API_BASE}/api/posts/${slug}`, { method: 'DELETE' }).then(handle);
}

export function uploadImage(file) {
  const fd = new FormData();
  fd.append('image', file);
  return fetch(`${API_BASE}/api/upload`, { method: 'POST', body: fd }).then(handle);
}

const BASE = '/api/posts';

async function handle(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
}

export function fetchPosts() {
  return fetch(BASE).then(handle);
}

export function fetchPost(slug) {
  return fetch(`${BASE}/${slug}`).then(handle);
}

export function createPost(data) {
  return fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(handle);
}

export function updatePost(slug, data) {
  return fetch(`${BASE}/${slug}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(handle);
}

export function deletePost(slug) {
  return fetch(`${BASE}/${slug}`, { method: 'DELETE' }).then(handle);
}

export function uploadImage(file) {
  const fd = new FormData();
  fd.append('image', file);
  return fetch('/api/upload', { method: 'POST', body: fd }).then(handle);
}

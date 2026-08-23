const crypto = require('crypto');
const svgCaptcha = require('svg-captcha');

// In-memory captcha store: id -> { answer, expiresAt }. Single-instance server ke liye kaafi.
const CAPTCHA_TTL_MS = 5 * 60 * 1000;
const store = new Map();

// Purane entries periodically clean karo
setInterval(() => {
  const now = Date.now();
  for (const [id, entry] of store) {
    if (entry.expiresAt < now) store.delete(id);
  }
}, 60 * 1000).unref();

function generateCaptcha() {
  const { data, text } = svgCaptcha.create({
    size: 5,
    noise: 3,
    color: true,
    background: '#f4f4f5',
    width: 160,
    height: 50,
  });
  const id = crypto.randomUUID();
  store.set(id, {
    answer: text.toLowerCase(),
    expiresAt: Date.now() + CAPTCHA_TTL_MS,
  });
  return { id, svg: data };
}

function verifyCaptcha(id, input) {
  if (!id || !input) return false;
  const entry = store.get(String(id));
  if (!entry) return false;
  store.delete(id); // one-time use
  if (entry.expiresAt < Date.now()) return false;
  return entry.answer === String(input).trim().toLowerCase();
}

module.exports = { generateCaptcha, verifyCaptcha, _store: store };

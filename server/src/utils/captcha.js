// Captcha store — in-memory, ek baar use hone wala, 5 min TTL
const svgCaptcha = require('svg-captcha');
const crypto = require('crypto');

const CAPTCHA_TTL_MS = 5 * 60 * 1000;
const store = new Map(); // id -> { text, expiresAt }

function cleanup() {
  const now = Date.now();
  for (const [id, entry] of store) {
    if (entry.expiresAt < now) store.delete(id);
  }
}

function generateCaptcha() {
  cleanup();
  const { data, text } = svgCaptcha.create({
    size: 5,
    noise: 3,
    color: true,
    background: '#f4f4f5',
  });
  const id = crypto.randomUUID();
  store.set(id, { text: String(text).toLowerCase(), expiresAt: Date.now() + CAPTCHA_TTL_MS });
  return { captchaId: id, svg: data };
}

// One-time use: verify hote hi entry delete (replay attack se bachav)
function verifyCaptcha(id, text) {
  if (!id || !text) return false;
  const entry = store.get(String(id));
  store.delete(String(id));
  if (!entry) return false;
  if (entry.expiresAt < Date.now()) return false;
  return String(text).trim().toLowerCase() === entry.text;
}

module.exports = { generateCaptcha, verifyCaptcha };

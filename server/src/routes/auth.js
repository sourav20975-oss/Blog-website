const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateCaptcha, verifyCaptcha } = require('../utils/captcha');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const EMAIL_RE = /^\S+@\S+\.\S+$/;

function signToken(user) {
  return jwt.sign(
    { id: user._id.toString(), email: user.email, name: user.name, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

// Admin kaun banega:
//  1. .env ke ADMIN_EMAILS (comma-separated) me email ho, YA
//  2. DB ka PEHLA user ho
async function resolveRole(email) {
  const adminEmails = String(process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (adminEmails.includes(email)) return 'admin';
  const count = await User.countDocuments();
  if (count === 0) return 'admin';
  return 'user';
}

// ---- Captcha ----
router.get('/captcha', (req, res) => {
  res.json(generateCaptcha());
});

// ---- Signup (email + password + captcha -> turant account ban jata hai) ----
router.post('/signup', async (req, res, next) => {
  try {
    const { name, email, password, captchaId, captchaText } = req.body || {};

    if (!verifyCaptcha(captchaId, captchaText)) {
      return res.status(400).json({ message: 'Incorrect captcha — try the new one', captchaFailed: true });
    }
    if (!name || String(name).trim().length < 2) {
      return res.status(400).json({ message: 'Name must be at least 2 characters' });
    }
    if (!email || !EMAIL_RE.test(String(email))) {
      return res.status(400).json({ message: 'Please enter a valid email' });
    }
    if (typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ message: 'This email is already registered — please log in' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      passwordHash,
      role: await resolveRole(normalizedEmail),
    });

    res.status(201).json({
      message: `Welcome to BlogVerse, ${user.name}!`,
      token: signToken(user),
      user: publicUser(user),
    });
  } catch (err) {
    next(err);
  }
});

// ---- Login ----
router.post('/login', async (req, res, next) => {
  try {
    const { email, password, captchaId, captchaText } = req.body || {};

    if (!verifyCaptcha(captchaId, captchaText)) {
      return res.status(400).json({ message: 'Incorrect captcha — try the new one', captchaFailed: true });
    }
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are both required' });
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    const valid =
      user &&
      (await bcrypt.compare(String(password), user.passwordHash));
    if (!valid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      message: `Welcome back, ${user.name}!`,
      token: signToken(user),
      user: publicUser(user),
    });
  } catch (err) {
    next(err);
  }
});

// ---- Current user (token check ke liye) ----
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

module.exports = router;

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { generateCaptcha, verifyCaptcha } = require('../utils/captcha');
const { sendOtpMail, isConfigured } = require('../utils/mailer');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const OTP_TTL_MINUTES = 10;
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

function validatePassword(pw) {
  return typeof pw === 'string' && pw.length >= 8;
}

async function issueAndSendOtp(user) {
  const otp = String(crypto.randomInt(100000, 999999));
  const otpHash = await bcrypt.hash(otp, 8);
  user.otpHash = otpHash;
  user.otpExpiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);
  await user.save();
  const { delivered } = await sendOtpMail(user.email, user.name, otp);
  // devOtp sirf LOCAL development ke liye - production me kabhi response me nahi jata
  const isDev = process.env.NODE_ENV !== 'production';
  return { delivered, devOtp: !delivered && isDev ? otp : undefined };
}

// ---- Captcha ----
router.get('/captcha', (req, res) => {
  res.json(generateCaptcha());
});

// ---- Signup (step 1: OTP bhejo) ----
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
    if (!validatePassword(password)) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    let user = await User.findOne({ email: normalizedEmail });

    if (user && user.isVerified) {
      return res.status(409).json({ message: 'This email is already registered — please log in' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    if (user) {
      // unverified purana record -> details refresh karke fresh OTP
      user.name = String(name).trim();
      user.passwordHash = passwordHash;
    } else {
      user = new User({
        name: String(name).trim(),
        email: normalizedEmail,
        passwordHash,
        role: await resolveRole(normalizedEmail),
      });
    }
    await user.save();

    const { delivered, devOtp } = await issueAndSendOtp(user);
    res.status(201).json({
      message: delivered
        ? `OTP sent to ${normalizedEmail} — verify within 10 minutes`
        : 'OTP generated (SMTP not configured — check server console)',
      email: normalizedEmail,
      devOtp,
    });
  } catch (err) {
    next(err);
  }
});

// ---- Verify OTP (step 2) ----
router.post('/verify-otp', async (req, res, next) => {
  try {
    const { email, otp } = req.body || {};
    if (!email || !EMAIL_RE.test(String(email))) {
      return res.status(400).json({ message: 'Please enter a valid email' });
    }
    if (!otp || !/^\d{6}$/.test(String(otp).trim())) {
      return res.status(400).json({ message: 'Enter the 6-digit OTP' });
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ message: 'Please sign up first' });
    }
    if (user.isVerified) {
      return res.json({ message: 'Already verified — you can log in' });
    }
    if (!user.otpHash || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      return res.status(400).json({ message: 'OTP has expired — request a new one', expired: true });
    }

    const ok = await bcrypt.compare(String(otp).trim(), user.otpHash);
    if (!ok) {
      return res.status(400).json({ message: 'Incorrect OTP' });
    }

    user.isVerified = true;
    user.otpHash = null;
    user.otpExpiresAt = null;
    await user.save();

    res.json({
      message: 'Email verified! Welcome to BlogVerse 🎉',
      token: signToken(user),
      user: publicUser(user),
    });
  } catch (err) {
    next(err);
  }
});

// ---- Resend OTP ----
router.post('/resend-otp', async (req, res, next) => {
  try {
    const { email } = req.body || {};
    if (!email || !EMAIL_RE.test(String(email))) {
      return res.status(400).json({ message: 'Please enter a valid email' });
    }
    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user) return res.status(404).json({ message: 'Please sign up first' });
    if (user.isVerified) return res.status(400).json({ message: 'Already verified — you can log in' });

    const { delivered, devOtp } = await issueAndSendOtp(user);
    res.json({
      message: delivered ? 'A new OTP has been sent' : 'New OTP generated (check server console)',
      devOtp,
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
    if (!user.isVerified) {
      return res.status(403).json({ message: 'Email not verified — verify the OTP first', needsVerification: true });
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

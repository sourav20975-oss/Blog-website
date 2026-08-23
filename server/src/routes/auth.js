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
  // SMTP configured nahi hai to dev testing ke liye OTP response me bhej do
  return { delivered, devOtp: delivered ? undefined : otp };
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
      return res.status(400).json({ message: 'Captcha galat hai — naya captcha try karo', captchaFailed: true });
    }
    if (!name || String(name).trim().length < 2) {
      return res.status(400).json({ message: 'Name kam se kam 2 characters ka hona chahiye' });
    }
    if (!email || !EMAIL_RE.test(String(email))) {
      return res.status(400).json({ message: 'Valid email daalo' });
    }
    if (!validatePassword(password)) {
      return res.status(400).json({ message: 'Password kam se kam 8 characters ka hona chahiye' });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    let user = await User.findOne({ email: normalizedEmail });

    if (user && user.isVerified) {
      return res.status(409).json({ message: 'Ye email already registered hai — login karo' });
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
      message: isConfigured() && delivered
        ? `OTP ${normalizedEmail} par bhej diya — 10 min me verify karo`
        : 'OTP generated (SMTP not configured — server console check karo)',
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
      return res.status(400).json({ message: 'Valid email daalo' });
    }
    if (!otp || !/^\d{6}$/.test(String(otp).trim())) {
      return res.status(400).json({ message: '6-digit OTP daalo' });
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ message: 'Pehle signup karo' });
    }
    if (user.isVerified) {
      return res.json({ message: 'Already verified — login kar sakte ho' });
    }
    if (!user.otpHash || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      return res.status(400).json({ message: 'OTP expire ho gaya — naya bhejwa lo', expired: true });
    }

    const ok = await bcrypt.compare(String(otp).trim(), user.otpHash);
    if (!ok) {
      return res.status(400).json({ message: 'OTP galat hai' });
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
      return res.status(400).json({ message: 'Valid email daalo' });
    }
    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user) return res.status(404).json({ message: 'Pehle signup karo' });
    if (user.isVerified) return res.status(400).json({ message: 'Already verified — login karo' });

    const { delivered, devOtp } = await issueAndSendOtp(user);
    res.json({
      message: delivered ? 'Naya OTP bhej diya' : 'Naya OTP generated (server console dekho)',
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
      return res.status(400).json({ message: 'Captcha galat hai — naya captcha try karo', captchaFailed: true });
    }
    if (!email || !password) {
      return res.status(400).json({ message: 'Email aur password dono required hain' });
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    const valid =
      user &&
      (await bcrypt.compare(String(password), user.passwordHash));
    if (!valid) {
      return res.status(401).json({ message: 'Email ya password galat hai' });
    }
    if (!user.isVerified) {
      return res.status(403).json({ message: 'Email verified nahi hai — pehle OTP verify karo', needsVerification: true });
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

require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const postsRouter = require('./routes/posts');
const uploadRouter = require('./routes/upload');
const authRouter = require('./routes/auth');
const path = require('path');
const dns = require('dns');


dns.setServers(["1.1.1.1", "8.8.8.8"]);

function buildApp() {
  const app = express();

  // Render ke reverse proxy ke peeche sahi IP ke liye (rate limiting accurate rahe)
  app.set('trust proxy', 1);

  // Security headers. CSP off (API + cross-origin images), CORP cross-origin taaki
  // /uploads ki images frontend domain se load ho sakein.
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginEmbedderPolicy: false,
    })
  );

  app.use(cors());

  // General rate limit
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests — please slow down' },
  });
  app.use(globalLimiter);

  app.use(express.json({ limit: '2mb' }));

  // Auth routes pe stricter limit (brute-force protection)
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Auth attempt limit reached — try again in 15 minutes' },
  });
  const otpLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 6,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'OTP limit reached — please try again later' },
  });

  app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
  app.get('/api/health', (req, res) => res.json({ ok: true }));
  app.use('/api/auth', authLimiter, authRouter);
  app.use('/api/posts', postsRouter);
  app.use('/api/upload', uploadRouter);

  app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: err.message });
  });
  return app;
}

async function start({ port } = {}) {
  const { connectDB } = require('./db');
  await connectDB();
  const app = buildApp();
  const PORT = port || process.env.PORT || 5000;
  return new Promise((resolve) => {
    const server = app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      resolve(server);
    });
  });
}

module.exports = { buildApp, start };

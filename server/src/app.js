require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const postsRouter = require('./routes/posts');
const uploadRouter = require('./routes/upload');
const authRouter = require('./routes/auth');
const pdfsRouter = require('./routes/pdfs');
const bookmarksRouter = require('./routes/bookmarks');
const path = require('path');
const dns = require('dns');

dns.setServers(['1.1.1.1', '8.8.8.8']);

if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}

function buildApp() {
  const app = express();

  app.set('trust proxy', 1);

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginEmbedderPolicy: false,
      frameguard: false, // Allow cross-origin PDF embedding in iframes from frontend domain
    })
  );

  const allowedOrigins = [
    'https://blog-website-1-ez1y.onrender.com',
    'https://blog-website-jj8f.onrender.com',
  ];

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
    })
  );

  // General rate limit
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests — please slow down' },
  });
  app.use(globalLimiter);

  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // Auth rate limiter
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Auth attempt limit reached — try again in 15 minutes' },
  });

  // Static uploads directory for local fallback
  app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

  // Routes
  app.get('/api/health', (req, res) => res.json({ ok: true, timestamp: new Date() }));
  app.use('/api/auth', authLimiter, authRouter);
  app.use('/api/posts', postsRouter);
  app.use('/api/pdfs', pdfsRouter);
  app.use('/api/upload', uploadRouter);
  app.use('/api/bookmarks', bookmarksRouter);

  app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
  app.use((err, req, res, next) => {
    console.error('Server error handler:', err);
    res.status(500).json({ message: err.message || 'Internal server error' });
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

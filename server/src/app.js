require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const postsRouter = require('./routes/posts');
const uploadRouter = require('./routes/upload');
const path = require('path');
const dns = require('dns');


dns.setServers(["1.1.1.1", "8.8.8.8"]);

function buildApp() {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '2mb' }));

  app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
  app.get('/api/health', (req, res) => res.json({ ok: true }));
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

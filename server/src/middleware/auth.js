const jwt = require('jsonwebtoken');
const User = require('../models/User');

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ message: 'Login required' });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    User.findById(payload.id)
      .select('-passwordHash')
      .then((user) => {
        if (!user) {
          return res.status(401).json({ message: 'Login required' });
        }
        req.user = user;
        next();
      })
      .catch(next);
  } catch {
    return res.status(401).json({ message: 'Session expired — please log in again' });
  }
}

// Login ke BAAD role check — sirf admin aage badh sakta hai
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}

module.exports = { requireAuth, requireAdmin };

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'flexfit-user-secret-change-in-production';

export function signUserToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}

function readUserToken(req) {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7) : null;
}

export function optionalUser(req, res, next) {
  const token = readUserToken(req);
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role === 'user') req.user = decoded;
  } catch {
    /* guest checkout — ignore invalid token */
  }
  next();
}

export function requireUser(req, res, next) {
  const token = readUserToken(req);
  if (!token) {
    return res.status(401).json({ error: 'Please login to continue' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'user') {
      return res.status(401).json({ error: 'Invalid session' });
    }
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Session expired. Please login again.' });
  }
}

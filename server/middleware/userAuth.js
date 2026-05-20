import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'flexfit-user-secret-change-in-production';

export function signUserToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}

export function requireUser(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

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

const jwt = require('jsonwebtoken');
const JWT_SECRET = 'superSecretKey'; // keep in sync with auth.js

module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];  // expecting "Bearer <token>"
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;  // attach user info to req
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};
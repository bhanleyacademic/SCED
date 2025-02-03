const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');   // If using hashed passwords
const jwt = require('jsonwebtoken'); // If using JWT
// This is just an example – adapt to your authentication method

// Hardcoded single admin for demonstration.
// In a production setting, store credentials in a database or environment variable
const ADMIN_USER = {
  username: 'admin',
  // e.g. hashed version of "password" using bcrypt
  passwordHash: '$2a$10$zSJJ7YR97NkQ.mhxMsCM6.E9N0AJ/h6Ude09gLciafr30Gbh8.Gs2',
};

// JWT secret key – in production, keep it in an env variable!
const JWT_SECRET = 'superSecretKey';

// Login endpoint
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Validate user
  if (username === ADMIN_USER.username) {
    const isMatch = await bcrypt.compare(password, ADMIN_USER.passwordHash);
    if (isMatch) {
      // Create JWT
      const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '2h' });
      return res.json({ success: true, token });
    }
  }
  return res.status(401).json({ success: false, message: 'Invalid credentials' });
});

// Logout or token invalidation can be handled front-end side or by blacklisting tokens on server
// For a minimal example, you might not have a /logout route

module.exports = router;

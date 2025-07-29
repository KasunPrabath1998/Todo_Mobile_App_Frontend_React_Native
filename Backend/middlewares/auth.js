const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  console.log('Authorization Header:', authHeader);
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
  console.log('Extracted Token:', token);

  if (!token) {
    return res.status(401).json({ message: 'Access Denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Invalid token:', err);
    res.status(401).json({ message: 'Invalid token.' });
  }
};

module.exports = authenticate;

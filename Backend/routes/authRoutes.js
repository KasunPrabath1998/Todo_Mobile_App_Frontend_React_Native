// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { signup, verifyEmail, login, getUserById } = require('../controllers/authController');

// Signup route
router.post('/signup', signup);

// Email verification route
router.get('/verify-email', verifyEmail);

// Login route
router.post('/login', login);

router.get('/users/:userId', getUserById);

module.exports = router;

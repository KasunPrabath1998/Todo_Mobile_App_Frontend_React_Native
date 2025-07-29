const express = require('express');
const router = express.Router();
const { getUserById, updateProfile } = require('../controllers/userController'); // Ensure this import is correct
const authenticate = require('../middlewares/auth');
const upload = require('../middlewares/upload');

// Route to get user by ID
router.get('/:userId', authenticate, getUserById);

// Route to update user profile
router.put('/updateProfile/:userId', upload.single('profileImage'), updateProfile); // Use updateProfile directly

module.exports = router;

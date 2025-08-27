// backend/routes/authRoutes.js
const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware'); // Import protect middleware

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

// New route to get the current user's data
// It's protected, so only logged-in users can access it.
router.get('/me', authMiddleware.protect, authController.getMe);

module.exports = router;

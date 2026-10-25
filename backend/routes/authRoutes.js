// backend/routes/authRoutes.js
const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

router.post('/signup', authLimiter, authController.signup);
router.post('/login', authLimiter, authController.login);
router.get('/logout', authController.logout);
router.post('/logout', authController.logout);
router.get('/me', authMiddleware.protect, authController.getMe);
router.patch('/me', authMiddleware.protect, authController.updateMe);
router.delete('/me', authLimiter, authMiddleware.protect, authController.deleteMe);
router.get('/me/summary', authMiddleware.protect, authController.getMySummary);
router.patch('/updateMyPassword', authLimiter, authMiddleware.protect, authController.updateMyPassword);

module.exports = router;

// backend/routes/contactRoutes.js
const express = require('express');
const contactController = require('../controllers/contactController');
const authMiddleware = require('../middleware/authMiddleware');
const { contactLimiter } = require('../middleware/rateLimiters');

const router = express.Router();
router.post('/', contactLimiter, authMiddleware.optionalProtect, contactController.createMessage);

module.exports = router;

// backend/routes/statsRoutes.js
const express = require('express');
const statsController = require('../controllers/statsController');
const authMiddleware = require('../middleware/authMiddleware');
const { visitLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

// Anyone can record a visit; if a valid cookie exists the visit is linked to the user.
router.post('/visit', visitLimiter, authMiddleware.optionalProtect, statsController.recordVisit);
router.get('/summary', statsController.getSiteSummary);

module.exports = router;

// backend/routes/aiRoutes.js
const express = require('express');
const aiController = require('../controllers/aiController');
const authMiddleware = require('../middleware/authMiddleware');
const { aiLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

router.get('/status', aiController.status); // public: lets the UI hide AI buttons when not configured

router.use(authMiddleware.protect, aiLimiter);
router.post('/explain-results', aiController.explainResults);
router.post('/chat', aiController.chat);
router.post('/summarize-feedback', authMiddleware.restrictTo('admin'), aiController.summarizeFeedback);

module.exports = router;

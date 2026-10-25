// backend/routes/feedbackRoutes.js
const express = require('express');
const feedbackController = require('../controllers/feedbackController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateModelName } = require('../middleware/validate');

const router = express.Router();

// Logged-in user routes (declared BEFORE the public "/:modelName" so "/user/..." is never swallowed)
router.post('/', authMiddleware.protect, feedbackController.submitOrUpdateFeedback);
router.get('/user/:modelName', authMiddleware.protect, validateModelName, feedbackController.getCurrentUserFeedbackForModel);

// Public: feedback list for a model (non-archived, names only)
router.get('/:modelName', validateModelName, feedbackController.getFeedbackForModel);

module.exports = router;

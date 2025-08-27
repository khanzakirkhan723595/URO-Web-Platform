// backend/routes/feedbackRoutes.js
const express = require('express');
const feedbackController = require('../controllers/feedbackController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Public route to get all (non-archived) feedback for a specific model
router.get('/:modelName', feedbackController.getFeedbackForModel);

// All routes below this require user to be logged in
router.use(authMiddleware.protect);

// User submits new feedback or updates their existing feedback for a model
router.post('/', feedbackController.submitOrUpdateFeedback); // Changed controller

// Get the current logged-in user's feedback for a specific model
router.get('/user/:modelName', feedbackController.getCurrentUserFeedbackForModel);


module.exports = router;

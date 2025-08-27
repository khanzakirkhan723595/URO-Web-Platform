// backend/routes/historyRoutes.js
const express = require('express');
const historyController = require('../controllers/historyController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// All history routes require user to be logged in
router.use(authMiddleware.protect);

// GET /api/history/:modelName - Fetches history for a specific model for the logged-in user
router.get('/:modelName', historyController.getSimulationHistoryForModel);

module.exports = router;

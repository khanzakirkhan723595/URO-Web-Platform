// backend/routes/modelRoutes.js
const express = require('express');
const modelController = require('../controllers/modelController');
const uploadFilesMiddleware = require('../middleware/uploadMiddleware');
const authMiddleware = require('../middleware/authMiddleware');
const { modelRunLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

// Order matters: authenticate FIRST, then limit, then accept files.
router.post('/run', authMiddleware.protect, modelRunLimiter, uploadFilesMiddleware, modelController.runModelController);

module.exports = router;

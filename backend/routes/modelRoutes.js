// backend/routes/modelRoutes.js
const express = require('express');
const router = express.Router();
const modelController = require('../controllers/modelController');
const uploadFilesMiddleware = require('../middleware/uploadMiddleware');
const authMiddleware = require('../middleware/authMiddleware'); // Import auth middleware

// POST /api/model/run
// Handles file uploads and triggers the model execution.
// Now protected to ensure req.user is available for saving history.
router.post('/run', authMiddleware.protect, uploadFilesMiddleware, modelController.runModelController);

module.exports = router;

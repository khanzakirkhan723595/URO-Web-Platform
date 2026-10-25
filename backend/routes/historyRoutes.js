// backend/routes/historyRoutes.js
const express = require('express');
const historyController = require('../controllers/historyController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateModelName, validateObjectId } = require('../middleware/validate');

const router = express.Router();

router.use(authMiddleware.protect);
router.delete('/item/:id', validateObjectId(), historyController.deleteHistoryItem);
router.get('/:modelName', validateModelName, historyController.getSimulationHistoryForModel);

module.exports = router;

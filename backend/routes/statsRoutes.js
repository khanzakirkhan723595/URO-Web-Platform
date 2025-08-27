// backend/routes/statsRoutes.js
const express = require('express');
const statsController = require('../controllers/statsController');
const authMiddleware = require('../middleware/authMiddleware'); // For optionally getting user ID

const router = express.Router();

// Record a visit - can be public or optionally protected if you want to associate with user
// Using optional protect: if token is valid, req.user is set, otherwise it's null.
// The controller should handle req.user being null.
const optionalProtect = (req, res, next) => {
  // This is a simplified optional protect.
  // A more robust one would not error if token is invalid/missing but just not set req.user.
  // For now, we'll assume public access for visit recording, controller checks req.user.
  next(); 
};

router.post('/visit', optionalProtect, statsController.recordVisit); // Anyone can trigger a visit record
router.get('/summary', statsController.getSiteSummary); // Public summary stats

// If you want admin-only detailed stats, add them to adminRoutes.js
// and protect with authMiddleware.protect and authMiddleware.authorizeAdmin

module.exports = router;

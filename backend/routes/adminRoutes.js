// backend/routes/adminRoutes.js
const express = require('express');
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all admin routes: user must be logged in AND be an admin
router.use(authMiddleware.protect);
router.use(authMiddleware.authorizeAdmin);

// Feedback Management
router.get('/feedback', adminController.getAllFeedback);
router.put('/feedback/:id/reply', adminController.replyToFeedback); // For adding a reply
router.patch('/feedback/:id/status', adminController.updateFeedbackStatus); // For changing status (seen, archived)


// Site Statistics
router.get('/stats', adminController.getAdminSiteStats);

// User Management
router.get('/users', adminController.getAllUsers);
router.patch('/users/:id/role', adminController.updateUserRole);


// Contact & Team Requests (Placeholders)
router.get('/contact-requests', adminController.getContactRequests);
router.get('/team-applications', adminController.getTeamApplications);

// Recent Activity (Placeholder)
router.get('/recent-activity', adminController.getRecentActivity);


module.exports = router;

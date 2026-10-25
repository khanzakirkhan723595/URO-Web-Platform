// backend/routes/adminRoutes.js
const express = require('express');
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateObjectId } = require('../middleware/validate');

const router = express.Router();

// Every admin route: logged in AND admin
router.use(authMiddleware.protect, authMiddleware.restrictTo('admin'));

router.get('/feedback', adminController.getAllFeedback);
router.put('/feedback/:id/reply', validateObjectId(), adminController.replyToFeedback);
router.patch('/feedback/:id/status', validateObjectId(), adminController.updateFeedbackStatus);

router.get('/stats', adminController.getAdminSiteStats);

router.get('/users', adminController.getAllUsers);
router.patch('/users/:id/role', validateObjectId(), adminController.updateUserRole);

router.get('/contact-requests', adminController.getContactRequests);
router.patch('/contact-requests/:id/status', validateObjectId(), adminController.updateContactStatus);
router.get('/team-applications', adminController.getTeamApplications);
router.get('/recent-activity', adminController.getRecentActivity);

module.exports = router;

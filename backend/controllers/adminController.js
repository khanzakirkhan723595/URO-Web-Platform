// backend/controllers/adminController.js
const Feedback = require('../models/Feedback');
const User = require('../models/User');
const VisitorLog = require('../models/VisitorLog');
// const ContactRequest = require('../models/ContactRequest'); // TODO: Create this model
// const TeamApplication = require('../models/TeamApplication'); // TODO: Create this model

// --- Feedback Management ---
exports.getAllFeedback = async (req, res, next) => {
  try {
    const feedbacks = await Feedback.find()
      .populate('user', 'name email') // Populate user details
      .populate('repliedBy', 'name email') // Populate admin who replied
      .sort('-createdAt'); // Sort by newest first

    res.status(200).json({
      status: 'success',
      results: feedbacks.length,
      data: {
        feedbacks,
      },
    });
  } catch (error) {
    console.error('ADMIN GET ALL FEEDBACK ERROR:', error);
    res.status(500).json({ status: 'error', message: 'Could not retrieve feedback.' });
  }
};

exports.replyToFeedback = async (req, res, next) => {
  try {
    const feedbackId = req.params.id;
    const { adminReply } = req.body;

    if (!adminReply) {
      return res.status(400).json({ status: 'fail', message: 'Admin reply content is required.' });
    }

    const feedback = await Feedback.findById(feedbackId);
    if (!feedback) {
      return res.status(404).json({ status: 'fail', message: 'Feedback not found.' });
    }

    feedback.adminReply = adminReply;
    feedback.status = 'replied';
    feedback.repliedAt = Date.now();
    feedback.repliedBy = req.user.id; // Admin user making the reply

    await feedback.save();

    res.status(200).json({
      status: 'success',
      data: {
        feedback,
      },
    });
  } catch (error) {
    console.error('ADMIN REPLY TO FEEDBACK ERROR:', error);
    res.status(500).json({ status: 'error', message: 'Could not update feedback with reply.' });
  }
};

exports.updateFeedbackStatus = async (req, res, next) => {
    try {
        const feedbackId = req.params.id;
        const { status } = req.body; // e.g., "seen", "archived"

        if (!status || !['new', 'seen', 'replied', 'archived'].includes(status)) {
            return res.status(400).json({ status: 'fail', message: 'Valid status is required.' });
        }

        const feedback = await Feedback.findByIdAndUpdate(feedbackId, { status }, {
            new: true, // Return the updated document
            runValidators: true,
        });

        if (!feedback) {
            return res.status(404).json({ status: 'fail', message: 'Feedback not found.' });
        }
        res.status(200).json({ status: 'success', data: { feedback } });
    } catch (error) {
        console.error('ADMIN UPDATE FEEDBACK STATUS ERROR:', error);
        res.status(500).json({ status: 'error', message: 'Could not update feedback status.' });
    }
};


// --- Site Statistics (Detailed for Admin) ---
// The public /api/stats/summary is already created.
// This could be for more detailed or user-specific stats if needed.
exports.getAdminSiteStats = async (req, res, next) => {
  try {
    const totalPageHits = await VisitorLog.countDocuments();
    const uniqueIPs = await VisitorLog.distinct('ipAddress');
    const totalRegisteredUsers = await User.countDocuments();
    const totalFeedbackItems = await Feedback.countDocuments();
    const newFeedbackItems = await Feedback.countDocuments({ status: 'new' });

    // More stats can be added:
    // - Page hits per page
    // - Active users in last X days
    // - User growth over time

    res.status(200).json({
      status: 'success',
      data: {
        totalPageHits,
        totalUniqueIPs: uniqueIPs.length,
        totalRegisteredUsers,
        totalFeedbackItems,
        newFeedbackItems,
      },
    });
  } catch (error) {
    console.error('ADMIN GET SITE STATS ERROR:', error);
    res.status(500).json({ status: 'error', message: 'Could not retrieve site statistics for admin.' });
  }
};

// --- User Management (Placeholder) ---
exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find().select('-password').sort('name'); // Exclude passwords
        res.status(200).json({
            status: 'success',
            results: users.length,
            data: { users }
        });
    } catch (error) {
        console.error('ADMIN GET ALL USERS ERROR:', error);
        res.status(500).json({ status: 'error', message: 'Could not retrieve users.' });
    }
};

exports.updateUserRole = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const { role } = req.body;
        if (!role || !['user', 'admin'].includes(role)) {
            return res.status(400).json({ status: 'fail', message: 'Valid role (user, admin) is required.' });
        }
        const user = await User.findByIdAndUpdate(userId, { role }, {
            new: true,
            runValidators: true
        }).select('-password');

        if (!user) {
            return res.status(404).json({ status: 'fail', message: 'User not found.' });
        }
        res.status(200).json({ status: 'success', data: { user } });
    } catch (error) {
        console.error('ADMIN UPDATE USER ROLE ERROR:', error);
        res.status(500).json({ status: 'error', message: 'Could not update user role.' });
    }
};


// --- Contact/Team Requests (Placeholders - requires models and more logic) ---
exports.getContactRequests = async (req, res, next) => {
  // TODO: Implement after creating ContactRequest model
  res.status(501).json({ status: 'fail', message: 'Contact requests endpoint not yet implemented.' });
};

exports.getTeamApplications = async (req, res, next) => {
  // TODO: Implement after creating TeamApplication model
  res.status(501).json({ status: 'fail', message: 'Team applications endpoint not yet implemented.' });
};

// --- Recent Activity (Placeholder - requires logging strategy) ---
exports.getRecentActivity = async (req, res, next) => {
  // TODO: Implement a logging mechanism for important site activities
  res.status(501).json({ status: 'fail', message: 'Recent activity endpoint not yet implemented.' });
};

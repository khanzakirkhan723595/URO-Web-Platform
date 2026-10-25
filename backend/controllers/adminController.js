// backend/controllers/adminController.js
const Feedback = require('../models/Feedback');
const User = require('../models/User');
const VisitorLog = require('../models/VisitorLog');
const ContactMessage = require('../models/ContactMessage');
const AppError = require('../utils/AppError');

const FEEDBACK_STATUSES = ['new', 'seen', 'replied', 'archived'];

// --- Feedback Management ---
exports.getAllFeedback = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status && FEEDBACK_STATUSES.includes(req.query.status)) filter.status = req.query.status;

    const feedbacks = await Feedback.find(filter)
      .populate('user', 'name email')
      .populate('repliedBy', 'name email')
      .sort('-createdAt')
      .limit(1000)
      .lean();

    res.status(200).json({ status: 'success', results: feedbacks.length, data: { feedbacks } });
  } catch (error) {
    next(error);
  }
};

exports.replyToFeedback = async (req, res, next) => {
  try {
    const { adminReply } = req.body;
    if (typeof adminReply !== 'string' || !adminReply.trim()) {
      return next(new AppError('Admin reply content is required.', 400));
    }
    if (adminReply.length > 2000) return next(new AppError('Reply is too long (max 2000 characters).', 400));

    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { adminReply: adminReply.trim(), status: 'replied', repliedAt: new Date(), repliedBy: req.user.id },
      { new: true, runValidators: true }
    )
      .populate('user', 'name email')
      .populate('repliedBy', 'name email');

    if (!feedback) return next(new AppError('Feedback not found.', 404));
    res.status(200).json({ status: 'success', data: { feedback } });
  } catch (error) {
    next(error);
  }
};

exports.updateFeedbackStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!FEEDBACK_STATUSES.includes(status)) return next(new AppError('Valid status is required.', 400));

    const feedback = await Feedback.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true })
      .populate('user', 'name email')
      .populate('repliedBy', 'name email');

    if (!feedback) return next(new AppError('Feedback not found.', 404));
    res.status(200).json({ status: 'success', data: { feedback } });
  } catch (error) {
    next(error);
  }
};

// --- Site Statistics ---
exports.getAdminSiteStats = async (req, res, next) => {
  try {
    // Independent queries run in parallel (much faster than awaiting one by one)
    const [totalPageHits, uniqueIPs, totalRegisteredUsers, totalFeedbackItems, newFeedbackItems, newMessages] = await Promise.all([
      VisitorLog.estimatedDocumentCount(),
      VisitorLog.distinct('ipAddress'),
      User.estimatedDocumentCount(),
      Feedback.estimatedDocumentCount(),
      Feedback.countDocuments({ status: 'new' }),
      ContactMessage.countDocuments({ status: 'new' }),
    ]);

    res.status(200).json({
      status: 'success',
      data: { totalPageHits, totalUniqueIPs: uniqueIPs.length, totalRegisteredUsers, totalFeedbackItems, newFeedbackItems, newMessages },
    });
  } catch (error) {
    next(error);
  }
};

// --- User Management ---
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort('name').limit(1000).lean();
    res.status(200).json({ status: 'success', results: users.length, data: { users } });
  } catch (error) {
    next(error);
  }
};

exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) return next(new AppError('Valid role (user, admin) is required.', 400));

    // Safety: an admin cannot remove their own admin rights (prevents locking everyone out)
    if (req.params.id === req.user.id && role !== 'admin') {
      return next(new AppError('You cannot remove your own admin role.', 400));
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true, runValidators: true }).select('-password');
    if (!user) return next(new AppError('User not found.', 404));
    res.status(200).json({ status: 'success', data: { user } });
  } catch (error) {
    next(error);
  }
};

// --- Placeholders ---
const notImplemented = (name) => (req, res) =>
  res.status(501).json({ status: 'fail', message: `${name} endpoint not yet implemented.` });
exports.getContactRequests = async (req, res, next) => {
  try {
    const messages = await ContactMessage.find().sort('-createdAt').limit(500).lean();
    res.status(200).json({ status: 'success', results: messages.length, data: { messages } });
  } catch (error) {
    next(error);
  }
};

exports.updateContactStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['new', 'read', 'archived'].includes(status)) return next(new AppError('Valid status is required.', 400));
    const message = await ContactMessage.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
    if (!message) return next(new AppError('Message not found.', 404));
    res.status(200).json({ status: 'success', data: { message } });
  } catch (error) {
    next(error);
  }
};
exports.getTeamApplications = notImplemented('Team applications');
exports.getRecentActivity = notImplemented('Recent activity');

// backend/controllers/feedbackController.js
const Feedback = require('../models/Feedback');
const AppError = require('../utils/AppError');

// Public lists show only the author's NAME (never e-mail addresses).
const PUBLIC_USER_FIELDS = 'name';
const OWN_USER_FIELDS = 'name email';

exports.submitOrUpdateFeedback = async (req, res, next) => {
  try {
    const { modelName, rating, comment } = req.body;

    if (typeof modelName !== 'string' || !/^[A-Za-z0-9_-]{1,50}$/.test(modelName)) {
      return next(new AppError('A valid model name is required.', 400));
    }
    if (typeof rating !== 'number' || !Number.isFinite(rating) || rating < 1 || rating > 5) {
      return next(new AppError('Rating must be a number between 1 and 5.', 400));
    }
    if (comment !== undefined && comment !== null && (typeof comment !== 'string' || comment.length > 1000)) {
      return next(new AppError('Comment must be text of at most 1000 characters.', 400));
    }

    // Single atomic upsert: no race between "find" and "create"
    const existing = await Feedback.exists({ user: req.user.id, modelName });
    const feedback = await Feedback.findOneAndUpdate(
      { user: req.user.id, modelName },
      { $set: { rating, comment: (comment || '').trim(), updatedAt: new Date() }, $setOnInsert: { status: 'new', createdAt: new Date() } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    )
      .populate('user', OWN_USER_FIELDS)
      .populate('repliedBy', PUBLIC_USER_FIELDS);

    res.status(existing ? 200 : 201).json({
      status: 'success',
      message: existing ? 'Feedback updated successfully.' : 'Feedback submitted successfully.',
      data: { feedback },
    });
  } catch (error) {
    next(error);
  }
};

exports.getFeedbackForModel = async (req, res, next) => {
  try {
    const feedbacks = await Feedback.find({ modelName: req.params.modelName, status: { $ne: 'archived' } })
      .populate('user', PUBLIC_USER_FIELDS)
      .populate('repliedBy', PUBLIC_USER_FIELDS)
      .sort('-createdAt')
      .limit(200)
      .lean();

    res.status(200).json({ status: 'success', results: feedbacks.length, data: { feedbacks } });
  } catch (error) {
    next(error);
  }
};

exports.getCurrentUserFeedbackForModel = async (req, res, next) => {
  try {
    const feedback = await Feedback.findOne({ user: req.user.id, modelName: req.params.modelName })
      .populate('user', OWN_USER_FIELDS)
      .populate('repliedBy', PUBLIC_USER_FIELDS);

    res.status(200).json({ status: 'success', data: { feedback: feedback || null } });
  } catch (error) {
    next(error);
  }
};

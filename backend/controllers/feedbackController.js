// backend/controllers/feedbackController.js
const Feedback = require('../models/Feedback');

// Handles both creating new feedback and updating existing feedback by a user for a model
exports.submitOrUpdateFeedback = async (req, res, next) => {
  try {
    const { modelName, rating, comment } = req.body;
    const userId = req.user.id; // From protect middleware

    if (!modelName || rating === undefined) {
      return res.status(400).json({ status: 'fail', message: 'Model name and rating are required.' });
    }
    if (typeof rating !== 'number' || rating < 0 || rating > 5) {
        return res.status(400).json({ status: 'fail', message: 'Rating must be a number between 0 and 5.' });
    }

    let feedback = await Feedback.findOne({ user: userId, modelName: modelName });

    let isNew = false;
    if (feedback) {
      // Update existing feedback
      feedback.rating = rating;
      feedback.comment = comment;
      feedback.updatedAt = Date.now();
      // Retain original status unless explicitly changed by admin functions
      // feedback.status = 'new'; // Or 'updated' if you add such a status
    } else {
      // Create new feedback
      feedback = new Feedback({
        user: userId,
        modelName,
        rating,
        comment,
        // status will default to 'new'
      });
      isNew = true;
    }

    await feedback.save();

    // Populate user details for the response, even for update
    const populatedFeedback = await Feedback.findById(feedback._id)
                                        .populate('user', 'name email')
                                        .populate('repliedBy', 'name email');

    res.status(isNew ? 201 : 200).json({
      status: 'success',
      message: isNew ? 'Feedback submitted successfully.' : 'Feedback updated successfully.',
      data: {
        feedback: populatedFeedback,
      },
    });
  } catch (error) {
    console.error('SUBMIT/UPDATE FEEDBACK ERROR:', error);
    if (error.code === 11000) { // MongoDB duplicate key error
        // This should ideally not happen if frontend checks first, but as a fallback
        return res.status(409).json({ status: 'fail', message: 'Database error: Unique constraint violated. This feedback might already exist under a different ID if logic failed.' });
    }
    res.status(500).json({ status: 'error', message: 'Could not submit or update feedback. ' + error.message });
  }
};

// Get feedback for a specific model (public list)
exports.getFeedbackForModel = async (req, res, next) => {
  try {
    const { modelName } = req.params;
    if (!modelName) {
      return res.status(400).json({ status: 'fail', message: 'Model name parameter is required.' });
    }

    const feedbacks = await Feedback.find({ modelName: modelName, status: { $ne: 'archived' } })
      .populate('user', 'name email')
      .populate('repliedBy', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      results: feedbacks.length,
      data: {
        feedbacks,
      },
    });
  } catch (error) {
    console.error('GET FEEDBACK FOR MODEL ERROR:', error);
    res.status(500).json({ status: 'error', message: 'Could not retrieve feedback for the model.' });
  }
};

// Get the current logged-in user's feedback for a specific model
exports.getCurrentUserFeedbackForModel = async (req, res, next) => {
    try {
        const { modelName } = req.params;
        const userId = req.user.id; // From protect middleware

        if (!modelName) {
            return res.status(400).json({ status: 'fail', message: 'Model name parameter is required.' });
        }

        const feedback = await Feedback.findOne({ user: userId, modelName: modelName })
                                     .populate('user', 'name email') // Optional: user details are already in req.user
                                     .populate('repliedBy', 'name email');
        
        if (!feedback) {
            // It's not an error if user hasn't submitted feedback yet
            return res.status(200).json({
                status: 'success',
                data: {
                    feedback: null // Indicate no feedback found
                }
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                feedback,
            },
        });
    } catch (error) {
        console.error('GET CURRENT USER FEEDBACK FOR MODEL ERROR:', error);
        res.status(500).json({ status: 'error', message: 'Could not retrieve your feedback for this model.' });
    }
};

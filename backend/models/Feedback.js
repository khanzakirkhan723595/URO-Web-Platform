// backend/models/Feedback.js
const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.ObjectId, ref: 'User', required: [true, 'Feedback must belong to a user.'] },
  modelName: { type: String, required: [true, 'Feedback must be associated with a model.'], trim: true },
  rating: { type: Number, min: 0, max: 5, required: [true, 'Please provide a rating.'] },
  comment: { type: String, trim: true, maxlength: [1000, 'Comment must be at most 1000 characters'] },
  status: { type: String, enum: ['new', 'seen', 'replied', 'archived'], default: 'new' },
  adminReply: { type: String, trim: true, maxlength: 2000 },
  repliedAt: { type: Date },
  repliedBy: { type: mongoose.Schema.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// One feedback per user per model (enforced by the database)
feedbackSchema.index({ user: 1, modelName: 1 }, { unique: true });
// Fast public list + admin list
feedbackSchema.index({ modelName: 1, status: 1, createdAt: -1 });

// NOTE: population is now done explicitly in controllers, so public endpoints can
// decide exactly which user fields (name only, never e-mail) are exposed.

module.exports = mongoose.model('Feedback', feedbackSchema);

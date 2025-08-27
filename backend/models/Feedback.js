// backend/models/Feedback.js
const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Feedback must belong to a user.'],
  },
  modelName: {
    type: String,
    required: [true, 'Feedback must be associated with a model.'],
  },
  rating: {
    type: Number,
    min: 0, 
    max: 5,
    required: [true, 'Please provide a rating.'],
  },
  comment: {
    type: String,
    trim: true,
  },
  status: { // For admin tracking
    type: String,
    enum: ['new', 'seen', 'replied', 'archived'],
    default: 'new',
  },
  adminReply: {
    type: String,
    trim: true,
  },
  repliedAt: {
    type: Date,
  },
  repliedBy: { 
    type: mongoose.Schema.ObjectId,
    ref: 'User', 
  },
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: { // To track when feedback was last updated by the user
    type: Date,
    default: Date.now,
  }
});

// Ensure a user can only submit one piece of feedback per model
feedbackSchema.index({ user: 1, modelName: 1 }, { unique: true });

// Middleware to update the 'updatedAt' field on save, if it's not a new document being created
// Mongoose's default timestamps: true option also handles this, but this is explicit if you're not using it.
feedbackSchema.pre('save', function(next) {
  if (!this.isNew) {
    this.updatedAt = Date.now();
  }
  next();
});


// This middleware will run before any 'find' query
feedbackSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'name email'
  }).populate({
    path: 'repliedBy',
    select: 'name email'
  });
  next();
});

// Also ensure population for findOne, findById if needed directly
feedbackSchema.pre('findOne', function(next) {
  this.populate({
    path: 'user',
    select: 'name email'
  }).populate({
    path: 'repliedBy',
    select: 'name email'
  });
  next();
});


const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;

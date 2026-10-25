// backend/models/ContactMessage.js
const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 100 },
  email: { type: String, required: [true, 'Email is required'], trim: true, lowercase: true, maxlength: 200 },
  organization: { type: String, trim: true, maxlength: 150, default: '' },
  message: { type: String, required: [true, 'Message is required'], trim: true, minlength: 10, maxlength: 3000 },
  status: { type: String, enum: ['new', 'read', 'archived'], default: 'new' },
  user: { type: mongoose.Schema.ObjectId, ref: 'User', default: null }, // set when the sender is logged in
  createdAt: { type: Date, default: Date.now },
});

contactMessageSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('ContactMessage', contactMessageSchema);

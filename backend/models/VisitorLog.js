// backend/models/VisitorLog.js
const mongoose = require('mongoose');

const visitorLogSchema = new mongoose.Schema({
  user: { // Optional: if the visitor is a logged-in user
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  ipAddress: { // For anonymous users or general tracking
    type: String,
  },
  userAgent: {
    type: String,
  },
  pagePath: { // e.g., '/', '/models/inland-flood'
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Optional: Index for faster queries if you have many logs
visitorLogSchema.index({ timestamp: -1 });
visitorLogSchema.index({ user: 1 });
visitorLogSchema.index({ pagePath: 1 });


const VisitorLog = mongoose.model('VisitorLog', visitorLogSchema);

module.exports = VisitorLog;

// backend/models/SimulationHistory.js
const mongoose = require('mongoose');

const simulationHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  modelName: {
    type: String,
    required: true,
    trim: true,
    index: true, // Index for faster queries by modelName
  },
  hydrographInput: { // Storing file content directly. For large files, consider storing a path/reference.
    type: String,
    required: true,
  },
  tideInput: { // Optional
    type: String,
  },
  executionTimeRequested: {
    type: String, // As it's passed from form data
    required: true,
  },
  pltOutputData: { // Storing PLT output directly
    type: String,
    required: true,
  },
  runAt: {
    type: Date,
    default: Date.now,
    index: true, // Index for sorting by date
  },
  // You could add a title or description for the run if needed
  // runTitle: String,
});

// Compound index for querying user's history for a specific model, sorted by date
simulationHistorySchema.index({ user: 1, modelName: 1, runAt: -1 });

const SimulationHistory = mongoose.model('SimulationHistory', simulationHistorySchema);

module.exports = SimulationHistory;

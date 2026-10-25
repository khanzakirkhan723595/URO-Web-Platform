// backend/middleware/validate.js
const mongoose = require('mongoose');
const AppError = require('../utils/AppError');

// Only letters, numbers, dash and underscore (e.g. "FloodModel").
exports.validateModelName = (req, res, next) => {
  const { modelName } = req.params;
  if (!modelName || !/^[A-Za-z0-9_-]{1,50}$/.test(modelName)) {
    return next(new AppError('Invalid model name.', 400));
  }
  next();
};

exports.validateObjectId = (paramName = 'id') => (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params[paramName])) {
    return next(new AppError('Invalid id.', 400));
  }
  next();
};

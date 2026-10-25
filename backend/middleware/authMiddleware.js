// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');

const getToken = (req) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    return req.headers.authorization.split(' ')[1];
  }
  if (req.cookies && req.cookies.jwt && req.cookies.jwt !== 'loggedout') {
    return req.cookies.jwt;
  }
  return null;
};

// Requires a valid login. Never logs tokens or cookies.
exports.protect = async (req, res, next) => {
  try {
    const token = getToken(req);
    if (!token) {
      return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      const message =
        err.name === 'TokenExpiredError'
          ? 'Your session has expired. Please log in again.'
          : 'Invalid session. Please log in again.';
      return next(new AppError(message, 401));
    }

    // password is select:false so it is NOT loaded here
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(new AppError('The user belonging to this session no longer exists.', 401));
    }

    req.user = currentUser;
    next();
  } catch (error) {
    next(error);
  }
};

// Sets req.user if a valid token exists, otherwise continues as anonymous (never fails).
exports.optionalProtect = async (req, res, next) => {
  try {
    const token = getToken(req);
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (user) req.user = user;
    }
  } catch (err) {
    // invalid or expired token: treat as anonymous visitor
  }
  next();
};

// Usage: router.use(restrictTo('admin'))
exports.restrictTo = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new AppError('You do not have permission to perform this action.', 403));
  }
  next();
};

// Kept for backwards compatibility with existing routes
exports.authorizeAdmin = exports.restrictTo('admin');

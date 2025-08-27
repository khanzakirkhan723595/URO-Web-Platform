// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const { promisify } = require('util'); // Node.js utility
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  console.log('AuthMiddleware: Protect route hit for URL:', req.originalUrl);
  try {
    // 1) Getting token and check if it's there
    let token;
    console.log('AuthMiddleware: Cookies received by backend:', req.cookies); // Log all cookies

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
      console.log('AuthMiddleware: Token found in Authorization header.');
    } else if (req.cookies && req.cookies.jwt) { // Check if req.cookies exists
      token = req.cookies.jwt;
      console.log('AuthMiddleware: Token found in cookies:', token === 'loggedout' ? 'loggedout_token' : 'valid_token_format_received');
    } else {
      console.log('AuthMiddleware: No token found in headers or cookies.');
    }

    if (!token || token === 'loggedout') {
      console.log('AuthMiddleware: Token absent or is "loggedout". Sending 401.');
      return res.status(401).json({ status: 'fail', message: 'You are not logged in! Please log in to get access.' });
    }

    // 2) Verification token
    console.log('AuthMiddleware: Attempting to verify token...');
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    console.log('AuthMiddleware: Token verified. Decoded payload:', decoded);

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id).select('+password'); // Select password to check if changed
    if (!currentUser) {
      console.log('AuthMiddleware: User belonging to token no longer exists. Sending 401.');
      return res.status(401).json({ status: 'fail', message: 'The user belonging to this token does no longer exist.' });
    }

    // 4) Check if user changed password after the token was issued (Optional but good security)
    // if (currentUser.changedPasswordAfter(decoded.iat)) {
    //   return next(new AppError('User recently changed password! Please log in again.', 401));
    // }
    // Note: You'd need to implement changedPasswordAfter method in User model if using this.
    // For now, we'll skip this check for simplicity.

    // GRANT ACCESS TO PROTECTED ROUTE
    console.log('AuthMiddleware: Authentication successful. User attached to request.');
    currentUser.password = undefined; // Ensure password is not on req.user
    req.user = currentUser; // Attach user to the request object
    next();
  } catch (error) {
    console.error("AUTH MIDDLEWARE ERROR:", error.name, error.message);
    if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ status: 'fail', message: 'Invalid token. Please log in again.' });
    }
    if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ status: 'fail', message: 'Your token has expired! Please log in again.' });
    }
    // For other errors during the process
    return res.status(401).json({ status: 'fail', message: 'Authentication failed. Please log in again.' });
  }
};

// Authorization middleware for specific roles
exports.authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    console.log('AuthMiddleware: Admin authorization failed for user:', req.user?.email);
    res.status(403).json({ status: 'fail', message: 'You do not have permission to perform this action.' });
  }
};

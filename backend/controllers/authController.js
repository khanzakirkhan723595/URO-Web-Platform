// backend/controllers/authController.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const VisitorLog = require('../models/VisitorLog');

// Utility to sign JWT
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Utility to create and send token
const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000 // days * h * m * s * ms
    ),
    httpOnly: true, // Cookie cannot be accessed or modified by the browser
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https', // Only send over HTTPS in production
    path: '/', // Explicitly set path
    sameSite: 'Lax', // Recommended for most cases; use 'None' with Secure if cross-site context is needed
  };

  // For production, if NODE_ENV is 'production', you might force secure: true
  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
    // If you need cross-site cookies in prod with secure: true, also set sameSite: 'None'
    // cookieOptions.sameSite = 'None';
  }


  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token, // You might not need to send the token in the body if using HttpOnly cookies
    data: {
      user,
    },
  });
};

exports.signup = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ status: 'fail', message: 'Name, email, and password are required.' });
    }

    const newUser = await User.create({
      name,
      email,
      password,
      role: role || 'user',
    });

    createSendToken(newUser, 201, req, res);
  } catch (error) {
    console.error('SIGNUP ERROR:', error);
    if (error.code === 11000) { // Duplicate key error (email)
        return res.status(400).json({ status: 'fail', message: 'Email already exists.' });
    }
    res.status(500).json({ status: 'error', message: 'Could not sign up user. ' + error.message });
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
      return res.status(400).json({ status: 'fail', message: 'Please provide email and password!' });
    }

    // 2) Check if user exists && password is correct
    const user = await User.findOne({ email }).select('+password'); // Explicitly select password

    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({ status: 'fail', message: 'Incorrect email or password' });
    }

    // 3) If everything ok, send token to client
    user.lastLogin = Date.now();
    user.pageHits = (user.pageHits || 0) + 1; // Increment page hits for the user on login
    await user.save({ validateBeforeSave: false }); // Save lastLogin and pageHits

    try {
        await VisitorLog.create({
            user: user._id,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            pagePath: '/login' // Or a generic 'site-access'
        });
    } catch (logError) {
        console.error("Error logging visitor on login:", logError);
    }

    createSendToken(user, 200, req, res);
  } catch (error) {
    console.error('LOGIN ERROR:', error);
    res.status(500).json({ status: 'error', message: 'Login failed. ' + error.message });
  }
};

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000), // Expires in 10 seconds
    httpOnly: true,
    path: '/',
    sameSite: 'Lax',
    // secure: process.env.NODE_ENV === 'production' // Add if needed for consistency
  });
  res.status(200).json({ status: 'success' });
};

// New function to get the currently logged-in user
exports.getMe = (req, res, next) => {
  // req.user is set by the 'protect' middleware
  if (!req.user) {
    // This case should ideally be caught by the protect middleware itself
    // which would send a 401 before reaching here.
    return res.status(401).json({
        status: 'fail',
        message: 'User not found or not logged in.'
    });
  }
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user,
    },
  });
};

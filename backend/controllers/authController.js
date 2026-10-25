// backend/controllers/authController.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const VisitorLog = require('../models/VisitorLog');
const Feedback = require('../models/Feedback');
const SimulationHistory = require('../models/SimulationHistory');
const AppError = require('../utils/AppError');
const config = require('../config/env');

const signToken = (id) =>
  jwt.sign({ id }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });

// Cookie settings are shared by login and logout so the browser actually replaces/clears the same cookie.
const baseCookieOptions = () => {
  const crossSite = config.isProduction && config.crossSiteCookies;
  return {
    httpOnly: true, // JavaScript cannot read it (protects against XSS token theft)
    secure: config.isProduction, // HTTPS only in production
    sameSite: crossSite ? 'none' : 'lax', // 'none' requires secure:true
    path: '/',
  };
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  res.cookie('jwt', token, {
    ...baseCookieOptions(),
    maxAge: config.jwtCookieExpiresInDays * 24 * 60 * 60 * 1000,
  });

  // The token is sent ONLY in the httpOnly cookie, never in the JSON body.
  res.status(statusCode).json({
    status: 'success',
    data: { user: publicUser(user) },
  });
};

const publicUser = (user) => ({
  _id: user._id,
  id: user.id,
  name: user.name,
  email: user.email,
  organization: user.organization || '',
  role: user.role,
  createdAt: user.createdAt,
  lastLogin: user.lastLogin,
});

const isString = (v) => typeof v === 'string';

exports.signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body; // NOTE: role is intentionally NOT read from the client

    if (![name, email, password].every(isString) || !name.trim() || !email.trim() || !password) {
      return next(new AppError('Name, email, and password are required.', 400));
    }
    if (password.length < 8 || password.length > 72) {
      return next(new AppError('Password must be between 8 and 72 characters.', 400));
    }

    // role always defaults to "user". Admins are promoted by an existing admin (or the seed script).
    const newUser = await User.create({ name: name.trim(), email: email.trim(), password });
    createSendToken(newUser, 201, res);
  } catch (error) {
    next(error); // duplicate email and validation errors are translated by the global error handler
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!isString(email) || !isString(password) || !email || !password) {
      return next(new AppError('Please provide email and password!', 400));
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');

    // Same message for "no such user" and "wrong password" (prevents user enumeration)
    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    // Atomic update: no race condition, and it does not touch the password hash
    await User.updateOne({ _id: user._id }, { $set: { lastLogin: new Date() }, $inc: { pageHits: 1 } });

    VisitorLog.create({
      user: user._id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      pagePath: '/login',
    }).catch((logError) => console.error('Error logging visitor on login:', logError.message));

    createSendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

exports.logout = (req, res) => {
  res.clearCookie('jwt', baseCookieOptions());
  res.status(200).json({ status: 'success' });
};

exports.getMe = (req, res) => {
  res.status(200).json({ status: 'success', data: { user: publicUser(req.user) } });
};

// --- Profile ---------------------------------------------------------------

// PATCH /users/me  - only name and organization can be changed here (never role/email/password)
exports.updateMe = async (req, res, next) => {
  try {
    const { name, organization } = req.body;
    const update = {};

    if (name !== undefined) {
      if (!isString(name) || !name.trim() || name.trim().length > 80) {
        return next(new AppError('Name must be between 1 and 80 characters.', 400));
      }
      update.name = name.trim();
    }
    if (organization !== undefined) {
      if (!isString(organization) || organization.trim().length > 120) {
        return next(new AppError('Organization must be at most 120 characters.', 400));
      }
      update.organization = organization.trim();
    }
    if (!Object.keys(update).length) return next(new AppError('Nothing to update.', 400));

    const user = await User.findByIdAndUpdate(req.user.id, update, { new: true, runValidators: true });
    res.status(200).json({ status: 'success', data: { user: publicUser(user) } });
  } catch (error) {
    next(error);
  }
};

// PATCH /users/updateMyPassword
exports.updateMyPassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!isString(currentPassword) || !isString(newPassword)) {
      return next(new AppError('Current and new password are required.', 400));
    }
    if (newPassword.length < 8 || newPassword.length > 72) {
      return next(new AppError('New password must be between 8 and 72 characters.', 400));
    }
    if (newPassword === currentPassword) {
      return next(new AppError('New password must be different from the current one.', 400));
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!(await user.correctPassword(currentPassword, user.password))) {
      return next(new AppError('Your current password is incorrect.', 401));
    }

    user.password = newPassword; // pre('save') hook hashes it
    await user.save();
    createSendToken(user, 200, res); // issue a fresh session cookie
  } catch (error) {
    next(error);
  }
};

// GET /users/me/summary  - numbers for the profile dashboard
exports.getMySummary = async (req, res, next) => {
  try {
    const [runs, feedbackCount, latest] = await Promise.all([
      SimulationHistory.countDocuments({ user: req.user.id }),
      Feedback.countDocuments({ user: req.user.id }),
      SimulationHistory.findOne({ user: req.user.id }).sort({ runAt: -1 }).select('modelName runAt executionTimeRequested').lean(),
    ]);
    res.status(200).json({
      status: 'success',
      data: { savedRuns: runs, feedbackCount, lastRun: latest || null, memberSince: req.user.createdAt, lastLogin: req.user.lastLogin || null },
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /users/me  - permanently delete the account and its data (requires password)
exports.deleteMe = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!isString(password) || !password) return next(new AppError('Please confirm your password to delete your account.', 400));

    const user = await User.findById(req.user.id).select('+password');
    if (!(await user.correctPassword(password, user.password))) return next(new AppError('Incorrect password.', 401));

    if (user.role === 'admin') {
      const admins = await User.countDocuments({ role: 'admin' });
      if (admins <= 1) return next(new AppError('You are the only administrator. Promote another admin first.', 400));
    }

    await Promise.all([
      SimulationHistory.deleteMany({ user: user._id }),
      Feedback.deleteMany({ user: user._id }),
      User.deleteOne({ _id: user._id }),
    ]);
    res.clearCookie('jwt', baseCookieOptions());
    res.status(200).json({ status: 'success', message: 'Your account has been deleted.' });
  } catch (error) {
    next(error);
  }
};

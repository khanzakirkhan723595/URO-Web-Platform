// backend/middleware/rateLimiters.js
const rateLimit = require('express-rate-limit');

const json429 = (message) => (req, res) =>
  res.status(429).json({ status: 'fail', message });

// General API limiter (per IP)
exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 600,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: json429('Too many requests. Please try again later.'),
});

// Brute-force protection for login / signup
exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: json429('Too many attempts. Please wait a few minutes and try again.'),
});

// Visit tracking can be spammed, keep it tight
exports.visitLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (req, res) => res.status(200).json({ status: 'fail', message: 'Rate limited.' }),
});

// Model runs are expensive
exports.modelRunLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: json429('Model run limit reached. Please try again later.'),
});

// Contact form: stop spam
exports.contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: json429('You have sent several messages recently. Please try again later.'),
});

// AI endpoints cost money: keep them tight (per IP; routes also require login)
exports.aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 40,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: json429('AI request limit reached. Please try again later.'),
});

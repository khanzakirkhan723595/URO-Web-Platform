// backend/app.js
// Builds the Express app (no listening, no DB connection) so it can be tested with Supertest.
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

const config = require('./config/env');
const AppError = require('./utils/AppError');
const sanitize = require('./middleware/sanitize');
const { apiLimiter } = require('./middleware/rateLimiters');

const modelRoutes = require('./routes/modelRoutes');
const authRoutes = require('./routes/authRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const adminRoutes = require('./routes/adminRoutes');
const statsRoutes = require('./routes/statsRoutes');
const historyRoutes = require('./routes/historyRoutes');
const contactRoutes = require('./routes/contactRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1); // we run behind a reverse proxy / PaaS in production

// --- Security & performance middleware ---
app.use(helmet());
app.use(compression());
app.use(
  cors({
    origin: (origin, cb) => {
      // allow tools without an Origin header (curl, health checks) and the configured frontends
      if (!origin || config.corsOrigins.includes(origin)) return cb(null, true);
      cb(new AppError('Not allowed by CORS', 403));
    },
    credentials: true,
    optionsSuccessStatus: 200,
  })
);
if (process.env.NODE_ENV !== 'test') app.use(morgan(config.isProduction ? 'combined' : 'dev'));

// --- Body parsing ---
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(sanitize);

// --- Health check (before rate limiting so monitors are never blocked) ---
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    message: 'Backend is healthy',
    mongodb_status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptimeSeconds: Math.round(process.uptime()),
  });
});

// --- API ---
app.use('/api', apiLimiter);
app.use('/api/model', modelRoutes);
app.use('/api/users', authRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/ai', aiRoutes);

// --- 404 for unknown routes (JSON instead of Express's default HTML page) ---
app.use((req, res, next) => next(new AppError(`Cannot ${req.method} ${req.originalUrl}`, 404)));

// --- Global error handler (translates known errors into clean responses) ---
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  let statusCode = Number(err.statusCode) || (Number.isInteger(err.status) ? err.status : 500);
  let message = err.message;

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((e) => e.message).join('. ');
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}.`;
  } else if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyPattern || {})[0];
    message = field === 'email' ? 'Email already exists.' : 'This record already exists.';
  } else if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Invalid JSON in request body.';
  } else if (err.type === 'entity.too.large') {
    statusCode = 413;
    message = 'Request body too large.';
  }

  if (statusCode >= 500) console.error('Unhandled error:', err);

  const isServerError = statusCode >= 500;
  res.status(statusCode).json({
    status: isServerError ? 'error' : 'fail',
    message: isServerError && config.isProduction && !err.isOperational ? 'Something went wrong on the server.' : message,
    ...(config.isProduction ? {} : { stack: err.stack }),
  });
});

module.exports = app;

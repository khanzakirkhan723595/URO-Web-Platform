// backend/config/env.js
// Loads .env FIRST and validates required settings so the app fails fast with a clear message.
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const required = ['MONGODB_URI', 'JWT_SECRET'];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`FATAL ERROR: Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

if (process.env.JWT_SECRET.length < 32) {
  console.warn('WARNING: JWT_SECRET is shorter than 32 characters. Use a long random value in production.');
}

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  isProduction,
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  jwtCookieExpiresInDays: Number(process.env.JWT_COOKIE_EXPIRES_IN) || 7,
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map((s) => s.trim()),
  crossSiteCookies: process.env.CROSS_SITE_COOKIES === 'true',
  uploadDir: process.env.UPLOAD_TEMP_DIR
    ? path.resolve(process.env.UPLOAD_TEMP_DIR)
    : path.join(__dirname, '../uploads'),
  modelWorkerUrl: process.env.MODEL_WORKER_URL,
  modelWorkerTimeoutMs: Number(process.env.MODEL_WORKER_TIMEOUT_MS) || 6 * 60 * 60 * 1000,

  // --- AI assistant (optional): groq | gemini | openrouter | ollama | anthropic ---
  aiProvider: (process.env.AI_PROVIDER || (process.env.ANTHROPIC_API_KEY ? 'anthropic' : '')).trim().toLowerCase(),
  aiApiKey: (process.env.AI_API_KEY || process.env.ANTHROPIC_API_KEY || '').trim(),
  aiModel: (process.env.AI_MODEL || '').trim(),
  aiBaseUrl: (process.env.AI_BASE_URL || '').trim(),
  aiMaxTokens: Number(process.env.AI_MAX_TOKENS) || 700,

  dnsServers: process.env.DNS_SERVERS ? process.env.DNS_SERVERS.split(',').map((s) => s.trim()) : null,
};
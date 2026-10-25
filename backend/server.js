// backend/server.js  - entry point: loads env, connects to MongoDB, then starts listening.
const config = require('./config/env'); // MUST be first: loads .env and validates it
const dns = require('dns');
const mongoose = require('mongoose');

// Optional: needed on some networks where mongodb+srv DNS lookups fail (set DNS_SERVERS=8.8.8.8,8.8.4.4)
if (config.dnsServers) dns.setServers(config.dnsServers);

const app = require('./app');

const start = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('Successfully connected to MongoDB.');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }

  // Start accepting traffic only AFTER the database is ready
  const server = app.listen(config.port, () => {
    console.log(`Backend server running on port ${config.port} (${config.isProduction ? 'production' : 'development'})`);
    console.log(`Accepting requests from: ${config.corsOrigins.join(', ')}`);
  });

  // Long simulations: allow slow requests (default Node request timeout is 5 minutes)
  server.requestTimeout = 0;
  server.headersTimeout = 65 * 1000;

  mongoose.connection.on('disconnected', () => console.warn('MongoDB disconnected.'));

  // Graceful shutdown (Docker/Kubernetes/PaaS send SIGTERM)
  const shutdown = (signal) => {
    console.log(`${signal} received. Shutting down gracefully...`);
    server.close(async () => {
      await mongoose.connection.close();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

process.on('unhandledRejection', (reason) => console.error('Unhandled promise rejection:', reason));

start();

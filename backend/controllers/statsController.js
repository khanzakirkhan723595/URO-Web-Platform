// backend/controllers/statsController.js
const VisitorLog = require('../models/VisitorLog');
const User = require('../models/User');

exports.recordVisit = async (req, res) => {
  try {
    const { pagePath } = req.body;
    if (typeof pagePath !== 'string' || !pagePath.startsWith('/') || pagePath.length > 200) {
      return res.status(200).json({ status: 'success', message: 'Ignored.' });
    }

    await VisitorLog.create({
      user: req.user ? req.user.id : null, // set by optionalProtect
      ipAddress: req.ip,
      userAgent: (req.headers['user-agent'] || '').slice(0, 300),
      pagePath,
    });

    res.status(201).json({ status: 'success', message: 'Visit recorded.' });
  } catch (error) {
    // Analytics must never break the user experience
    console.error('Error recording visit:', error.message);
    res.status(200).json({ status: 'fail', message: 'Could not record visit.' });
  }
};

// Tiny in-memory cache: the footer asks for this on every page load.
let cache = { value: null, expires: 0 };
const CACHE_MS = 60 * 1000;

exports.getSiteSummary = async (req, res, next) => {
  try {
    if (cache.value && cache.expires > Date.now()) {
      return res.status(200).json({ status: 'success', data: cache.value });
    }

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [totalPageHits, uniqueIPs, totalRegisteredUsers] = await Promise.all([
      VisitorLog.estimatedDocumentCount(),
      VisitorLog.distinct('ipAddress', { timestamp: { $gte: thirtyDaysAgo } }),
      User.estimatedDocumentCount(),
    ]);

    const value = { totalPageHits, totalUniqueVisitors: uniqueIPs.length, totalRegisteredUsers };
    cache = { value, expires: Date.now() + CACHE_MS };
    res.status(200).json({ status: 'success', data: value });
  } catch (error) {
    next(error);
  }
};

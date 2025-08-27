// backend/controllers/statsController.js
const VisitorLog = require('../models/VisitorLog');
const User = require('../models/User');

// To record a page visit
exports.recordVisit = async (req, res, next) => {
  try {
    const { pagePath } = req.body;
    if (!pagePath) {
      // Don't send error response, just log and move on for this non-critical path
      console.warn('Attempted to record visit without pagePath.');
      return res.status(200).json({ status: 'success', message: 'Visit attempt logged (no path).' });
    }

    await VisitorLog.create({
      user: req.user ? req.user.id : null, // If user is logged in (via optional protect middleware)
      ipAddress: req.ip, // Express provides req.ip
      userAgent: req.headers['user-agent'],
      pagePath,
    });

    res.status(201).json({
      status: 'success',
      message: 'Visit recorded.',
    });
  } catch (error) {
    console.error('Error recording visit:', error);
    // It's a background task, so don't necessarily send 500 to break frontend flow
    // but good to know it failed.
    res.status(200).json({ status: 'fail', message: 'Could not record visit due to server error.' });
  }
};

// To get site summary statistics
exports.getSiteSummary = async (req, res, next) => {
  try {
    const totalPageHits = await VisitorLog.countDocuments();
    
    // Estimate unique visitors based on IP addresses for a recent period (e.g., last 30 days)
    // This is a basic way; more robust unique visitor tracking often uses cookies or more complex analytics.
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const uniqueIPsLast30Days = await VisitorLog.distinct('ipAddress', {
        timestamp: { $gte: thirtyDaysAgo }
    });
    const totalUniqueVisitorsEstimate = uniqueIPsLast30Days.length;

    const totalRegisteredUsers = await User.countDocuments();

    res.status(200).json({
      status: 'success',
      data: {
        totalPageHits,
        totalUniqueVisitors: totalUniqueVisitorsEstimate, // Label as estimate if using IP
        totalRegisteredUsers,
      },
    });
  } catch (error) {
    console.error('Error fetching site summary:', error);
    res.status(500).json({ status: 'error', message: 'Could not fetch site summary.' });
  }
};

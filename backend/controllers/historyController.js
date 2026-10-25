// backend/controllers/historyController.js
const SimulationHistory = require('../models/SimulationHistory');
const AppError = require('../utils/AppError');

exports.getSimulationHistoryForModel = async (req, res, next) => {
  try {
    // user id comes from the verified token (never from the request)
    const history = await SimulationHistory.find({
      user: req.user.id,
      modelName: req.params.modelName,
    })
      .sort({ runAt: -1 })
      .limit(3)
      .lean();

    res.status(200).json({ status: 'success', results: history.length, data: { history } });
  } catch (error) {
    next(error);
  }
};

// DELETE /history/item/:id  - a user can delete only their own saved runs
exports.deleteHistoryItem = async (req, res, next) => {
  try {
    const deleted = await SimulationHistory.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!deleted) return next(new AppError('Saved run not found.', 404));
    res.status(200).json({ status: 'success', message: 'Saved run deleted.' });
  } catch (error) {
    next(error);
  }
};

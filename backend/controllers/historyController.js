// backend/controllers/historyController.js
const SimulationHistory = require('../models/SimulationHistory');

exports.getSimulationHistoryForModel = async (req, res, next) => {
  try {
    const userId = req.user.id; // From authMiddleware.protect
    const { modelName } = req.params;

    if (!modelName) {
      return res.status(400).json({ status: 'fail', message: 'Model name parameter is required.' });
    }

    const history = await SimulationHistory.find({
      user: userId,
      modelName: modelName,
    })
    .sort({ runAt: -1 }) // Newest first
    .limit(3); // Already limited to 3 by the save logic, but good to be explicit here too.

    res.status(200).json({
      status: 'success',
      results: history.length,
      data: {
        history,
      },
    });
  } catch (error) {
    console.error('GET SIMULATION HISTORY ERROR:', error);
    res.status(500).json({ status: 'error', message: 'Could not retrieve simulation history.' });
  }
};

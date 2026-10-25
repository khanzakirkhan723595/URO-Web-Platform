// backend/controllers/modelController.js
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const SimulationHistory = require('../models/SimulationHistory');
const AppError = require('../utils/AppError');
const config = require('../config/env');

const MAX_HISTORY_ITEMS = 3; // Max history items per user per model
const MAX_EXECUTION_SECONDS = 86400; // 24 h of simulated time

const removeTempFiles = (...files) =>
  Promise.all(
    files
      .filter(Boolean)
      .map((f) => fs.promises.unlink(f.path).catch((err) => err.code !== 'ENOENT' && console.error('Temp file cleanup failed:', err.message)))
  );

exports.runModelController = async (req, res, next) => {
  const hydrographFile = req.files && req.files.hydrographFile && req.files.hydrographFile[0];
  const tideFile = req.files && req.files.tideFile ? req.files.tideFile[0] : null;

  try {
    if (!hydrographFile) throw new AppError('Hydrograph.txt file is mandatory.', 400);
    if (!config.modelWorkerUrl) throw new AppError('The model service is not configured on the server.', 500);

    const modelName = typeof req.body.modelName === 'string' && /^[A-Za-z0-9_-]{1,50}$/.test(req.body.modelName)
      ? req.body.modelName
      : 'UnknownModel';

    const executionSeconds = Number(req.body.executionTime ?? 60);
    if (!Number.isFinite(executionSeconds) || executionSeconds < 1 || executionSeconds > MAX_EXECUTION_SECONDS) {
      throw new AppError(`executionTime must be a number between 1 and ${MAX_EXECUTION_SECONDS}.`, 400);
    }
    const executionTime = String(Math.round(executionSeconds));

    // Read the inputs for history before the temp files are removed
    const [hydrographContent, tideContent] = await Promise.all([
      fs.promises.readFile(hydrographFile.path, 'utf-8'),
      tideFile ? fs.promises.readFile(tideFile.path, 'utf-8') : Promise.resolve(null),
    ]);

    const formData = new FormData();
    formData.append('hydrographFile', fs.createReadStream(hydrographFile.path), { filename: 'Hydrograph.txt', contentType: 'text/plain' });
    if (tideFile) formData.append('tideFile', fs.createReadStream(tideFile.path), { filename: 'tide.txt', contentType: 'text/plain' });
    formData.append('executionTime', executionTime);

    const workerResponse = await axios.post(`${config.modelWorkerUrl}/model-worker/execute`, formData, {
      headers: formData.getHeaders(),
      responseType: 'json',
      timeout: config.modelWorkerTimeoutMs,
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });

    if (!workerResponse.data || !workerResponse.data.success || !workerResponse.data.pltData) {
      throw new AppError(workerResponse.data?.message || 'The model service returned an unexpected response.', 502);
    }

    // Save history, but never let a history problem hide a successful result
    try {
      await SimulationHistory.create({
        user: req.user.id,
        modelName,
        hydrographInput: hydrographContent,
        tideInput: tideContent,
        executionTimeRequested: executionTime,
        pltOutputData: workerResponse.data.pltData,
      });

      // Keep only the newest MAX_HISTORY_ITEMS runs (one query to find ids, one to delete)
      const old = await SimulationHistory.find({ user: req.user.id, modelName })
        .sort({ runAt: -1 })
        .skip(MAX_HISTORY_ITEMS)
        .select('_id')
        .lean();
      if (old.length) await SimulationHistory.deleteMany({ _id: { $in: old.map((d) => d._id) } });
    } catch (historyError) {
      console.error('Error saving simulation history:', historyError.message);
    }

    res.status(200).json({
      success: true,
      status: 'success',
      message: 'Model executed successfully.',
      pltData: workerResponse.data.pltData,
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Log worker details on the server, but show a clean message to the user
      console.error('Model worker error:', error.message, error.response?.status);
      if (error.code === 'ECONNABORTED') return next(new AppError('The model took too long to respond.', 504));
      if (error.response) {
        const workerMessage = typeof error.response.data?.message === 'string' ? error.response.data.message : null;
        return next(new AppError(workerMessage || 'The model service reported an error.', 502));
      }
      return next(new AppError('The model service is currently unavailable. Please try again later.', 503));
    }
    next(error);
  } finally {
    // Always remove temporary files (success OR failure)
    await removeTempFiles(hydrographFile, tideFile);
  }
};

// backend/controllers/modelController.js
const axios = require('axios');
const dotenv = require('dotenv');
const FormData = require('form-data');
const fs = require('fs'); // Require fs for reading file content
const path = require('path'); // For path operations
const SimulationHistory = require('../models/SimulationHistory'); // Import the new model

dotenv.config();

const MODEL_WORKER_URL = process.env.MODEL_WORKER_URL;
const MAX_HISTORY_ITEMS = 3; // Max history items per user per model

exports.runModelController = async (req, res, next) => {
  const hydrographFile = req.files.hydrographFile[0];
  const tideFile = req.files.tideFile ? req.files.tideFile[0] : null;
  const modelNameFromBody = req.body.modelName || "UnknownModel"; // Get modelName from request body

  try {
    if (!MODEL_WORKER_URL) {
        const err = new Error("MODEL_WORKER_URL is not configured in the backend environment.");
        err.status = 500;
        throw err;
    }

    const executionTime = req.body.executionTime || "60";

    // Read input file contents for history BEFORE sending to worker and deleting
    let hydrographContent = '';
    let tideContent = null;
    try {
        hydrographContent = await fs.promises.readFile(hydrographFile.path, 'utf-8');
        if (tideFile) {
            tideContent = await fs.promises.readFile(tideFile.path, 'utf-8');
        }
    } catch (readError) {
        console.error("Error reading input files for history:", readError);
        // Decide if this should be a fatal error or just log and continue
        // For now, we'll log and continue, history might miss this run's inputs.
    }


    const formData = new FormData();
    formData.append('hydrographFile', fs.createReadStream(hydrographFile.path), {
        filename: 'Hydrograph.txt',
        contentType: hydrographFile.mimetype,
    });

    if (tideFile) {
      formData.append('tideFile', fs.createReadStream(tideFile.path), {
        filename: 'tide.txt',
        contentType: tideFile.mimetype,
      });
    }
    
    formData.append('executionTime', executionTime);

    console.log(`Forwarding request to model worker at ${MODEL_WORKER_URL}/execute for model: ${modelNameFromBody}`);
    
    const workerResponse = await axios.post(`${MODEL_WORKER_URL}/execute`, formData, {
      headers: { ...formData.getHeaders() },
      responseType: 'json' 
    });

    // Cleanup temporary files
    const unlinkPromises = [];
    unlinkPromises.push(fs.promises.unlink(hydrographFile.path).catch(err => console.error("Error deleting hydrograph temp file:", err)));
    if (tideFile) {
      unlinkPromises.push(fs.promises.unlink(tideFile.path).catch(err => console.error("Error deleting tide temp file:", err)));
    }
    await Promise.all(unlinkPromises);


    if (workerResponse.data && workerResponse.data.success) {
      // If user is logged in, save simulation history
      if (req.user && workerResponse.data.pltData && hydrographContent) { // req.user comes from authMiddleware.protect
        try {
          await SimulationHistory.create({
            user: req.user.id,
            modelName: modelNameFromBody, // Use the modelName from the request
            hydrographInput: hydrographContent,
            tideInput: tideContent,
            executionTimeRequested: executionTime,
            pltOutputData: workerResponse.data.pltData,
          });

          // Maintain only the latest MAX_HISTORY_ITEMS
          const userHistories = await SimulationHistory.find({ 
            user: req.user.id, 
            modelName: modelNameFromBody 
          }).sort({ runAt: -1 }); // Newest first

          if (userHistories.length > MAX_HISTORY_ITEMS) {
            const historiesToDelete = userHistories.slice(MAX_HISTORY_ITEMS);
            for (const oldHistory of historiesToDelete) {
              await SimulationHistory.findByIdAndDelete(oldHistory._id);
            }
          }
        } catch (historyError) {
          console.error("Error saving simulation history:", historyError);
          // Do not let history saving failure break the main response to user
        }
      }

      res.status(200).json({
        success: true,
        message: 'Model executed successfully by worker.',
        pltData: workerResponse.data.pltData,
      });
    } else {
      const err = new Error(workerResponse.data.message || 'Model worker failed to execute or returned unexpected response.');
      err.status = (workerResponse.status !== 200) ? workerResponse.status : 502;
      throw err;
    }

  } catch (error) {
    console.error('Error in runModelController:', error.message);
    
    const cleanupPromisesOnError = [];
    if (hydrographFile && hydrographFile.path && fs.existsSync(hydrographFile.path)) {
        cleanupPromisesOnError.push(fs.promises.unlink(hydrographFile.path).catch(err => console.error("Error deleting hydrograph temp file on error:", err)));
    }
    if (tideFile && tideFile.path && fs.existsSync(tideFile.path)) {
        cleanupPromisesOnError.push(fs.promises.unlink(tideFile.path).catch(err => console.error("Error deleting tide temp file on error:", err)));
    }
    if(cleanupPromisesOnError.length > 0) {
        await Promise.all(cleanupPromisesOnError);
    }
    
    if (axios.isAxiosError(error)) {
        const detailedError = new Error(
            `Error communicating with model worker: ${error.message}. ` +
            (error.response ? `Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}` : 'No response from worker.')
        );
        detailedError.status = error.response ? error.response.status : 503;
        next(detailedError);
    } else {
        if (!error.status) error.status = 500;
        next(error);
    }
  }
};

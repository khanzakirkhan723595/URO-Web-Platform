// -----------------------------------------------------------------------------
// File: model-worker/worker.js
// -----------------------------------------------------------------------------
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs').promises; // Use promise-based fs
const { existsSync, mkdirSync } = require('fs'); // Synchronous for setup
const path = require('path');
const { spawn } = require('child_process');
const rimraf = require('rimraf'); // For cleaning output directory

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Configuration from .env
const FLOOD_MODEL_EXE_PATH = process.env.FLOOD_MODEL_EXE_PATH;
const MODEL_INPUT_DIR = path.resolve(process.env.MODEL_INPUT_DIR || './FloodModel/Inputs/');
const MODEL_OUTPUT_DIR = path.resolve(process.env.MODEL_OUTPUT_DIR || './FloodModel/Output/');
const MODEL_OUTPUT_PLT_FILENAME = process.env.MODEL_OUTPUT_PLT_FILENAME; // Can be optional now
const MODEL_TIME_PROMPT_STRING = process.env.MODEL_TIME_PROMPT_STRING;

// Standardized input filenames expected by the model
const HYDROGRAPH_FILENAME = 'Hydrograph.txt';
const TIDE_FILENAME = 'tide.txt';


// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN_BACKEND || 'http://localhost:5000',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// --- Directory Setup ---
if (!existsSync(MODEL_INPUT_DIR)) mkdirSync(MODEL_INPUT_DIR, { recursive: true });
if (!existsSync(MODEL_OUTPUT_DIR)) mkdirSync(MODEL_OUTPUT_DIR, { recursive: true });

if (!FLOOD_MODEL_EXE_PATH || !existsSync(path.resolve(FLOOD_MODEL_EXE_PATH))) {
    console.error(`FATAL ERROR: flood_model.exe not found at specified path: ${FLOOD_MODEL_EXE_PATH}`);
    process.exit(1);
} else {
    console.log(`Flood model executable found at: ${path.resolve(FLOOD_MODEL_EXE_PATH)}`);
}
if (!MODEL_TIME_PROMPT_STRING) {
    console.warn("Warning: MODEL_TIME_PROMPT_STRING is not set in .env. Interaction for time input might fail.");
}

// --- Multer setup for file uploads from backend ---
// Files are named by the backend as HYDROGRAPH_FILENAME and TIDE_FILENAME
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, MODEL_INPUT_DIR);
  },
  filename: function (req, file, cb) {
    // The backend sends files with standardized names (Hydrograph.txt, tide.txt)
    // So, file.originalname here will be those standardized names.
    cb(null, file.originalname); 
  }
});
const upload = multer({ storage: storage });


// --- Helper function to clean the output directory ---
async function cleanOutputDir() {
  try {
    await new Promise((resolve, reject) => {
        rimraf(path.join(MODEL_OUTPUT_DIR, '*'), (err) => { // Cleans all files and folders within output dir
            if (err && err.code !== 'ENOENT') reject(err); // Ignore if dir is already empty/gone
            else resolve();
        });
    });
    console.log(`Successfully cleaned output directory: ${MODEL_OUTPUT_DIR}`);
  } catch (error) {
    console.error(`Failed to clean output directory ${MODEL_OUTPUT_DIR}:`, error);
  }
}

// --- Helper function to delete specific uploaded input files ---
async function deleteUploadedInputFiles(uploadedFiles) {
    const deletionPromises = [];
    if (uploadedFiles.hydrographFile) {
        const filePath = path.join(MODEL_INPUT_DIR, HYDROGRAPH_FILENAME);
        deletionPromises.push(
            fs.unlink(filePath)
              .then(() => console.log(`Deleted uploaded input file: ${filePath}`))
              .catch(err => console.warn(`Could not delete input file ${filePath}: ${err.message}`)) // Warn if deletion fails
        );
    }
    if (uploadedFiles.tideFile) {
        const filePath = path.join(MODEL_INPUT_DIR, TIDE_FILENAME);
         deletionPromises.push(
            fs.unlink(filePath)
              .then(() => console.log(`Deleted uploaded input file: ${filePath}`))
              .catch(err => console.warn(`Could not delete input file ${filePath}: ${err.message}`))
        );
    }
    await Promise.all(deletionPromises);
}

// --- Helper function to find the output PLT file ---
async function findOutputPltFile() {
    // 1. If a specific filename is given in .env, try that first.
    if (MODEL_OUTPUT_PLT_FILENAME) {
        const specificPath = path.join(MODEL_OUTPUT_DIR, MODEL_OUTPUT_PLT_FILENAME);
        try {
            await fs.access(specificPath);
            console.log(`Using specified output file: ${specificPath}`);
            return specificPath;
        } catch (err) {
            console.warn(`Specified output file ${MODEL_OUTPUT_PLT_FILENAME} not found. Searching for other .plt files.`);
        }
    }

    // 2. If not found or not specified, search for the newest .plt file.
    const files = await fs.readdir(MODEL_OUTPUT_DIR);
    const pltFiles = files.filter(file => file.toLowerCase().endsWith('.plt'));

    if (pltFiles.length === 0) {
        return null; // No .plt file found
    }

    if (pltFiles.length === 1) {
        console.log(`Found one .plt file: ${pltFiles[0]}`);
        return path.join(MODEL_OUTPUT_DIR, pltFiles[0]); // Only one .plt file
    }

    // Find the newest .plt file if multiple exist
    let newestFile = null;
    let newestTime = 0;
    for (const file of pltFiles) {
        const filePath = path.join(MODEL_OUTPUT_DIR, file);
        const stats = await fs.stat(filePath);
        if (stats.mtimeMs > newestTime) {
            newestTime = stats.mtimeMs;
            newestFile = filePath;
        }
    }
    console.log(`Found newest .plt file: ${path.basename(newestFile)}`);
    return newestFile;
}


// --- Route to execute the model ---
app.post('/model-worker/execute', upload.fields([
    { name: 'hydrographFile', maxCount: 1 }, // Expects 'Hydrograph.txt'
    { name: 'tideFile', maxCount: 1 }      // Expects 'tide.txt'
  ]), async (req, res) => {

  console.log('Model execution request received.');
  const executionTime = req.body.executionTime || "60"; 
  const uploadedFiles = {
      hydrographFile: req.files && req.files.hydrographFile,
      tideFile: req.files && req.files.tideFile
  };

  if (!FLOOD_MODEL_EXE_PATH) {
    return res.status(500).json({ success: false, message: 'Flood model executable path not configured on worker.' });
  }

  try {
    await cleanOutputDir(); // Clean output directory before model run

    console.log(`Executing model: ${path.resolve(FLOOD_MODEL_EXE_PATH)}`);
    const modelProcess = spawn(path.resolve(FLOOD_MODEL_EXE_PATH), [], { cwd: path.dirname(path.resolve(FLOOD_MODEL_EXE_PATH)) });

    let modelOutput = '';
    let modelError = '';
    let promptDetected = false;

    modelProcess.stdout.on('data', (data) => {
      const outputChunk = data.toString();
      modelOutput += outputChunk;
      console.log(`Model stdout: ${outputChunk.trim()}`);
      if (MODEL_TIME_PROMPT_STRING && outputChunk.includes(MODEL_TIME_PROMPT_STRING) && !promptDetected) {
        promptDetected = true;
        console.log(`Prompt detected. Sending execution time: ${executionTime}`);
        modelProcess.stdin.write(executionTime + '\n');
      }
    });

    modelProcess.stderr.on('data', (data) => {
      const errorChunk = data.toString();
      modelError += errorChunk;
      console.error(`Model stderr: ${errorChunk.trim()}`);
    });

    modelProcess.on('close', async (code) => {
      console.log(`Model process exited with code ${code}`);
      await deleteUploadedInputFiles(uploadedFiles); // Delete uploaded inputs regardless of model success/failure

      if (code !== 0) {
        return res.status(500).json({ 
            success: false, 
            message: `Model execution failed with code ${code}.`,
            details: modelError || modelOutput
        });
      }

      const outputFilePath = await findOutputPltFile();
      if (!outputFilePath) {
        console.error(`No .PLT output file found in ${MODEL_OUTPUT_DIR}.`);
        return res.status(500).json({ 
            success: false, 
            message: `Model ran, but no .PLT output file was found in ${MODEL_OUTPUT_DIR}.`,
            details: modelOutput // Send model's stdout for debugging
        });
      }
      
      console.log(`Attempting to read output file: ${outputFilePath}`);
      try {
        const pltData = await fs.readFile(outputFilePath, 'utf-8');
        console.log(`Successfully read PLT file. Length: ${pltData.length}`);
        return res.status(200).json({
          success: true,
          message: 'Model executed and output retrieved.',
          pltData: pltData,
        });
      } catch (fileError) {
        console.error(`Error accessing or reading PLT file (${outputFilePath}):`, fileError);
        return res.status(500).json({ 
            success: false, 
            message: `Model ran, but failed to retrieve output PLT file. Error: ${fileError.message}`,
        });
      }
    });

    modelProcess.on('error', async (err) => {
        console.error('Failed to start model process:', err);
        await deleteUploadedInputFiles(uploadedFiles); // Attempt cleanup even if process fails to start
        return res.status(500).json({ success: false, message: `Failed to start model executable: ${err.message}` });
    });

  } catch (error) {
    console.error('Error in /model-worker/execute:', error);
    // Attempt to clean up uploaded files if an error occurs before model process handling
    await deleteUploadedInputFiles(uploadedFiles).catch(e => console.error("Cleanup error during main catch:", e));
    res.status(500).json({ success: false, message: `Worker internal error: ${error.message}` });
  }
});

app.get('/model-worker/health', (req, res) => {
  res.status(200).json({ status: 'UP', message: 'Model worker is healthy' });
});

app.listen(PORT, () => {
  console.log(`Model Worker server running on port ${PORT}`);
  console.log(`--- Model Configuration ---`);
  console.log(`EXE Path: ${path.resolve(FLOOD_MODEL_EXE_PATH || "")}`);
  console.log(`Input Dir: ${MODEL_INPUT_DIR}`);
  console.log(`Output Dir: ${MODEL_OUTPUT_DIR}`);
  console.log(`Output PLT (Preferred): ${MODEL_OUTPUT_PLT_FILENAME || "Not set, will search *.plt"}`);
  console.log(`Time Prompt: "${MODEL_TIME_PROMPT_STRING}"`);
  console.log(`---------------------------`);
});

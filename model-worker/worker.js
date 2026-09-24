// // -----------------------------------------------------------------------------
// // File: model-worker/worker.js
// // -----------------------------------------------------------------------------

const express = require('express');
const multer = require('multer');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// --- Load Environment Variables ---
const FLOOD_MODEL_EXE_PATH = process.env.FLOOD_MODEL_EXE_PATH || './FloodModel/flood_model.exe';
const MODEL_INPUT_DIR = process.env.MODEL_INPUT_DIR || './FloodModel/Inputs';
const MODEL_OUTPUT_DIR = process.env.MODEL_OUTPUT_DIR || './FloodModel/Output';
const MODEL_TIME_PROMPT_STRING = process.env.MODEL_TIME_PROMPT_STRING || 'Enter duration of Simulation in sec';

// Ensure required directories exist
if (!fsSync.existsSync(MODEL_INPUT_DIR)) fsSync.mkdirSync(MODEL_INPUT_DIR, { recursive: true });
if (!fsSync.existsSync(MODEL_OUTPUT_DIR)) fsSync.mkdirSync(MODEL_OUTPUT_DIR, { recursive: true });

// --- Configure Multer Storage for Uploaded Files ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, MODEL_INPUT_DIR),
  filename: (req, file, cb) => cb(null, file.originalname)
});

const upload = multer({ storage });

// --- Helper Function to Clean Output Directory (Native fs.rm) ---
async function cleanOutputDir() {
  try {
    const files = await fs.readdir(MODEL_OUTPUT_DIR);
    for (const file of files) {
      await fs.rm(path.join(MODEL_OUTPUT_DIR, file), { recursive: true, force: true });
    }
    console.log(`Successfully cleaned output directory: ${MODEL_OUTPUT_DIR}`);
  } catch (error) {
    console.error(`Failed to clean output directory ${MODEL_OUTPUT_DIR}:`, error.message);
  }
}

// --- Main Model Execution Route (Supports both /model-worker/execute and /execute) ---
app.post(
  ['/model-worker/execute', '/execute'],
  upload.fields([
    { name: 'hydrographFile', maxCount: 1 },
    { name: 'tideFile', maxCount: 1 }
  ]),
  async (req, res) => {
    console.log('Model execution request received.');

    // Clean previous output files before starting new run
    await cleanOutputDir();

    const executionTime = req.body.executionTime || '60';
    const exeResolvedPath = path.resolve(FLOOD_MODEL_EXE_PATH);

    if (!fsSync.existsSync(exeResolvedPath)) {
      return res.status(500).json({
        success: false,
        message: `Executable not found at path: ${exeResolvedPath}`
      });
    }

    console.log(`Executing model: ${exeResolvedPath}`);

    // Spawn C++ / Fortran Model Process
    const modelProcess = spawn(exeResolvedPath, [], {
      cwd: path.dirname(exeResolvedPath)
    });

    let modelOutput = '';
    let modelError = '';
    let promptDetected = false;

    // Fallback timer: Send executionTime if stdout buffering delays prompt detection
    const autoSendTimer = setTimeout(() => {
      if (!promptDetected) {
        console.log(`Auto-sending execution time (${executionTime}) as fallback...`);
        modelProcess.stdin.write(executionTime + '\n');
        promptDetected = true;
      }
    }, 500);

    // --- Combined stdout Listener: Prompt Handling + Progress Logging ---
    modelProcess.stdout.on('data', (data) => {
      const outputChunk = data.toString();
      modelOutput += outputChunk;

      // 1. PROMPT DETECTION: Check if process asks for simulation time
      if (
        outputChunk.toLowerCase().includes(MODEL_TIME_PROMPT_STRING.toLowerCase()) &&
        !promptDetected
      ) {
        promptDetected = true;
        clearTimeout(autoSendTimer);
        console.log(`Prompt detected. Sending execution time: ${executionTime}`);
        modelProcess.stdin.write(executionTime + '\n');
        return;
      }

      // 2. PROGRESS LOGGING: Parse simulation timesteps from stdout
      const lines = outputChunk.trim().split('\n');
      const lastLine = lines[lines.length - 1];

      if (lastLine) {
        const parts = lastLine.trim().split(/\s+/);
        const currentStep = parseInt(parts[parts.length - 1], 10);

        if (!isNaN(currentStep) && currentStep > 0) {
          const totalSteps = parseInt(executionTime, 10);
          const percent = Math.min(Math.round((currentStep / totalSteps) * 100), 100);
          console.log(`[Model Progress] Step ${currentStep} / ${totalSteps} (${percent}%)`);
        } else {
          console.log(`Model stdout: ${lastLine}`);
        }
      }
    });

    modelProcess.stderr.on('data', (data) => {
      modelError += data.toString();
      console.error(`Model stderr: ${data.toString().trim()}`);
    });

    modelProcess.on('close', async (code) => {
      clearTimeout(autoSendTimer);
      console.log(`Model process exited with code ${code}`);

      // Cleanup input files after execution
      if (req.files.hydrographFile) {
        await fs.unlink(req.files.hydrographFile[0].path).catch(() => {});
        console.log(`Deleted uploaded input file: ${req.files.hydrographFile[0].path}`);
      }
      if (req.files.tideFile) {
        await fs.unlink(req.files.tideFile[0].path).catch(() => {});
        console.log(`Deleted uploaded input file: ${req.files.tideFile[0].path}`);
      }

      if (code !== 0) {
        return res.status(500).json({
          success: false,
          message: `Model executable failed with exit code ${code}. Error: ${modelError}`
        });
      }

      // Locate output .plt file
      try {
        const files = await fs.readdir(MODEL_OUTPUT_DIR);
        const pltFile = files.find((file) => file.endsWith('.plt'));

        if (!pltFile) {
          return res.status(500).json({
            success: false,
            message: 'Model executed successfully but no output .plt file was generated.'
          });
        }

        const pltPath = path.join(MODEL_OUTPUT_DIR, pltFile);
        console.log(`Attempting to read output file: ${pltPath}`);

        const pltData = await fs.readFile(pltPath, 'utf-8');
        console.log(`Successfully read PLT file. Length: ${pltData.length}`);

        res.json({
          success: true,
          message: 'Model executed successfully.',
          pltData
        });
      } catch (err) {
        res.status(500).json({
          success: false,
          message: `Failed to read output file: ${err.message}`
        });
      }
    });

    modelProcess.on('error', (err) => {
      clearTimeout(autoSendTimer);
      console.error(`Failed to start model process: ${err.message}`);
      res.status(500).json({
        success: false,
        message: `Failed to start model process: ${err.message}`
      });
    });
  }
);

app.listen(PORT, () => {
  console.log(`Flood model executable found at: ${path.resolve(FLOOD_MODEL_EXE_PATH)}`);
  console.log(`Model Worker server running on port ${PORT}`);
  console.log('--- Model Configuration ---');
  console.log(`EXE Path: ${path.resolve(FLOOD_MODEL_EXE_PATH)}`);
  console.log(`Input Dir: ${path.resolve(MODEL_INPUT_DIR)}`);
  console.log(`Output Dir: ${path.resolve(MODEL_OUTPUT_DIR)}`);
  console.log(`Time Prompt: "${MODEL_TIME_PROMPT_STRING}"`);
  console.log('---------------------------');
});
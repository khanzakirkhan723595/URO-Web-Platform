// -----------------------------------------------------------------------------
// File: backend/middleware/uploadMiddleware.js
// -----------------------------------------------------------------------------
const multer = require('multer');
const fs = require('fs');
// const path = require('path'); // path is not explicitly used here, but often useful with files

// Configure storage for multer
// We'll store files temporarily on the backend before forwarding to the model worker.
const UPLOAD_TEMP_DIR = process.env.UPLOAD_TEMP_DIR || './uploads/';

if (!fs.existsSync(UPLOAD_TEMP_DIR)){
    fs.mkdirSync(UPLOAD_TEMP_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_TEMP_DIR);
  },
  filename: function (req, file, cb) {
    // Use original names but ensure they are somewhat unique if needed, or just overwrite
    // For this case, fixed names are fine as they are specific.
    cb(null, file.originalname); // e.g., Hydrograph.txt, tide.txt
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'text/plain' || file.originalname.endsWith('.txt')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only .txt files are allowed.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit per file
});

// Middleware to handle 'hydrographFile' and 'tideFile'
// 'hydrographFile' is mandatory, 'tideFile' is optional
const uploadFilesMiddleware = (req, res, next) => {
    const uploader = upload.fields([
        { name: 'hydrographFile', maxCount: 1 },
        { name: 'tideFile', maxCount: 1 }
    ]);

    uploader(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            return res.status(400).json({ success: false, message: `File upload error: ${err.message}` });
        } else if (err) {
            // An unknown error occurred when uploading.
            return res.status(400).json({ success: false, message: `File upload error: ${err.message}` });
        }

        // Check if mandatory file is present
        if (!req.files || !req.files.hydrographFile || req.files.hydrographFile.length === 0) {
            // Clean up any uploaded files if the mandatory one is missing
            if (req.files && req.files.tideFile && req.files.tideFile[0]) {
                fs.unlink(req.files.tideFile[0].path, unlinkErr => {
                    if (unlinkErr) console.error("Error deleting tide file after hydrograph missing:", unlinkErr);
                });
            }
            return res.status(400).json({ success: false, message: 'Hydrograph.txt file is mandatory.' });
        }
        
        next();
    });
};

module.exports = uploadFilesMiddleware;

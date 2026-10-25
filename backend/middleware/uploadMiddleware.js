// backend/middleware/uploadMiddleware.js
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { uploadDir } = require('../config/env');

fs.mkdirSync(uploadDir, { recursive: true });

// Random, unique file names: two users uploading "Hydrograph.txt" at the same time never collide,
// and user supplied names are never used on the file system.
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${crypto.randomUUID()}.txt`),
});

const ALLOWED_MIME = ['text/plain', 'application/octet-stream'];

const fileFilter = (req, file, cb) => {
  const isTxt = path.extname(file.originalname || '').toLowerCase() === '.txt';
  if (isTxt && ALLOWED_MIME.includes(file.mimetype)) return cb(null, true);
  cb(new Error('Invalid file type. Only .txt files are allowed.'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 2, fields: 10 }, // 5MB per file
});

const uploader = upload.fields([
  { name: 'hydrographFile', maxCount: 1 },
  { name: 'tideFile', maxCount: 1 },
]);

const removeFiles = (files) => {
  Object.values(files || {})
    .flat()
    .forEach((f) => fs.unlink(f.path, () => {}));
};

const uploadFilesMiddleware = (req, res, next) => {
  uploader(req, res, (err) => {
    if (err) {
      removeFiles(req.files);
      const message =
        err.code === 'LIMIT_FILE_SIZE' ? 'File too large. Maximum size is 5 MB per file.' : `File upload error: ${err.message}`;
      return res.status(400).json({ success: false, status: 'fail', message });
    }

    const hydro = req.files && req.files.hydrographFile && req.files.hydrographFile[0];
    if (!hydro) {
      removeFiles(req.files);
      return res.status(400).json({ success: false, status: 'fail', message: 'Hydrograph.txt file is mandatory.' });
    }
    if (hydro.size === 0) {
      removeFiles(req.files);
      return res.status(400).json({ success: false, status: 'fail', message: 'The hydrograph file is empty.' });
    }
    next();
  });
};

module.exports = uploadFilesMiddleware;

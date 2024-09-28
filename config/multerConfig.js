// config/multerConfig.js
const multer = require("multer");
const path = require("path");

// Set up storage for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Directory where files will be saved
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Create a unique filename
  },
});

// File filter to accept only CSV and XLS files
const fileFilter = (req, file, cb) => {
  const filetypes = /csv|xls|xlsx/; // Accept .csv, .xls, and .xlsx
  const mimetype = filetypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetypeCheck = filetypes.test(file.mimetype);

  if (mimetype && mimetypeCheck) {
    return cb(null, true);
  } else {
    cb(new Error("File type not allowed. Please upload a CSV or XLS file."));
  }
};

const upload = multer({
  storage,
  fileFilter,
});

module.exports = upload;

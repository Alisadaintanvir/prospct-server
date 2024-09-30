const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Function to create storage with dynamic directory and ensure the directory exists
const createStorage = (directory) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      // Ensure the directory exists, if not, create it
      if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
      }
      cb(null, directory); // Set directory dynamically
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`); // Create a unique filename
    },
  });
};

// CSV File Filter (for .csv, .xls, .xlsx)
const csvFileFilter = (req, file, cb) => {
  const filetypes = /csv|xls|xlsx/; // Accept .csv, .xls, and .xlsx
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("File type not allowed. Please upload a CSV or XLS file."));
  }
};

// Image File Filter (for .jpeg, .jpg, .png)
const imageFileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png/; // Accept .jpeg, .jpg, and .png
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("File type not allowed. Please upload an image file."));
  }
};

// Define CSV upload configuration
const csvUpload = multer({
  storage: createStorage("uploads/csv"), // CSV files will be saved in 'uploads/csv'
  fileFilter: csvFileFilter,
});

// Define Image upload configuration
const imageUpload = multer({
  storage: createStorage("uploads/images"), // Images will be saved in 'uploads/images'
  fileFilter: imageFileFilter,
});

// Export both configurations
module.exports = {
  csvUpload,
  imageUpload,
};

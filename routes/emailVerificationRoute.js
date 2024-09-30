const express = require("express");
const emailVerificationController = require("../controllers/emailVerificationController");
const authMiddleware = require("../middleware/authMiddleware");
const { csvUpload } = require("../config/multerConfig");

const router = express.Router();

router.post(
  "/single",
  authMiddleware,
  emailVerificationController.singleEmailVerify
);

// Upload a file
router.post(
  "/upload",
  authMiddleware,
  csvUpload.single("file"),
  emailVerificationController.fileUpload
);

// get all the uploaded files
router.get("/files", authMiddleware, emailVerificationController.getFiles);

router.delete(
  "/files/:id",
  authMiddleware,
  emailVerificationController.deleteFile
);

router.get(
  "/bulk",
  authMiddleware,
  emailVerificationController.bulkEmailVerify
);

module.exports = router;

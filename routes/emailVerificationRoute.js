const express = require("express");
const emailVerificationController = require("../controllers/emailVerificationController");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../config/multerConfig");

const router = express.Router();

router.post(
  "/single",
  authMiddleware,
  emailVerificationController.singleEmailVerify
);

router.post(
  "/bulk",
  authMiddleware,
  upload.single("file"),
  emailVerificationController.bulkEmailVerify
);

module.exports = router;

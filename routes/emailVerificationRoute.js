const express = require("express");
const emailVerificationController = require("../controllers/emailVerificationController");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

router.post(
  "/single",
  //   authMiddleware,
  emailVerificationController.singleEmailVerify
);
module.exports = router;

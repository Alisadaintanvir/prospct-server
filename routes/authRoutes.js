const express = require("express");
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", authController.registration);
router.post("/login", authController.login);
router.post("/verify-token", authController.verifyToken);
router.post("/logout", authController.logout);
router.post("/google-auth", authController.googleAuth);
router.get("/telegram", authController.telegramAuth);
router.post("/telegram/callback", authController.telegramCallback);
router.get("/linkedin", authController.linkedinAuth);
router.get("/linkedin/login", authController.linkedinLogin);
module.exports = router;

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
router.get("/telegram/callback", authController.telegramCallback);

module.exports = router;

const express = require("express");
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", authController.registration);
router.post("/login", authController.login);
router.post("/verify-token", authController.verifyToken);
router.post("/logout", authController.logout);

module.exports = router;

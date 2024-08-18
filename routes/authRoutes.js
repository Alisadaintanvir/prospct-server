const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

router.post("/register", authController.registration);
router.post("/login", authController.login);
router.post("/verify-token", authController.verifyToken);

module.exports = router;

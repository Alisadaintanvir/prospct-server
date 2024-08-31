const express = require("express");
const creditsController = require("../controllers/creditController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/deduct", authMiddleware, creditsController.deductCredits);

module.exports = router;

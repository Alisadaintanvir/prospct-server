const planController = require("../controllers/planController");
const authMiddleware = require("../middleware/authMiddleware");

const express = require("express");
const router = express.Router();

router.get("/", authMiddleware, planController.getPlans);

module.exports = router;

const planController = require("../controllers/planController");
const authMiddleware = require("../middleware/authMiddleware");

const express = require("express");
const router = express.Router();

router.get("/", authMiddleware, planController.getPlans);
router.get("/:id", authMiddleware, planController.getPlanById);
router.post("/upgrade", authMiddleware, planController.upgradePlan);

module.exports = router;

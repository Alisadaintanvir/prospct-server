const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const savedController = require("../controllers/savedController");

const router = express.Router();

router.get("/list", authMiddleware, savedController.getList);
router.post("/save", authMiddleware, savedController.save);

module.exports = router;

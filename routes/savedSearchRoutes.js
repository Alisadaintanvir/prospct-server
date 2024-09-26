const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const savedSearchController = require("../controllers/savedSearchController");
const router = express.Router();

router.post("/", authMiddleware, savedSearchController.addSaveSearch);

module.exports = router;

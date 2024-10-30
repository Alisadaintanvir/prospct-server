const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const savedSearchController = require("../controllers/savedSearchController");
const router = express.Router();

router.post("/", authMiddleware, savedSearchController.addSaveSearch);
// Get savedSearch item by id
router.get(
  "/:searchId",
  authMiddleware,
  savedSearchController.getSavedSearchById
);

module.exports = router;

const express = require("express");
const searchController = require("../controllers/searchController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/search", authMiddleware, searchController.search);
router.post(
  "/search/ids",
  authMiddleware,
  searchController.getItemDetailsByIds
);

module.exports = router;

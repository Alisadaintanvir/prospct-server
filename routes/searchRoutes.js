const express = require("express");
const searchController = require("../controllers/searchController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, searchController.search);
router.post("/ids", authMiddleware, searchController.getItemDetailsByIds);

//Enrich functionality
router.get("/enrich/findleads", authMiddleware, searchController.findLeads);

module.exports = router;

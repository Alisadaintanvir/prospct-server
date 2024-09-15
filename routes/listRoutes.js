const listController = require("../controllers/listControllers");

const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/add", authMiddleware, listController.addList);
router.get("/get", authMiddleware, listController.getList);

module.exports = router;

const express = require("express");
const paymentController = require("../controllers/paymentController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/fastspring/create-product",
  paymentController.createOrUpdateFastspringProduct
);

module.exports = router;

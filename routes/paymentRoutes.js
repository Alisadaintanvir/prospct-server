const express = require("express");
const paymentController = require("../controllers/paymentController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/fastspring/create-product",
  paymentController.createOrUpdateFastspringProduct
);

router.post(
  "/stripe/create-payment-intent",
  paymentController.createStripePaymentIntent
);
router.post(
  "/stripe/webhook",
  express.raw({ type: "application/json" }),
  paymentController.stripeWebhook
);

module.exports = router;

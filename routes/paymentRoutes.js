const express = require("express");
const paymentController = require("../controllers/paymentController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/stripe/create-payment-intent",
  paymentController.createStripePaymentIntent
);

router.post(
  "/stripe/create-checkout-session",
  paymentController.stripeCreateCheckoutSession
);

router.post(
  "/webhook/stripe",
  express.raw({ type: "application/json" }),
  paymentController.stripeWebhook
);

router.post(
  "/webhook/fastspring",
  authMiddleware,
  paymentController.fastSpringWebhook
);

router.post("/coinpayments", paymentController.createCoinPaymentsPayment);

router.post("/coinpayments/ipn", paymentController.coinpaymentsIPN);

module.exports = router;

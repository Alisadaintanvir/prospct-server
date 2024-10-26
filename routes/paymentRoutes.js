const express = require("express");
const paymentController = require("../controllers/paymentController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// router.post(
//   "/stripe/create-payment-intent",
//   paymentController.createStripePaymentIntent
// );

router.post(
  "/stripe/create-checkout-session",
  paymentController.stripeCreateCheckoutSession
);

router.post(
  "/stripe/webhook",
  express.raw({ type: "application/json" }),
  paymentController.stripeWebhook
);

router.post(
  "/fastspring/webhook",
  authMiddleware,
  paymentController.fastSpringWebhook
);

router.post("/coinpayments", paymentController.createCoinPaymentsPayment);

router.post("/coinpayments/ipn", paymentController.coinpaymentsIPN);

router.post(
  "/perfectmoney/checkout",
  authMiddleware,
  paymentController.perfectMoneyCheckout
);

router.post(
  "/payproglobal/checkout",
  authMiddleware,
  paymentController.payProGlobalCheckout
);
router.post("/payproglobal/ipn", paymentController.PayProGlobalIPN);

module.exports = router;

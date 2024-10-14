const axios = require("axios");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const CoinPayments = require("coinpayments");

const coinPayments = new CoinPayments({
  key: process.env.COINPAYMENTS_PUBLIC_KEY, // Replace with your CoinPayments public key
  secret: process.env.COINPAYMENTS_PRIVATE_KEY, // Replace with your CoinPayments private key
});

const paymentController = {
  createStripePaymentIntent: async (req, res) => {
    const bodyItems = req.body;
    console.log(bodyItems);
    try {
      const lineItems = bodyItems.items.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
          },
          unit_amount: item.price, // Convert dollars to cents
        },
        quantity: 1,
      }));

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url: "https://app.prospct.io",
        cancel_url: "https://app.prospct.io",
      });
      res.json({ id: session.id });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  stripeWebhook: async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.log(err);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        console.log("PaymentIntent was successful!");
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  },

  fastSpringWebhook: async (req, res) => {
    const bodyData = req.body;
  },

  //CoinPayments
  createCoinPaymentsPayment: async (req, res) => {
    const { amount, currency, email, item_name } = req.body;
    console.log(req.body);

    try {
      const payment = await coinPayments.createTransaction({
        amount,
        currency: "USD",
        currency2: "BTC",
        buyer_email: email,
        item_name: item_name,
        ipn_url: "https://server.prospct.io/app/payment/coinpayments/ipn",
      });

      res.json(payment);
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "Error creating CoinPayments payment" });
    }
  },

  coinpaymentsIPN: async (req, res) => {
    const sig = req.headers["x-coinpayments-signature"];
    const bodyData = req.body;

    // Validate the IPN message (you'll need to implement your own verification)
    // This is just a simple log for demonstration
    console.log("CoinPayments IPN:", bodyData);

    // Respond to acknowledge receipt
    res.json({ received: true });
  },
};

module.exports = paymentController;

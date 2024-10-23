const axios = require("axios");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const CoinPayments = require("coinpayments");

const coinPayments = new CoinPayments({
  key: process.env.COINPAYMENTS_PUBLIC_KEY, // Replace with your CoinPayments public key
  secret: process.env.COINPAYMENTS_PRIVATE_KEY, // Replace with your CoinPayments private key
});

const cryptomusURI = "https://api.cryptomus.com/v1";

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
    console.log("stripe event invoked");

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      console.log("Webhook received:", event);

      switch (event.type) {
        case "payment_intent.succeeded":
          const paymentIntent = event.data.object;
          console.log("PaymentIntent was successful!");
          break;

        case "checkout.session.completed":
          const session = event.data.object;
          console.log("Payment succeeded:", session);
          // Handle post-payment fulfillment here
          break;

        default:
          console.log(`Unhandled event type ${event.type}`);
      }
      // Acknowledge receipt of the event
      res.status(200).send({ received: true });
    } catch (err) {
      console.log(err);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
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

  stripeCreateCheckoutSession: async (req, res) => {
    const { items } = req.body; // Expecting items in the request body

    // Create an array of line items for Stripe Checkout
    const line_items = items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
        },
        unit_amount: item.price * 100, // Convert dollars to cents
      },
      quantity: item.quantity || 1,
    }));

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items,
        mode: "payment",
        success_url: "http://localhost:5173/dashboard", // Redirect to success page
        cancel_url: "http://localhost:5173/plans-and-billings", // Redirect to cancel page
      });

      res.json({ id: session.id });
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: "Payment processing error" });
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

  cryptomousCheckout: async (req, res) => {
    try {
      const { product } = req.body;
      // create a new order
      //create a new payment intent
      const payload = {
        amount: product.price,
        currency: "usd",
        order_id: "12345",
        url_callback: "app.prospct.io",
      };

      const { data } = axios.post(`${cryptomusURI}/payment`, payload);
      console.log(data);
    } catch (error) {}
  },

  PayProGlobalIPN: async (req, res) => {
    console.log(req.body);
  },
};

module.exports = paymentController;

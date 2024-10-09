const axios = require("axios");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

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
};

module.exports = paymentController;

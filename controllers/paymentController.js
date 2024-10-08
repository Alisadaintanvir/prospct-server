const axios = require("axios");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const paymentController = {
  createOrUpdateFastspringProduct: async (req, res) => {
    try {
      const productPaths = "test-product-monthly";

      // const response = await axios.get(`https://api.fastspring.com/products/`, {
      //   headers: {
      //     accept: "application/json",
      //     "Content-Type": "application/json",
      //     Authorization: `Basic QkI0NFE2WUtRTklMQkMyVU5UTFQ1RzpaaVBwUEQxeFRDTzVISldlaVEyWGhn`,
      //   },
      // });

      // if (response.status !== 200) {
      //   throw new Error("Failed to get products");
      // }

      const options = {
        method: "POST",
        url: "https://api.fastspring.com/products",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          Authorization: `Basic QkI0NFE2WUtRTklMQkMyVU5UTFQ1RzpaaVBwUEQxeFRDTzVISldlaVEyWGhn`,
        },
        data: {
          products: [
            {
              product: "green-almond",
              display: { en: "String" },
              description: {
                summary: { en: "String" },
                action: { en: "String" },
                full: { en: "String" },
              },
              fulfillment: { instructions: { en: "String", es: "String" } },
              image:
                "https://d8y8nchqlnmka.cloudfront.net/NVaGM-nhSpQ/-FooqIP-R84/photio-imac-hero.png",
              format: "digital",
              sku: "string",
              attributes: { key1: "value1", key2: "value2" },
              pricing: {
                trial: 2,
                interval: "month",
                intervalLength: 1,
                quantityBehavior: "allow",
                quantityDefault: 1,
                paymentCollected: true,
                paidTrial: true,
                trialPrice: { USD: 21.99, EUR: 19.99 },
                price: { USD: 214.95, EUR: 210.99 },
                quantityDiscounts: { 10: 25 },
                discountReason: { en: "The Reason" },
                discountDuration: 1,
              },
            },
          ],
        },
      };

      // const createResponse = await axios.get(
      //   `https://api.fastspring.com/products/${productPaths}`,
      //   options
      // );

      axios
        .request(options)
        .then(function (response) {
          console.log(response.data);
        })
        .catch(function (error) {
          console.error(error);
        });

      return res.status(200).json({ products: "success" });
    } catch (err) {
      console.log(err);
    }
  },

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
};

module.exports = paymentController;

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const createPaymentIntent = async (items) => {
  const lineItems = items.map((item) => ({
    price_data: {
      currency: "usd",
      product_data: { name: item.name },
      unit_amount: item.price * 100,
    },
    quantity: item.quantity || 1,
  }));

  return await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    success_url: process.env.SUCCESS_URL,
    cancel_url: process.env.CANCEL_URL,
  });
};

const handleWebhook = async (signature, body) => {
  const event = stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );

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

  return event;
};

const createCheckoutSession = async (items) => {
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

  return await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items,
    mode: "payment",
    success_url: "http://localhost:5173/dashboard", // Redirect to success page
    cancel_url: "http://localhost:5173/plans-and-billings", // Redirect to cancel page
  });
};

module.exports = { createPaymentIntent, createCheckoutSession, handleWebhook };

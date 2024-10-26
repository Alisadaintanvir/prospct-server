const axios = require("axios");
const stripeService = require("../services/stripeService");
const payProGlobalService = require("../services/payProGlobalService");
const coinPaymentService = require("../services/coinPaymentService");
const perfectMoneyService = require("../services/perfectMoneyService");
const transactionService = require("../services/transactionService");
const cryptomusURI = "https://api.cryptomus.com/v1";

const paymentController = {
  // Stripe payment gateway functions
  stripeCreateCheckoutSession: async (req, res) => {
    const { items } = req.body; // Expecting items in the request body

    try {
      const session = await stripeService.createCheckoutSession(items);
      res.json({ id: session.id });
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: "Payment processing error" });
    }
  },

  stripeWebhook: async (req, res) => {
    try {
      const event = await stripeService.handleWebhook(
        req.headers["stripe-signature"],
        req.body
      );
      res.status(200).send({ received: true });
    } catch (error) {
      res.status(400).send({ error: `Webhook Error: ${error.message}` });
    }
  },

  fastSpringWebhook: async (req, res) => {
    const bodyData = req.body;
  },

  //CoinPayments
  createCoinPaymentsPayment: async (req, res) => {
    const { amount, currency, email, item_name } = req.body;

    try {
      const payment = await coinPaymentService.createCoinPayment({
        amount,
        currency,
        email,
        item_name,
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

  // Cryptomus payment gateway
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

  // PerfectMoney payment gateway
  perfectMoneyCheckout: async (req, res) => {
    const { amount, paymentId } = req.body;
    const formHTML = perfectMoneyService.generatePerfectMoneyForm({
      amount,
      paymentId,
    });

    // Send the generated form HTML as a response
    res.send(formHTML);
  },

  // PayProGlobal payment gateway
  payProGlobalCheckout: async (req, res) => {
    const { productData, totalAmount } = req.body;
    const dynamicProductId = 100072;
    const key = process.env.PAYPROGLOBAL_ENCRYPTION_KEY;
    const iv = process.env.PAYPROGLOBAL_IV;
    const baseUrl = "https://store.payproglobal.com/checkout?";
    const userId = req.user.userId;

    console.log(productData);

    try {
      // Step 1: Create a pending transaction record
      const transaction = await transactionService.createTransaction({
        userId,
        type: "PLAN_UPGRADE",
        amount: totalAmount,
        paymentGateway: "PayProGlobal",
        status: "PENDING",
      });

      // Step 2: Generate the PayProGlobal dynamic URL
      const formattedProductsData = productData.map((product) => ({
        Name: product.Name,
        "Price[USD][amount]": product.Price,
      }));

      const dynamicProductUrl = payProGlobalService.createDynamicProductUrl(
        formattedProductsData,
        key,
        iv,
        baseUrl,
        dynamicProductId
      );
      res.json({ url: dynamicProductUrl });
    } catch (error) {
      console.log(error);
    }
  },

  PayProGlobalIPN: async (req, res) => {
    console.log(req.body);
  },
};

module.exports = paymentController;

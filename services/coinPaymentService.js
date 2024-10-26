const CoinPayments = require("coinpayments");

const coinPayments = new CoinPayments({
  key: process.env.COINPAYMENTS_PUBLIC_KEY, // Replace with your CoinPayments public key
  secret: process.env.COINPAYMENTS_PRIVATE_KEY, // Replace with your CoinPayments private key
});

const createCoinPayment = async ({ amount, currency, email, item_name }) => {
  return await coinPayments.createTransaction({
    amount,
    currency: "USD", // Setting primary currency (usually USD)
    currency2: "BTC", // Target currency, e.g., BTC
    buyer_email: email,
    item_name,
    ipn_url: "https://server.prospct.io/app/payment/coinpayments/ipn",
  });
};

// Helper for IPN signature validation
const validateIPNSignature = (signature, body) => {
  // Implement the validation logic as per CoinPayments' documentation
  // Assuming `crypto` library usage or any hash-based approach to validate
  return true; // Return true if valid, false otherwise
};

module.exports = { createCoinPayment, validateIPNSignature };

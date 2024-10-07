const axios = require("axios");

const paymentController = {
  createOrUpdateFastspringProduct: async (req, res) => {
    try {
      const productPaths = "test-product-monthly";

      const response = await axios.get(`https://api.fastspring.com/products/`, {
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Basic QkI0NFE2WUtRTklMQkMyVU5UTFQ1RzpaaVBwUEQxeFRDTzVISldlaVEyWGhn`,
        },
      });

      if (response.status !== 200) {
        throw new Error("Failed to get products");
      }

      return res.status(200).json({ products: response.data.products });
    } catch (err) {
      console.log(err);
    }
  },
};

module.exports = paymentController;

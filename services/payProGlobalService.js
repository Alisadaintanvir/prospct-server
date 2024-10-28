const crypto = require("crypto");

const createDynamicProductUrl = (
  productsData,
  key,
  iv,
  baseUrl,
  productId,
  testMode = false,
  transactionId
) => {
  let dynamicProductUrl = `${baseUrl}currency=USD&page-template=19022&exfo=742&${
    testMode ? "use-test-mode=true&secret-key=@eHSxjOFtm" : ""
  }`;

  productsData.forEach((product, index) => {
    const encryptedData = encryptData(product, key, iv);
    dynamicProductUrl += `&products[${index + 1}][id]=${productId}&products[${
      index + 1
    }][data]=${encryptedData}`;
  });

  return dynamicProductUrl;
};

module.exports = { createDynamicProductUrl };

// Function to encrypt data
function encryptData(data, key, iv) {
  // Initialize cipher
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);

  // Convert data to query string
  const queryString = new URLSearchParams(data).toString();

  // Encrypt the query string
  let encrypted = cipher.update(queryString, "utf8", "base64");
  encrypted += cipher.final("base64");

  // URL encode the encrypted data
  return encodeURIComponent(encrypted);
}

const crypto = require("crypto");

const createDynamicProductUrl = (
  productsData,
  key,
  iv,
  baseUrl,
  productId,
  testMode = false,
  customDemon
) => {
  let dynamicProductUrl = `${baseUrl}?currency=USD`;

  productsData.forEach((product, index) => {
    const encryptedData = encryptData(product, key, iv);
    dynamicProductUrl += `&products[${index + 1}][id]=${productId}&products[${
      index + 1
    }][data]=${encryptedData}&x-customDemon=${customDemon}${
      testMode ? "&use-test-mode=true&secret-key=@eHSxjOFtm" : ""
    }`;
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

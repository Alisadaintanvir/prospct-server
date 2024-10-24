const crypto = require("crypto");

// Your 32-char key and 16-char IV
const key = "DWwQMfdM_KuVRA_F?-XjJKW6HE4mKKZu";
const iv = "OWhB$hcZiVVBp8-n";

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

// Function to decrypt data
function decryptData(encryptedData, key, iv) {
  // Decode URL-encoded data
  const decodedData = decodeURIComponent(encryptedData);

  // Initialize decipher
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);

  // Decrypt the data
  let decrypted = decipher.update(decodedData, "base64", "utf8");
  decrypted += decipher.final("utf8");

  // Convert the decrypted query string back to an object
  const decodedQueryString = new URLSearchParams(decrypted);
  return Object.fromEntries(decodedQueryString.entries());
}

// Sample data (mimicking the PHP associative array)
// const data = {
//   Name: "Product A",
//   Description: "Description of the product ",
//   "Price[USD][amount]": 95.95,
//   "x-marketing-campaign": "some marketing campaign name",
// };

// Sample data (multiple objects)
const dataArray = [
  {
    Name: "Product A",
    Description: "Description of product A",
    "Price[USD][amount]": 95.95,
    "x-marketing-campaign": "campaign A",
  },
  {
    Name: "Product B",
    Description: "Description of product B",
    "Price[USD][amount]": 85.0,
    "x-marketing-campaign": "campaign B",
  },
];

// Encrypt all data
const encryptedDataArray = dataArray.map((data) => encryptData(data, key, iv));

// Generate URL with same product ID but different data
const productId = 100072;
let dynamicProductUrl = `https://store.payproglobal.com/checkout?currency=USD`;

// Append each encrypted data with the same product ID
encryptedDataArray.forEach((encryptedData, index) => {
  dynamicProductUrl += `&products[${index + 1}][id]=${productId}&products[${
    index + 1
  }][data]=${encryptedData}`;
});

console.log("\nDynamic product purchase URL:");
console.log(dynamicProductUrl);

// // Encrypt the data
// const encryptedData = encryptData(dataArray, key, iv);
// console.log("\nEncrypted Data (URL-encoded):");
// console.log(encryptedData);

const sampleEncryptData =
  "9rxiPpn0guGkHLsfQ-kwQ7uL_NsZ-ON0X88KluhrgoM6zhMt_sxu9mMTJ3-EIeYB";

// Decrypt the data
const decryptedData = decryptData(sampleEncryptData, key, iv);
console.log("\nDecrypted Data:");
console.log(decryptedData);

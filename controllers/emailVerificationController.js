const axios = require("axios");

const emailVerificationController = {
  singleEmailVerify: async (req, res) => {
    const debounce_api = process.env.DEBOUNCE_API;
    try {
      const { email } = req.body;
      const emailList = email
        .split(/[\s,;]+/)
        .filter((email) => email.length > 0);

      // Array to store each email's verification result
      const verificationResults = [];

      for (const email of emailList) {
        try {
          const response = await axios.get(
            `https://api.debounce.io/v1/?email=${email}&api=${debounce_api}`
          );

          if (response.status === 200) {
            verificationResults.push({
              success: true,
              data: response.data.debounce,
            });
          } else {
            verificationResults.push({
              success: false,
              message: "Verification failed for this email",
            });
          }
        } catch (err) {
          // Handle any error that occurs during the API request
          verificationResults.push({
            email: email,
            success: false,
            message: `Error verifying email: ${error.message}`,
          });
        }
      }

      res.status(200).json({
        message: "Email verified successfully",
        results: verificationResults,
      });
    } catch (err) {
      res.status(500).json({ error: "Something went wrong" });
    }
  },
};

module.exports = emailVerificationController;

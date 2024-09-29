const axios = require("axios");

const emailVerificationController = {
  singleEmailVerify: async (req, res) => {
    const debounce_api_key = process.env.DEBOUNCE_API;
    try {
      const { emailList } = req.body;

      // Check if the email list exceeds the limit of 20 emails
      if (emailList.length > 20) {
        return res.status(400).json({
          error: "You can only verify a maximum of 20 emails at a time.",
        });
      }

      // Array to store each email's verification result
      const verificationResults = [];

      for (const email of emailList) {
        try {
          const response = await axios.get(
            `https://api.debounce.io/v1/?email=${email}&api=${debounce_api_key}`
          );

          if (response.status === 200 && response.data.success) {
            const verificationCode = response.data.debounce.code;
            verificationResults.push({
              email: email,
              status: verificationCode,
              date: new Date().toISOString(), // Add current date
              success: true,
            });
          } else {
            verificationResults.push({
              email: email,
              status: "unknown",
              date: new Date().toISOString(),
              success: false,
              message: "Verification failed for this email",
            });
          }
        } catch (err) {
          // Handle any error that occurs during the API request
          verificationResults.push({
            email: email,
            status: "unknown",
            date: new Date().toISOString(),
            success: false,
            message: `Error verifying email: ${err.message}`,
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

  bulkEmailVerify: async (req, res) => {
    const debounce_api_key = process.env.DEBOUNCE_API;
    const debounce_bulk_api_url = "https://bulk.debounce.io/v1/upload/";
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    try {
      const filePath = req.file.path;
      const fileLink = `${req.protocol}://${req.get("host")}/${filePath}`;
      console.log(fileLink);

      const response = await axios.get(
        `${debounce_bulk_api_url}?url=${fileLink}&api=${debounce_api_key}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const debounceListId = response.data.debounce.list_id;
      console.log(debounceListId);

      const statusResponse = await axios.get(
        `https://bulk.debounce.io/v1/status/?list_id=${debounceListId}&api=${debounce_api_key}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log(statusResponse.data);

      if (response.status === 200 && response.data.success) {
        res.status(200).json({
          message: "Email verified successfully",
          results: statusResponse.data,
        });
      } else {
        res.status(500).json({ error: "Something went wrong" });
      }
    } catch (err) {
      res.status(500).json({ error: "Something went wrong" });
    }
  },
};

module.exports = emailVerificationController;

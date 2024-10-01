const Queue = require("bull");
const emailVerificationQueue = new Queue("email-verification", {
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
  },
});

// Function to poll for email verification status
const pollVerificationStatus = async (listId, apiKey) => {
  const debounce_status_api_url = `https://bulk.debounce.io/v1/status/?list_id=${listId}&api=${apiKey}`;
  try {
    const response = await axios.get(debounce_status_api_url, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (err) {
    console.error("Error polling verification status:", err);
    return null;
  }
};

// Background worker to handle email verification
emailVerificationQueue.process(async (job, done) => {
  const { listId, apiKey, fileId } = job.data;

  try {
    let status = null;

    for (let attempt = 0; attempt < 10; attempt++) {
      status = await pollVerificationStatus(listId, apiKey);

      if (status && status.debounce.status === "completed") {
        console.log("Verification completed for list:", listId);
        const verificationResult = status.debounce;

        // Update the file in the database with the results
        await BulkEmailFile.findByIdAndUpdate(fileId, {
          verificationResult,
          status: "completed",
        });

        return done(null, verificationResult); // Mark job as complete
      } else {
        console.log(`Polling... attempt ${attempt + 1}`);
        await new Promise((resolve) => setTimeout(resolve, 60000)); // Wait 1 minute before polling again
      }
    }

    // If polling times out
    await BulkEmailFile.findByIdAndUpdate(fileId, {
      status: "failed",
    });
    done(new Error("Verification process timed out"));
  } catch (err) {
    console.error("Error processing email verification:", err);
    await BulkEmailFile.findByIdAndUpdate(fileId, {
      status: "failed",
    });
    done(err);
  }
});

module.exports = emailVerificationQueue;

const Queue = require("bull");
const axios = require("axios");
const BulkEmailFile = require("../models/BulkEmailFile");
const { emitVerificationUpdate } = require("../utils/socket");

const emailVerificationQueue = new Queue("email-verification", {
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
    maxRetriesPerRequest: null, // Remove limit on retries
    retryStrategy(times) {
      return Math.min(times * 50, 2000); // Retry strategy (exponential backoff)
    },
  },
});

emailVerificationQueue.on("error", (err) => {
  console.error("Redis connection error:", err);
});

// Function to poll for email verification status
const pollVerificationStatus = async (
  listId,
  apiKey,
  maxRetries = 20,
  retryDelay = 200000
) => {
  const debounce_status_api_url = `https://bulk.debounce.io/v1/status/?list_id=${listId}&api=${apiKey}`;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const statusResponse = await axios.get(debounce_status_api_url, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log(`Polling attempt ${attempt + 1}:`, statusResponse.data);

      if (
        statusResponse.data.success &&
        statusResponse.data.debounce.status === "completed"
      ) {
        console.log("Verification completed");
        return statusResponse.data.debounce;
      } else if (
        ["preparing", "queued", "validating", "processing"].includes(
          statusResponse.data.debounce.status
        )
      ) {
        console.log(`Current status: ${statusResponse.data.debounce.status}`);
      } else {
        console.error(
          "Unexpected status:",
          statusResponse.data.debounce.status
        );
        break;
      }
    } catch (error) {
      console.error(`Polling attempt ${attempt + 1} failed:`, error.message);
    }

    // Wait before next attempt
    await new Promise((resolve) => setTimeout(resolve, retryDelay));
  }

  console.error("Verification process timed out");
  return null;
};

// Process jobs from the queue
emailVerificationQueue.process(1, async (job, done) => {
  const { listId, apiKey, fileId, filePath } = job.data;
  const debounce_bulk_api_url = "https://bulk.debounce.io/v1/upload/";

  try {
    // Step 1: Send the file link to Debounce API
    const uploadResponse = await axios.get(
      `${debounce_bulk_api_url}?url=${filePath}&api=${apiKey}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("uploadresponse", uploadResponse.data);

    if (uploadResponse.status !== 200 || !uploadResponse.data.success) {
      return res
        .status(500)
        .json({ error: "Failed to upload file to Debounce" });
    }

    const debounceListId = uploadResponse.data.debounce.list_id;
    console.log(`List ID received: ${debounceListId}`);

    // Update the status of the existing file to "processing"
    await BulkEmailFile.findByIdAndUpdate(fileId, {
      status: "processing",
    });

    const verificationResult = await pollVerificationStatus(
      debounceListId,
      apiKey
    );

    if (verificationResult) {
      // Emit the real-time status update
      emitVerificationUpdate(fileId, "completed");
      await BulkEmailFile.findByIdAndUpdate(fileId, {
        filePath: verificationResult.download_link,
        status: "completed",
      });
      done(null, verificationResult);
    } else {
      emitVerificationUpdate(fileId, "failed");
      await BulkEmailFile.findByIdAndUpdate(fileId, {
        status: "failed",
      });
      done(new Error("Verification process timed out"));
    }
  } catch (error) {
    emitVerificationUpdate(fileId, "failed");
    console.error("Error processing email verification job:", error);
    await BulkEmailFile.findByIdAndUpdate(fileId, {
      status: "failed",
    });
    done(error);
  }
});

// Optional: Listen to job events for logging or notifications
emailVerificationQueue.on("completed", (job, result) => {
  console.log(`Job completed`);
  // Optionally, send a notification to the user here
});

emailVerificationQueue.on("failed", (job, err) => {
  console.log(`Job failed with error: ${err.message}`);
  // Optionally, notify the user about the failure
});

module.exports = emailVerificationQueue;

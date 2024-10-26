const Transaction = require("../models/Transaction");
const User = require("../models/User");
const Subscription = require("../models/Subscription");

const transactionService = {
  //Initialize a transaction

  createTransaction: async ({
    userId,
    type,
    amount,
    credits,
    planDetails,
    paymentGateway,
  }) => {
    const transaction = new Transaction({
      userId,
      type,
      totalAmount,
      credits,
      planDetails,
      paymentGateway,
      status: "PENDING",
    });
    return await transaction.save();
  },

  updateTransactionStatus: async (transactionId, status, responseData) => {
    const transaction = await Transaction.findByIdAndUpdate(
      transactionId,
      {
        status,
        "paymentGateway.responseData": responseData,
      },
      { new: true }
    );
    return transaction;
  },

  //Applky transaction benefit
  applyTransactionBenefits: async (userId, transaction) => {
    const user = await User.findById(userId);

    if (
      transaction.type === "PLAN_UPGRADE" ||
      transaction.type === "PLAN & CREDIT PURCHASE"
    ) {
      // Update the user's plan if a plan is specified
      if (transaction.planDetails && transaction.planDetails.planId) {
        user.plan = transaction.planDetails.planId;
        // Update or create a new subscription if needed
        // await subscriptionService.updateSubscription(userId, transaction.planDetails);
      }
    }

    if (
      transaction.type === "CREDIT_PURCHASE" ||
      transaction.type === "PLAN & CREDIT PURCHASE"
    ) {
      // Update user credits based on the specified credit type
      if (transaction.credits && transaction.credits.emailCredits) {
        user.credits.emailCredits.max += transaction.credits.emailCredits;
      }
      if (transaction.credits && transaction.credits.phoneCredits) {
        user.credits.phoneCredits.max += transaction.credits.phoneCredits;
      }
      if (transaction.credits && transaction.credits.verificationCredits) {
        user.credits.verificationCredits.max +=
          transaction.credits.verificationCredits;
        // Add more credit types as needed
      }
    }

    await user.save();
    return user;
  },
};

module.exports = transactionService;

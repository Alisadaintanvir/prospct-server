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
      amount,
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
    if (transaction.type === "PLAN_UPGRADE" && transaction.planDetails) {
      user.plan = transaction.planDetails.planId;
      await user.save();
      // Optional: Create or update user subscription based on transaction details
    } else if (transaction.type === "CREDIT_PURCHASE" && transaction.credits) {
      user.credits.emailCredits.current += transaction.credits;
      await user.save();
    }
    return user;
  },
};

module.exports = transactionService;

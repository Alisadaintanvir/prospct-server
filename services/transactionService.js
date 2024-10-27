const Transaction = require("../models/Transaction");
const User = require("../models/User");
const Subscription = require("../models/Subscription");

const transactionService = {
  //Initialize a transaction

  createTransaction: async ({ userId, totalAmount, paymentGateway, items }) => {
    const purchaseType = transactionService.determineTransactionType(items);

    const transactionItems = items
      .map((item) => {
        if (item.type === "Plan") {
          return {
            plan: {
              name: item.name,
              price: item.price,
              billingCycle: item.billingCycle || "monthly",
              quantity: item.quantity || 1,
            },
          };
        } else if (item.type === "Credit") {
          return {
            credit: {
              name: item.name,
              quantity: item.quantity,
              packagePrice: item.price,
            },
          };
        }
        return null; // Skip any items that don't match
      })
      .filter((item) => item !== null); // Remove null entries

    const transaction = new Transaction({
      userId,
      type: purchaseType,
      totalAmount,
      items: transactionItems,
      paymentGateway: {
        name: paymentGateway,
      },
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

  // Determine the type of transaction based on items
  determineTransactionType: (items) => {
    const hasPlan = items.some((item) => item.type === "Plan");
    const hasCredit = items.some((item) => item.type === "Credit");

    if (hasPlan && hasCredit) {
      return "PLAN & CREDIT PURCHASE";
    }
    if (hasPlan) {
      return "PLAN_UPGRADE";
    }
    if (hasCredit) {
      return "CREDIT_PURCHASE";
    }
    return null; // Or throw an error if needed
  },
};

module.exports = transactionService;

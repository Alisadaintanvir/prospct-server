const Transaction = require("../models/Transaction");
const User = require("../models/User");
const Subscription = require("../models/Subscription");

const { upgradeUserPlan, upgradeUserCredits } = require("./userService");

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
              planId: item.planId,
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

  //Apply transaction benefit
  applyTransactionBenefits: async (userId, transaction) => {
    // Check if transaction has already been processed
    if (transaction.status !== "COMPLETED") {
      console.log("Transaction is not completed yet.");
      return;
    }

    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Handle plan upgrades
      if (
        transaction.type === "PLAN_UPGRADE" ||
        transaction.type === "PLAN & CREDIT PURCHASE"
      ) {
        const planItem = transaction.items.find((item) => item?.plan);
        if (planItem) {
          const { planId, billingCycle } = planItem.plan;
          await upgradeUserPlan(userId, planId, billingCycle);
        }
      }

      // Handle credit purchases
      if (
        transaction.type === "CREDIT_PURCHASE" ||
        transaction.type === "PLAN & CREDIT PURCHASE"
      ) {
        const creditItems = transaction.items.filter(
          (item) =>
            item?.credit?.quantity && typeof item.credit.quantity === "number"
        );

        for (const item of creditItems) {
          await upgradeUserCredits(
            userId,
            "verification",
            item.credit.quantity
          );
        }
      }

      const updatedUser = await user.save();
      return updatedUser;
    } catch (error) {
      console.error("Error applying transaction benefits:", error);
      throw new Error(`Failed to apply transaction benefits: ${error.message}`);
    }
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

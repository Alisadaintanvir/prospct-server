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

  //Applky transaction benefit
  applyTransactionBenefits: async (userId, transaction) => {
    const user = await User.findById(userId);

    if (
      transaction.type === "PLAN_UPGRADE" ||
      transaction.type === "PLAN & CREDIT PURCHASE"
    ) {
      // Extract the plan item if it exists
      const planItem = transaction.items.find((item) => item.plan);
      if (planItem) {
        const { planId } = planItem.plan; // Make sure to extract planId correctly
        // Call the upgradeUserPlan function to apply the plan upgrade benefits
        await upgradeUserPlan(userId, planId, transaction._id);
        console.log("User plan upgraded successfully to plan:", planId);
      }
    }

    if (
      transaction.type === "CREDIT_PURCHASE" ||
      transaction.type === "PLAN & CREDIT PURCHASE"
    ) {
      const creditItem = transaction.items.find((item) => item.credit);
      await upgradeUserCredits(
        userId,
        "verification",
        creditItem.credit.quantity
      );
      console.log("User credits updated successfully.");
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

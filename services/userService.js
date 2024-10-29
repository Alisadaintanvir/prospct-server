// services/userService.js

const User = require("../models/User");
const Plan = require("../models/Plans");
const { manageUserSubscription } = require("./subscriptionService");

const CREDIT_TYPES = {
  EMAIL: "Email Credits",
  PHONE: "Phone Credits",
  VERIFICATION: "verificationCredits",
  EXPORT: "Export Credits",
};

async function upgradeUserPlan(userId, planId, billingCycle) {
  try {
    const user = await User.findById(userId);
    const plan = await Plan.findById(planId);

    if (!user || !plan) {
      throw new Error("User or Plan not found");
    }

    // Upgrade user's credits based on the selected plan's features
    // Update credits based on the plan features
    updateCredits(user.credits.emailCredits, plan.features.emailCredits);
    updateCredits(user.credits.phoneCredits, plan.features.phoneCredits);
    updateCredits(
      user.credits.verificationCredits,
      plan.features.verificationCredits
    );

    // Update user's additional perks based on the selected plan's features
    user.apiAccess = plan.features.apiAccess;
    user.prioritySupport = plan.features.prioritySupport;

    // Set the new plan and subscription
    user.plan = planId;
    // Handle subscription tracking
    const subscription = await manageUserSubscription(
      userId,
      planId,
      new Date(),
      billingCycle
    );
    user.subscription = subscription._id; // Link to the new subscription

    // Save the updated user document
    await user.save();

    return {
      success: true,
      message: "User plan updated successfully",
      user,
    };
  } catch (error) {
    console.error("Error upgrading user plan:", error);
    return {
      success: false,
      message: "Failed to upgrade user plan",
      error,
    };
  }
}

async function upgradeUserCredits(userId, creditType, quantity) {
  try {
    const user = await User.findById(userId);

    if (!user) throw new Error("User not found");

    if (!CREDIT_TYPES[creditType.toUpperCase()]) {
      throw new Error("Unknown credit type");
    }

    user.credits[CREDIT_TYPES[creditType.toUpperCase()]].max += quantity;

    await user.save();

    return {
      success: true,
      message: `${creditType} upgraded successfully.`,
      user,
    };
  } catch (error) {
    console.error("Error upgrading user credits:", error);
    return { success: false, message: "Failed to upgrade user credits", error };
  }
}

module.exports = { upgradeUserPlan, upgradeUserCredits };

function updateCredits(userCredits, planCredits) {
  if (planCredits && planCredits.max) {
    userCredits.max += planCredits.max;
    userCredits.current += planCredits.max;
  }
}

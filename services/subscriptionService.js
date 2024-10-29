const Subscription = require("../models/Subscription");
const Plan = require("../models/Plans");
const moment = require("moment");

async function manageUserSubscription(userId, planId, startDate, billingCycle) {
  // Set up end date based on plan duration
  const plan = await Plan.findById(planId);
  let endDate;
  if (billingCycle === "monthly") {
    endDate = moment(startDate).add(1, "month").toDate();
  } else if (billingCycle === "anually") {
    endDate = moment(startDate).add(1, "year").toDate();
  } else if (billingCycle === "lifetime") {
    endDate = null; // Lifetime plan, no end date
  } else {
    throw new Error("Invalid billing cycle. Choose 'monthly' or 'yearly'.");
  }

  // Mark existing active subscriptions as expired
  await Subscription.updateMany(
    { user: userId, status: "active" },
    { status: "expired", endDate: new Date() }
  );

  // Create a new subscription record for the new plan
  const newSubscription = new Subscription({
    user: userId,
    plan: planId,
    startDate,
    endDate,
    status: "active",
    billingCycle,
  });
  await newSubscription.save();

  return newSubscription;
}

module.exports = { manageUserSubscription };

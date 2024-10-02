const Plans = require("../models/Plans");
const User = require("../models/User");
const Subscription = require("../models/Subscription");
const AddOn = require("../models/AddOn");

const planControllers = {
  getPlans: async (req, res) => {
    try {
      const plans = await Plans.find();
      res.status(200).json(plans);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  upgradePlan: async (req, res) => {
    try {
      const { planId, isAnnually, additionalCredits, totalAmount } = req.body;
      const userId = req.user.userId;

      // Fetch the new plan
      const newPlan = await Plans.findById(planId);
      if (!newPlan) {
        return res
          .status(404)
          .json({ success: false, message: "Plan not found" });
      }

      // Fetch the user
      const user = await User.findById(userId);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      // Get the user’s existing subscription (if any)
      let currentSubscription = await Subscription.findOne({
        user: userId,
        status: "active",
      });

      // Expire the current subscription if it exists
      if (currentSubscription) {
        currentSubscription.status = "expired";
        await currentSubscription.save();
      }

      // Calculate subscription end date
      const startDate = new Date();
      const endDate = new Date(startDate);
      if (isAnnually) {
        endDate.setFullYear(endDate.getFullYear() + 1);
      } else {
        endDate.setMonth(endDate.getMonth() + 1);
      }

      // Create a new subscription with the selected plan
      const newSubscription = new Subscription({
        user: userId,
        plan: selectedPlan._id,
        startDate,
        endDate,
      });

      // Save the new subscription to the database
      const subscription = await newSubscription.save();

      // Save additional email verification credits as an addon
      if (additionalCredits) {
        const addon = new AddOn({
          user: userId,
          type: "emailVerification",
          quantity: additionalCredits,
          price: totalAmount, // You might want to specify the price per credit or total amount
        });
        await addon.save();
      }

      // Here we would typically integrate with a payment processor like Stripe
      // For this example, we'll assume the payment was successful

      // Update user's plan reference in the User schema
      await User.findByIdAndUpdate(userId, {
        plan: selectedPlan._id, // Update user's plan to the new plan
        credits: {
          emailCredits: { max: selectedPlan.features.emailCredits.max },
          phoneCredits: { max: selectedPlan.features.phoneCredits.max },
          verificationCredits: {
            max:
              selectedPlan.features.verificationCredits.max +
                additionalCredits || 0,
          },
          exportCredits: { max: selectedPlan.features.exportCredits?.max || 0 },
        },
      });

      res.json({
        success: true,
        message: "Plan upgraded successfully",
        subscription: {
          startDate: subscription.startDate,
          endDate: subscription.endDate,
          status: subscription.status,
        },
      });
    } catch (err) {
      console.error("Error upgrading plan:", error);
      res.status(500).json({
        success: false,
        message: "An error occurred while upgrading the plan",
      });
    }
  },
};

module.exports = planControllers;

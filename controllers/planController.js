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

  getPlanById: async (req, res) => {
    try {
      const id = req.params;
      const plan = await Plans.findById(id);
      res.status(200).json(plan);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  upgradePlan: async (req, res) => {
    try {
      const { isAnnually, additionalCredits, totalAmount, selectedPlan } =
        req.body;
      const userId = req.user.userId;

      // Fetch the user
      const user = await User.findById(userId);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      // Update user's credits only if additional credits are purchased and no plan is selected
      if (!selectedPlan && additionalCredits) {
        // Save additional email verification credits as an addon
        const addon = new AddOn({
          userId: userId,
          type: "emailVerificationCredits",
          quantity: additionalCredits,
          price: totalAmount, // Price for additional credits
        });
        await addon.save();

        // Update user's current verification credits with additional ones
        user.credits.verificationCredits.max += additionalCredits;
        user.credits.verificationCredits.current += additionalCredits;

        // Save the updated user credits
        await user.save();

        return res.json({
          success: true,
          message: "Additional email verification credits added successfully",
          credits: user.credits,
        });
      }

      // If a plan is selected, proceed with plan upgrade and add credits as well
      if (selectedPlan) {
        // Fetch the new plan
        const newPlan = await Plans.findById(selectedPlan._id);
        if (!newPlan) {
          return res
            .status(404)
            .json({ success: false, message: "Plan not found" });
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

        // Update user's plan and credits (including additional credits)
        const updatedCredits = {
          emailCredits: {
            max:
              user.credits.emailCredits.max +
              (newPlan.features.emailCredits.max || 0),
            current:
              user.credits.emailCredits.current +
              (newPlan.features.emailCredits.max || 0),
          },
          phoneCredits: {
            max:
              user.credits.phoneCredits.max +
              (newPlan.features.phoneCredits.max || 0),
            current:
              user.credits.phoneCredits.current +
              (newPlan.features.phoneCredits.max || 0),
          },
          verificationCredits: {
            max:
              user.credits.verificationCredits.max +
              (newPlan.features.verificationCredits.max || 0) +
              (additionalCredits || 0), // Add any additional credits to max
            current:
              user.credits.verificationCredits.current +
              (newPlan.features.verificationCredits.max || 0) +
              (additionalCredits || 0), // Add any additional credits to current
          },
        };

        // Save updated plan and credits
        await User.findByIdAndUpdate(userId, {
          plan: selectedPlan._id,
          credits: updatedCredits,
        });

        return res.json({
          success: true,
          message: "Plan upgraded successfully",
          subscription: {
            startDate: subscription.startDate,
            endDate: subscription.endDate,
            status: subscription.status,
          },
        });
      }

      // If neither plan nor additional credits were provided
      return res.status(400).json({
        success: false,
        message: "No plan selected or credits purchased",
      });
    } catch (error) {
      console.error("Error upgrading plan:", error);
      res.status(500).json({
        success: false,
        message: "An error occurred while upgrading the plan",
      });
    }
  },
};

module.exports = planControllers;

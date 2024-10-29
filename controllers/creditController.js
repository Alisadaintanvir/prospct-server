const User = require("../models/User");

const creditsController = {
  deductCredits: async (req, res) => {
    const userId = req.user.userId;

    try {
      const { type, quantity = 1 } = req.body;

      if (!userId || !type) {
        return res
          .status(400)
          .json({ message: "User ID and type are required" });
      }

      if (!["email", "phone", "export"].includes(type)) {
        return res.status(400).json({ error: "Invalid type" });
      }

      const user = await User.findOne({
        _id: userId,
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if the user has enough credits
      const currentCredits = user.credits[`${type}Credits`]?.current || 0;

      if (currentCredits < quantity) {
        return res.status(400).json({ message: "Insufficient credits" });
      }

      const updateFields = {};
      updateFields[`credits.${type}Credits.current`] = -quantity;

      await User.findOneAndUpdate({ _id: userId }, { $inc: updateFields });

      res.status(200).json({ message: "Credits deducted successfully" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Something went wrong" });
    }
  },

  // Reset an user credit to default
};

module.exports = creditsController;

const { client } = require("../config/db");
const { ObjectId } = require("mongodb");

const db = client.db();
const userCollection = db.collection("users");

const creditsController = {
  deductCredits: async (req, res) => {
    const userId = req.user.userId;

    try {
      const { type } = req.body;
      if (!userId || !type) {
        return res
          .status(400)
          .json({ message: "User ID and type are required" });
      }

      const updateFields = {};

      if (type === "email") {
        updateFields["credits.emailCredits"] = -1;
      } else if (type === "phone") {
        updateFields["credits.phoneCredits"] = -1;
      } else {
        return res.status(400).json({ error: "Invalid type" });
      }

      const objectId = ObjectId.createFromHexString(userId);

      const user = await userCollection.findOne({
        _id: objectId,
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check if the user has enough credits
      if (user.credits[`${type}Credits`] <= 0) {
        return res.status(400).json({ error: "Insufficient credits" });
      }

      await userCollection.updateOne(
        { _id: ObjectId.createFromHexString(userId) },
        { $inc: updateFields }
      );

      res.status(200).json({ message: "Credits deducted successfully" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Something went wrong" });
    }
  },
};

module.exports = creditsController;

// controllers/savedController.js
const { client } = require("../config/db");
const { ObjectId } = require("mongodb");

const db = client.db();
const collection = db.collection("saved_items");

const savedController = {
  // Save or update items for a user
  save: async (req, res) => {
    try {
      const { userId, item } = req.body;

      if (!userId || !item) {
        return res.status(400).json({ error: "User ID and item are required" });
      }

      const userObjectId = ObjectId(userId);

      // Find the existing entry for the user
      const existingEntry = await collection.findOne({ userId: userObjectId });

      if (existingEntry) {
        // Update existing entry
        await collection.updateOne(
          { userId: userObjectId },
          { $addToSet: { items: item }, $set: { updatedAt: new Date() } }
        );
      } else {
        // Insert new entry
        await collection.insertOne({
          userId: userObjectId,
          items: [item],
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      res.status(200).json({ message: "Item saved successfully" });
    } catch (error) {
      console.log("Error saving data:", error);
      res.status(500).json({ error: "Failed to save item" });
    }
  },
};

module.exports = savedController;

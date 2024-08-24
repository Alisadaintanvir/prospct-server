// controllers/savedController.js
const { client } = require("../config/db");
const { ObjectId } = require("mongodb");

const db = client.db();
const collection = db.collection("saved_items");

const savedController = {
  // Save or update items for a user
  save: async (req, res) => {
    try {
      const { items } = req.body;
      const userId = req.user.userId;

      if (!userId || !items) {
        return res.status(400).json({ error: "User ID and item are required" });
      }

      // Ensure `items` is an array
      const itemsArray = Array.isArray(items) ? items : [items];

      // Find the existing entry for the user
      const existingEntry = await collection.findOne({ userId });

      if (existingEntry) {
        // Update existing entry
        await collection.updateOne(
          { userId },
          {
            $addToSet: { items: { $each: itemsArray } },
            $set: { updatedAt: new Date() },
          }
        );
      } else {
        // Insert new entry
        await collection.insertOne({
          userId,
          items: itemsArray,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      console.log("item saved");

      res.status(200).json({ message: "Item saved successfully" });
    } catch (error) {
      console.log("Error saving data:", error);
      res.status(500).json({ error: "Failed to save item" });
    }
  },

  // Get saved items for a user
  getList: async (req, res) => {
    try {
      const userId = req.user.userId;

      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      const data = await collection
        .aggregate([
          {
            $match: { userId: userId }, // Match the user based on userId
          },
          {
            $project: { items: 1 }, // Project only the items field
          },
          {
            $lookup: {
              from: "contacts_v5", // The collection to join with
              localField: "items", // Field from the saved_items collection
              foreignField: "_id", // Field from the contacts_v5 collection
              as: "itemDetails", // Output array field
            },
          },
          {
            $unwind: "$itemDetails", // Unwind the itemDetails array
          },
          {
            $replaceRoot: { newRoot: "$itemDetails" }, // Replace root with itemDetails
          },
        ])
        .toArray();

      res.status(200).json({ data });
    } catch (error) {
      console.log("Error getting data:", error);
      res.status(500).json({ error: "Failed to get saved items" });
    }
  },
};

module.exports = savedController;

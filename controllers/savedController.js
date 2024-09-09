const SavedItem = require("../models/SavedItem");
const Contacts_V5 = require("../models/Contacts");

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
      const existingEntry = await SavedItem.findOne({ userId });

      if (existingEntry) {
        // Update existing entry
        await SavedItem.findOneAndUpdate(
          { userId },
          {
            $addToSet: { items: { $each: itemsArray } },
            $set: { updatedAt: new Date() },
          }
        );
      } else {
        // Insert new entry
        await SavedItem.create({
          userId,
          items: itemsArray,
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

  // Get saved items for a user
  getList: async (req, res) => {
    try {
      const userId = req.user.userId;

      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      // Fetch the saved items document for the user
      const userDocument = await SavedItem.findOne({ userId }).populate(
        "items"
      );

      if (!userDocument) {
        return res
          .status(404)
          .json({ error: "No saved items found for this user" });
      }

      // Extract the items array and calculate the count
      const itemsArray = userDocument.items || [];
      const totalSavedItems = itemsArray.length;

      res.status(200).json({
        data: itemsArray,
        totalSavedItems,
      });
    } catch (error) {
      console.log("Error getting data:", error);
      res.status(500).json({ error: "Failed to get saved items" });
    }
  },
};

module.exports = savedController;

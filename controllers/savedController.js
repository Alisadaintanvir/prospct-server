const SavedItem = require("../models/SavedItem");
const Contacts_V5 = require("../models/Contacts");
const User = require("../models/User");
const List = require("../models/List");

const savedController = {
  // Save or update items for a user
  addSavedItems: async (req, res) => {
    try {
      const { savedItems, listNames = [] } = req.body;
      const userId = req.user.userId;

      if (!userId || !savedItems) {
        return res
          .status(400)
          .json({ error: "User ID and saved item are required" });
      }

      // Ensure savedItems is always an array
      const itemsToSave = Array.isArray(savedItems) ? savedItems : [savedItems];

      if (itemsToSave.length === 0) {
        return res.status(400).json({ error: "No valid items to save" });
      }

      // Step 1: If lists are provided, create or fetch them
      let listIds = [];
      if (listNames.length > 0) {
        const lists = await createOrFetchLists(userId, listNames);
        listIds = lists.map((list) => list._id);
      }

      // Step 2: Prepare bulk operation for saving items
      const bulkOps = itemsToSave.map((item) => {
        const itemId = typeof item === "object" && item._id ? item._id : item;
        return {
          updateOne: {
            filter: { userId, itemId },
            update: {
              $setOnInsert: {
                userId,
                itemId,
              },
              $addToSet: { listIds: { $each: listIds } },
            },
            upsert: true,
          },
        };
      });

      // Step 3: Execute bulk operation
      const result = await SavedItem.bulkWrite(bulkOps);

      res.status(200).json({
        message: "Items saved successfully",
        inserted: result.upsertedCount,
        modified: result.modifiedCount,
      });
    } catch (error) {
      console.log("Error saving data:", error);
      res.status(500).json({ error: "Failed to save items" });
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
        "itemId"
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

// function to save or fetch list
async function createOrFetchLists(userId, listNames) {
  // Fetch existing lists that match the list names for the given user
  const existingLists = await List.find({ userId, name: { $in: listNames } });

  // Get the names of the existing lists
  const existingListNames = existingLists.map((list) => list.name);

  // Filter out new list names that don't exist yet
  const newLists = listNames
    .filter((name) => !existingListNames.includes(name))
    .map((name) => ({
      userId,
      name,
      slug: name.toLowerCase().replace(/\s+/g, "-"),
    }));

  // Insert new lists into the database
  let insertedLists = [];
  if (newLists.length > 0) {
    insertedLists = await List.insertMany(newLists);
  }

  // Combine existing and newly created lists
  const allLists = [...existingLists, ...insertedLists];

  // Return both the existing and newly created lists
  return allLists;
}

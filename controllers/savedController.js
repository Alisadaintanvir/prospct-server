const SavedItem = require("../models/SavedItem");
const Contacts_V5 = require("../models/Contacts");
const User = require("../models/User");
const List = require("../models/List");

const savedController = {
  // Save or update items for a user
  save: async (req, res) => {
    try {
      const { items, lists } = req.body;
      const userId = req.user.userId;

      if (!userId || !items) {
        return res.status(400).json({ error: "User ID and item are required" });
      }

      // Ensure `items` is an array
      const itemsArray = Array.isArray(items) ? items : [items];

      // Find the existing user
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const existingLists = await List.find({ userId, name: { $in: lists } });

      // Find missing list names
      const existingListNames = existingLists.map((list) => list.name);
      const missingListNames = lists.filter(
        (listName) => !existingListNames.includes(listName)
      );

      const createdLists = await List.insertMany(
        missingListNames.map((name) => ({
          userId,
          name,
          slug: name.replace(/\s+/g, "-").toLowerCase(),
        })),
        { ordered: false } // Continue inserting even if some documents fail
      );

      // Combine existing lists and newly created lists
      const allLists = [...existingLists, ...createdLists];

      // Map list names to their IDs
      const listIdMap = allLists.reduce((acc, list) => {
        acc[list.name] = list._id;
        return acc;
      }, {});

      // Save items to each list
      if (lists.length > 0) {
        await Promise.all(
          Object.entries(listIdMap).map(async ([listName, listId]) => {
            if (!listId) {
              return;
            }

            const existingEntry = await SavedItem.findOne({
              userId,
              listIds: listId,
            });

            if (existingEntry) {
              // Update existing entry
              await SavedItem.findOneAndUpdate(
                { userId, listIds: listId },
                {
                  $addToSet: { items: { $each: itemsArray } },
                  $set: { updatedAt: new Date() },
                }
              );
            } else {
              // Insert new entry
              await SavedItem.create({
                userId,
                listIds: listId,
                items: itemsArray,
                createdAt: new Date(),
                updatedAt: new Date(),
              });
            }
          })
        );
      } else {
        // If no lists are provided, create a "general" entry

        // find existing saved entry
        const existingEntry = await SavedItem.findOne({
          userId,
          listIds: { $eq: [] },
        });

        if (existingEntry) {
          // Update existing entry
          await SavedItem.findOneAndUpdate(
            { userId, listIds: { $eq: [] } },
            {
              $addToSet: { items: { $each: itemsArray } },
              $set: { updatedAt: new Date() },
            }
          );
        } else {
          await SavedItem.create({
            userId,
            items: itemsArray,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
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

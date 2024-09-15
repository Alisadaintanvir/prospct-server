const List = require("../models/List");

const listController = {
  addList: async (req, res) => {
    try {
      const { name, items } = req.body;
      const slug = name.replace(/\s+/g, "-").toLowerCase();
      const existingList = await List.findOne({ slug });
      if (existingList) {
        return res.status(400).json({ message: "List already exists" });
      }
      const newList = new List({ name, slug, items });
      await newList.save();
      res.status(200).json({ message: "List added successfully" });
    } catch (err) {
      res.status(500).json(err);
    }
  },

  addItemToList: async (req, res) => {
    try {
      const { listIds, itemIds } = req.body;
      if (!Array.isArray(listIds) || !Array.isArray(itemIds)) {
        return res.status(400).json({ message: "Invalid input data" });
      }

      for (const listId of listIds) {
        const list = await List.findById(listId);
        if (!list) {
          return res.status(404).json({ message: "List not found" });
        }

        list.items = [...new Set([...list.items, ...itemIds])];
        await list.save();
      }
      return res
        .status(200)
        .json({ message: "Items added to lists successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  getList: async (req, res) => {
    try {
      const lists = await List.find();
      res.status(200).json(lists);
    } catch (err) {
      res.status(500).json(err);
    }
  },
};

module.exports = listController;

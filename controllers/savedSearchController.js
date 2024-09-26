const SavedSearch = require("../models/SavedSearch");

const savedSearchController = {
  addSaveSearch: async (req, res) => {
    try {
      const { searchName, filters, excludedFilters } = req.body;
      const userId = req.user.userId;
      const savedSearch = new SavedSearch({
        searchName,
        filters,
        excludedFilters,
        userId,
      });
      await savedSearch.save();
      res.status(200).json({ message: "Search saved successfully" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Something went wrong" });
    }
  },
};

module.exports = savedSearchController;

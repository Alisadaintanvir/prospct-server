const RecentSearch = require("../models/RecentSearch");

const recentSearchController = {
  addRecentSearch: async (req, res) => {
    try {
      const { userId } = req.user;
      const { filters, excludedFilters, currentPage, viewType, limit } =
        req.body;

      // Save the new search to the recent searches collection
      const newRecentSearch = new RecentSearch({
        userId,
        searchParams: {
          filters,
          excludedFilters,
        },
      });

      await newRecentSearch.save();

      // Limit recent searches to a certain number (e.g., 5)
      const userRecentSearches = await RecentSearch.find({ userId }).sort({
        createdAt: -1,
      });

      if (userRecentSearches.length > 5) {
        // Remove the oldest search
        await RecentSearch.findByIdAndDelete(userRecentSearches[5]._id);
      }

      res.status(201).json({ message: "Recent search added successfully" });
    } catch (error) {
      console.error("Error adding recent search:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};

module.exports = recentSearchController;

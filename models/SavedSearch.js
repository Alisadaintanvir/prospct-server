const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SavedSearchSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  searchName: {
    type: String,
    required: true,
  },
  filters: {
    type: Object, // Store the search filters
    required: true,
  },
  excludedFilters: {
    type: Object, // Store the excluded filters
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const SavedSearch = mongoose.model("SavedSearch", SavedSearchSchema);
module.exports = SavedSearch;

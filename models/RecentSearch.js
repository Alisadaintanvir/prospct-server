const mongoose = require("mongoose");

const recentSearchSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  searchParams: {
    type: Object,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index to ensure we can quickly find searches by user and sort by date
recentSearchSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("RecentSearch", recentSearchSchema);

const mongoose = require("mongoose");

const ListSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
    },
  },
  { timestamps: true }
);

// Add a compound index for uniqueness on userId and list name
ListSchema.index({ userId: 1, slug: 1 }, { unique: true });

const List = mongoose.model("List", ListSchema);

module.exports = List;

const mongoose = require("mongoose");

const listSchema = new mongoose.Schema(
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
    items: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SavedItem",
      },
    ],
  },
  { timestamps: true }
);

const List = mongoose.model("List", listSchema);

module.exports = List;

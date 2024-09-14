const mongoose = require("mongoose");

const listSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  items: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SavedItem",
    },
  ],
});

const List = mongoose.model("List", listSchema);

module.exports = List;

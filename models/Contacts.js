const mongoose = require("mongoose");

const contactsV5Schema = new mongoose.Schema({
  _id: String,
  _index: String,
  _type: String,
  _score: Number,
  _source: mongoose.Schema.Types.Mixed,
});

module.exports = mongoose.model("Contacts_V5", contactsV5Schema);

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  credits: {
    emailCredits: {
      type: Number,
      default: 100,
    },
    phoneCredits: {
      type: Number,
      default: 30,
    },
    exportCredits: {
      type: Number,
      default: 30,
    },
  },
  token: {
    type: String,
    default: null,
  },
  role: {
    type: String,
    default: "user", // or define your roles here
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model("User", userSchema);
module.exports = User;

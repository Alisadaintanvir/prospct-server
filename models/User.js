const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  company: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  countryCode: {
    type: String,
    default: "+1", // Default country code
  },
  credits: {
    emailCredits: {
      current: {
        type: Number,
        default: 100,
      },
      max: {
        type: Number,
        default: 100,
      },
    },
    phoneCredits: {
      current: {
        type: Number,
        default: 30,
      },
      max: {
        type: Number,
        default: 30,
      },
    },
    exportCredits: {
      current: {
        type: Number,
        default: 30,
      },
      max: {
        type: Number,
        default: 30,
      },
    },
  },
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Plan",
    required: true,
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

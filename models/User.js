const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    trim: true,
    lowercase: true,
  },
  company: {
    type: String,
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
  },
  password: {
    type: String,
    minlength: 8,
  },
  countryCode: {
    type: String,
    default: "+1", // Default country code
  },
  googleId: {
    type: String,
  },
  telegramId: {
    type: String,
  },
  linkedInId: {
    type: String,
  },
  profilePicture: {
    type: String,
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
    verificationCredits: {
      current: {
        type: Number,
        default: 50,
      },
      max: {
        type: Number,
        default: 50,
      },
    },
    exportCredits: {
      current: {
        type: Number,
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
  subscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subscription",
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

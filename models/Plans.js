const mongoose = require("mongoose");

const planSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    default: "Basic",
  },
  emailCredits: {
    max: {
      type: Number,
      default: 100,
    },
  },
  phoneCredits: {
    max: {
      type: Number,
      default: 30,
    },
  },
  exportCredits: {
    max: {
      type: Number,
      default: 15,
    },
  },
  price: {
    type: Number,
    required: true,
    default: 0,
  },
});

const Plan = mongoose.model("Plan", planSchema);
module.exports = Plan;

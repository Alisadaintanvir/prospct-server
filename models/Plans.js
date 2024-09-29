const mongoose = require("mongoose");

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      default: "Basic",
    },
    description: {
      type: String,
      default: "Basic Plan",
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    duration: {
      type: String,
      enum: ["monthly", "yearly", "lifetime"],
      default: "lifetime",
    },
    features: {
      emailCredits: {
        max: { type: Number, default: 100 },
      },
      phoneCredits: {
        max: { type: Number, default: 30 },
      },
      exportCredits: {
        max: { type: Number, default: 15 },
      },
      apiAccess: { type: Boolean, default: false },
      prioritySupport: { type: Boolean, default: false },
    },
    discount: {
      type: Number,
      default: 0, // Discount in percentage
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

const Plan = mongoose.model("Plan", planSchema);
module.exports = Plan;

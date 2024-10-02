const mongoose = require("mongoose");

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      default: "Free",
    },
    description: {
      type: String,
      default: "Free Plan",
    },
    pricing: {
      monthly: {
        price: {
          type: Number,
          default: 0,
          min: [0, "Price cannot be negative"],
        },
        discount: {
          type: Number,
          default: 0,
          min: [0, "Discount cannot be negative"],
          max: [100, "Discount cannot exceed 100%"],
        },
      },
      yearly: {
        price: {
          type: Number,
          default: 0,
          min: [0, "Price cannot be negative"],
        },
        discount: {
          type: Number,
          default: 0,
          min: [0, "Discount cannot be negative"],
          max: [100, "Discount cannot exceed 100%"],
        },
      },
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
      verificationCredits: {
        max: { type: Number, default: 50 },
      },
      exportCredits: {
        max: { type: Number },
      },
      apiAccess: { type: Boolean, default: false },
      prioritySupport: { type: Boolean, default: false },
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      required: true,
    },
    recommended: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Plan = mongoose.model("Plan", planSchema);
module.exports = Plan;

// models/AddOn.js

const mongoose = require("mongoose");

const addOnSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["emailVerificationCredits"], // Extend this enum as you add more add-on types
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
    },
    price: {
      type: Number,
      required: true,
      min: [0, "Price cannot be negative"],
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
    // Optionally, link to a subscription if the add-on is tied to a specific subscription period
    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
    },
  },
  { timestamps: true }
);

const AddOn = mongoose.model("AddOn", addOnSchema);
module.exports = AddOn;

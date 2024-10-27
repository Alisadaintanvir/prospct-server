const mongoose = require("mongoose");

const transactionItemSchema = new mongoose.Schema(
  {
    plan: {
      planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Plan",
      },
      name: {
        type: String,
      },
      price: {
        type: Number,
      },
      billingCycle: {
        type: String,
      },
      quantity: {
        type: Number,
      },
    },
    credit: {
      name: {
        type: String,
      },
      quantity: {
        type: Number,
      },
      packagePrice: {
        type: Number,
      },
    },
  },
  { _id: false }
); // Prevent creating an _id for each item

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["PLAN_UPGRADE", "CREDIT_PURCHASE", "PLAN & CREDIT PURCHASE"],
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED", "REFUNDED"],
      default: "PENDING",
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    items: [transactionItemSchema],

    paymentGateway: {
      name: String, // e.g., 'stripe', 'paypal'
      transactionId: String,
      paymentMethod: String,
      responseData: Object,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Transaction", transactionSchema);

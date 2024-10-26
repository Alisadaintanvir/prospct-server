const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["PLAN_UPGRADE", "CREDIT_PURCHASE"],
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED", "REFUNDED"],
      default: "PENDING",
    },
    amount: {
      type: Number,
      required: true,
    },
    credits: {
      type: Number,
      default: 0,
    },
    planDetails: {
      planId: String,
      planName: String,
      validFrom: Date,
      validTo: Date,
    },
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

const mongoose = require("mongoose");

const transactionItemSchema = new mongoose.Schema({
  itemType: {
    type: String,
    enum: ["plan", "credit"],
    required: true,
  },
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Plan",
    required: function () {
      if (this.itemType === "plan") {
        return true;
      }
    },
  },
  credit: {
    quantity: {
      type: Number,
      required: function () {
        if (this.itemType === "credit") {
          return true;
        }
      },
    },
    packagePrice: {
      type: Number,
      required: function () {
        if (this.itemType === "credit") {
          return true;
        }
      },
    },
  },
});

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
    items: [
      {
        name: String,
        type: mongoose.Schema.Types.ObjectId,
        ref: "Plan",
      },
      {
        name: String,
        amount: {
          type: Number,
        },
        quantity: {
          type: Number,
        },
      },
    ],

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

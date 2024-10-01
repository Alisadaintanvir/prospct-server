const e = require("express");
const mongoose = require("mongoose");

const BulkEmailFileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Link to the user
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
    totalEmails: { type: Number, required: true, default: 0 },
    billableEmails: { type: Number, required: true, default: 0 },
    duplicateEmails: { type: Number, required: true, default: 0 },
    invalidEmails: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      required: true,
      default: "unverified",
      enum: ["unverified", "verified", "pending", "processing", "completed"],
    },
    downloadLink: { type: String },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("BulkEmailFile", BulkEmailFileSchema);

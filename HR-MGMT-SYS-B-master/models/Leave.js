const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Leave applicant
    type: { type: String, required: true }, // "Sick", "Casual", etc.
    from: { type: Date, required: true },
    to: { type: Date, required: true },
    reason: { type: String },

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },

    approver: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // who approved/rejected
    approverComment: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Leave", leaveSchema);

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: {
      type: String,
      enum: ["SuperAdmin", "Admin", "HR", "Manager", "Employee"],
      default: "Employee",
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    }, // For Manager & HR
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    }, // For HR
    hr: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    }, // For Employees under HR
    otp: String,
    otpExpiry: Date,
    isVerified: {
      type: Boolean,
      default: false,
    },
    resetToken: String, // ✅ For password reset
    resetTokenExpiry: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);

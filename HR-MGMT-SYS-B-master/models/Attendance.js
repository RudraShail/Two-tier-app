const mongoose = require("mongoose");

const breakSchema = new mongoose.Schema(
  {
    start: { type: Date, required: true },
    end: { type: Date },
    durationMinutes: { type: Number, default: 0 }, // Optional for summary
  },
  { _id: false }
);

const attendanceSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    date: { type: Date, default: Date.now },
    clockIn: Date,
    clockOut: Date,
    breaks: [breakSchema],
    totalWorkMinutes: Number,
    location: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Attendance", attendanceSchema);

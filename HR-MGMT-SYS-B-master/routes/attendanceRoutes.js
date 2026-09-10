const express = require("express");
const router = express.Router();
const {
  markCheckIn,
  markCheckOut,
  getAttendanceByUser,
  getAllAttendance,
  startBreak,
  endBreak,
  getAttendanceHierarchy,
  checkTodayAttendance,
  checkBreakStatus,
  getTeamBreaks,
} = require("../controllers/attendanceController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

router.post("/checkin", protect, markCheckIn);
router.post("/checkout", protect, markCheckOut);
router.post("/check-attendance", protect, checkTodayAttendance);

// 💼 Break Management
router.post("/break/start", protect, startBreak);
router.post("/break/end", protect, endBreak);
router.post("/break/status", protect, checkBreakStatus);

router.get("/user/:id", protect, getAttendanceByUser);

// Admin / HR
router.get(
  "/",
  protect,
  restrictTo("SuperAdmin", "Admin", "HR"),
  getAllAttendance
);
// Admin / HR
router.get("/get-team-breaks", protect, getTeamBreaks);
router.get("/attendance-hierarchy", protect, getAttendanceHierarchy);

module.exports = router;

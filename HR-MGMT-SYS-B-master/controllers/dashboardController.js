const User = require("../models/User");
const Attendance = require("../models/Attendance");
const Leave = require("../models/Leave");
const moment = require("moment");

const getDashboardStats = async (req, res) => {
  try {
    const today = moment().startOf("day");
    const user = req.user;

    // 1. Check if user clocked in today
    const attendance = await Attendance.findOne({
      user: user._id,
      date: { $gte: today.toDate() },
    });

    const clockedIn = attendance ? "✅ Clocked In" : "❌ Not Clocked In";

    // 2. Total Hours and Break Time
    const totalHours = attendance?.totalHours || "00:00";
    const breakTime = attendance?.breakDuration || "00:00";

    // 3. Late Entry
    const lateEntry = attendance?.late ? "⌛ Yes" : "⏱️ No";

    // 4. Team Stats (Assuming Manager/HR/Admin want team data)
    let teamPresent = null;
    let teamTotal = null;
    let attendancePercent = null;
    let leavesToday = null;

    if (["SuperAdmin", "Admin", "Manager", "HR"].includes(user.role)) {
      const teamUsers = await User.find({
        role: "Employee",
        tenantId: user.tenantId,
      });

      teamTotal = teamUsers.length;

      // Count team present today
      const presentToday = await Attendance.find({
        user: { $in: teamUsers.map((u) => u._id) },
        date: { $gte: today.toDate() },
      });

      teamPresent = presentToday.length;

      // Attendance %
      attendancePercent =
        teamTotal > 0 ? Math.round((teamPresent / teamTotal) * 100) : 0;

      // Leaves Today
      const todayLeaves = await Leave.find({
        user: { $in: teamUsers.map((u) => u._id) },
        startDate: { $lte: today.endOf("day").toDate() },
        endDate: { $gte: today.toDate() },
        status: "Approved",
      });

      leavesToday = todayLeaves.length;
    }

    res.status(200).json({
      clockedIn,
      totalHours,
      breakTime,
      lateEntry,
      teamPresent: teamPresent !== null ? `${teamPresent}/${teamTotal}` : "N/A",
      attendancePercent:
        attendancePercent !== null ? `${attendancePercent}%` : "N/A",
      leavesToday: leavesToday !== null ? leavesToday : "N/A",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching dashboard data" });
  }
};
module.exports = { getDashboardStats };

const Attendance = require("../models/Attendance");
const User = require("../models/User");

// ⏰ CHECK-IN
exports.markCheckIn = async (req, res) => {
  try {
    const { date, time } = req.body;

    const existing = await Attendance.findOne({ user: req.user._id, date });
    if (existing) {
      return res.status(400).json({ message: "Already checked in today" });
    }

    const attendance = await Attendance.create({
      user: req.user._id,
      date,
      clockIn: time,
    });

    res
      .status(201)
      .json({ message: "Checked in successfully", data: attendance });
  } catch (err) {
    res.status(500).json({ message: "Check-in failed", error: err.message });
  }
};

// ⏳ START BREAK
exports.startBreak = async (req, res) => {
  try {
    const { date, time } = req.body;

    const attendance = await Attendance.findOne({ user: req.user._id, date });
    if (!attendance) {
      return res.status(404).json({ message: "Attendance not found" });
    }

    attendance.breaks.push({ start: time });
    await attendance.save();

    res.status(200).json({ message: "Break started", data: attendance });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to start break", error: err.message });
  }
};

// 🔁 END BREAK
exports.endBreak = async (req, res) => {
  try {
    const { date, time } = req.body;

    const attendance = await Attendance.findOne({ user: req.user._id, date });
    if (!attendance) {
      return res.status(404).json({ message: "Attendance not found" });
    }

    const lastBreak = attendance.breaks[attendance.breaks.length - 1];
    if (!lastBreak || lastBreak.end) {
      return res.status(400).json({ message: "No active break found" });
    }

    lastBreak.end = time;
    const duration = (new Date(time) - new Date(lastBreak.start)) / 60000;
    lastBreak.durationMinutes = Math.round(duration);

    await attendance.save();
    res.status(200).json({ message: "Break ended", data: attendance });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to end break", error: err.message });
  }
};

// 🔚 CHECK-OUT + Calculate Total Work Minutes
exports.markCheckOut = async (req, res) => {
  try {
    const { date, time } = req.body;

    const attendance = await Attendance.findOne({ user: req.user._id, date });
    if (!attendance || !attendance.clockIn) {
      return res.status(404).json({ message: "No check-in record found" });
    }

    attendance.clockOut = time;

    const clockIn = new Date(attendance.clockIn);
    const clockOut = new Date(time);
    const totalMinutes = (clockOut - clockIn) / 60000;

    const lastBreak = attendance.breaks[attendance.breaks.length - 1];
    if (lastBreak && !lastBreak.end) {
      lastBreak.end = time;
      const duration = (new Date(time) - new Date(lastBreak.start)) / 60000;
      lastBreak.durationMinutes = Math.round(duration);
    }

    const totalBreakMinutes = attendance.breaks.reduce(
      (sum, b) => sum + (b.durationMinutes || 0),
      0
    );

    attendance.totalWorkMinutes = Math.round(totalMinutes - totalBreakMinutes);

    await attendance.save();

    res
      .status(200)
      .json({ message: "Checked out successfully", data: attendance });
  } catch (err) {
    res.status(500).json({ message: "Check-out failed", error: err.message });
  }
};

// ✅ Check if user has checked in/out today
exports.checkTodayAttendance = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const attendance = await Attendance.findOne({
      user: req.user._id,
      date: {
        $gte: todayStart,
        $lte: todayEnd,
      },
    });

    if (!attendance) {
      return res
        .status(404)
        .json({ message: "No attendance record for today" });
    }

    res.status(200).json({
      message: "Today's attendance retrieved",
      data: attendance,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch today's attendance",
      error: err.message,
    });
  }
};

// 🔍 Check active break status
exports.checkBreakStatus = async (req, res) => {
  try {
    const { date } = req.body;

    const attendance = await Attendance.findOne({
      user: req.user._id,
      date,
    });

    if (!attendance) {
      return res.status(404).json({ message: "Attendance not found for date" });
    }

    const lastBreak = attendance.breaks[attendance.breaks.length - 1];
    const onBreak = lastBreak && !lastBreak.end;

    res.status(200).json({
      message: onBreak ? "User is currently on break" : "User is not on break",
      onBreak,
      lastBreak: onBreak ? lastBreak : null,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to check break status",
      error: err.message,
    });
  }
};

// 📅 GET BY USER
exports.getAttendanceByUser = async (req, res) => {
  try {
    const attendances = await Attendance.find({ user: req.params.id })
      .sort({ date: -1 })
      .populate("user", "name"); // 👈 populate 'user' and only include 'name' field

    res.status(200).json({ data: attendances });
  } catch (err) {
    res.status(500).json({ message: "Fetch failed", error: err.message });
  }
};

// 👥 GET ALL
exports.getAllAttendance = async (req, res) => {
  try {
    const data = await Attendance.find()
      .populate("user", "name email role")
      .sort({ date: -1 });

    res.status(200).json({ data });
  } catch (err) {
    res.status(500).json({ message: "Fetch failed", error: err.message });
  }
};

// 🧑‍🤝‍🧑 Get all team members' break data
exports.getTeamBreaks = async (req, res) => {
  try {
    const currentUser = req.user;
    let userIds = [];

    if (currentUser.role === "Admin") {
      const managers = await User.find({ admin: currentUser._id }, "_id");
      const managerIds = managers.map((u) => u._id);

      const hrs = await User.find({ manager: { $in: managerIds } }, "_id");
      const hrIds = hrs.map((u) => u._id);

      const employees = await User.find({ hr: { $in: hrIds } }, "_id");
      const employeeIds = employees.map((u) => u._id);

      userIds = [...managerIds, ...hrIds, ...employeeIds];
    } else if (currentUser.role === "Manager") {
      const hrs = await User.find({ manager: currentUser._id }, "_id");
      const hrIds = hrs.map((u) => u._id);

      const employees = await User.find({ hr: { $in: hrIds } }, "_id");
      const employeeIds = employees.map((u) => u._id);

      userIds = [...hrIds, ...employeeIds];
    } else if (currentUser.role === "HR") {
      const employees = await User.find({ hr: currentUser._id }, "_id");
      const employeeIds = employees.map((u) => u._id);

      userIds = [...employeeIds];
    } else {
      return res
        .status(403)
        .json({ message: "Not authorized to view team breaks" });
    }

    const attendanceData = await Attendance.find({ user: { $in: userIds } })
      .populate("user", "name email role")
      .sort({ date: -1 });

    // Optionally filter only users with breaks
    const teamBreaks = attendanceData.filter(
      (record) => record.breaks.length > 0
    );

    res.status(200).json({ data: teamBreaks });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch team break data", error: err.message });
  }
};

// 👁️ Get hierarchical attendance based on role
exports.getAttendanceHierarchy = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);

    let subordinateQuery = {};

    // Admin: See Managers, HRs, Employees under them
    if (currentUser.role === "Admin") {
      subordinateQuery = {
        $or: [
          { admin: req.user._id },
          { manager: req.user._id },
          { hr: req.user._id },
        ],
      };
    }

    // Manager: See HRs, Employees under them
    else if (currentUser.role === "Manager") {
      subordinateQuery = {
        $or: [{ manager: req.user._id }, { hr: req.user._id }],
      };
    }

    // HR: See Employees under them
    else if (currentUser.role === "HR") {
      subordinateQuery = {
        hr: req.user._id,
      };
    }

    // Employee: Forbidden
    else {
      return res.status(403).json({ message: "Access denied" });
    }

    // Find all subordinates
    const subordinates = await User.find(subordinateQuery).select("_id");
    const subordinateIds = subordinates.map((u) => u._id);

    // Fetch attendance of all subordinates
    const attendances = await Attendance.find({ user: { $in: subordinateIds } })
      .populate("user", "name email role")
      .sort({ date: -1 });

    res.status(200).json({ data: attendances });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch hierarchical attendance",
      error: err.message,
    });
  }
};

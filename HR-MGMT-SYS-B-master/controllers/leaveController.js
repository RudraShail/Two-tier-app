const Leave = require("../models/Leave");
const User = require("../models/User");

// 🟢 Apply for Leave
exports.applyLeave = async (req, res) => {
  try {
    const { type, from, to, reason } = req.body;
    const leave = await Leave.create({
      user: req.user._id,
      type,
      from,
      to,
      reason,
    });
    res.status(201).json({ message: "Leave applied", data: leave });
  } catch (err) {
    res.status(500).json({ message: "Apply failed", error: err.message });
  }
};

// ✅ Approve Leave
exports.approveLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id).populate("user");
    if (!leave) return res.status(404).json({ message: "Leave not found" });

    const applicantRole = leave.user.role;
    const approverRole = req.user.role;

    // Approval logic
    if (
      (applicantRole === "Employee" &&
        ["HR", "Manager", "Admin"].includes(approverRole)) ||
      (applicantRole === "HR" && ["Manager", "Admin"].includes(approverRole)) ||
      (applicantRole === "Manager" && approverRole === "Admin")
    ) {
      leave.status = "Approved";
      leave.approver = req.user._id;
      leave.approverComment = req.body.comment || "";
      await leave.save();
      return res.status(200).json({ message: "Leave approved", data: leave });
    }

    return res
      .status(403)
      .json({ message: "Not authorized to approve this leave" });
  } catch (err) {
    res.status(500).json({ message: "Approval failed", error: err.message });
  }
};

// ❌ Reject Leave
exports.rejectLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id).populate("user");
    if (!leave) return res.status(404).json({ message: "Leave not found" });

    const applicantRole = leave.user.role;
    const approverRole = req.user.role;

    if (
      (applicantRole === "Employee" &&
        ["HR", "Manager", "Admin"].includes(approverRole)) ||
      (applicantRole === "HR" && ["Manager", "Admin"].includes(approverRole)) ||
      (applicantRole === "Manager" && approverRole === "Admin")
    ) {
      leave.status = "Rejected";
      leave.approver = req.user._id;
      leave.approverComment = req.body.comment || "";
      await leave.save();
      return res.status(200).json({ message: "Leave rejected", data: leave });
    }

    return res
      .status(403)
      .json({ message: "Not authorized to reject this leave" });
  } catch (err) {
    res.status(500).json({ message: "Rejection failed", error: err.message });
  }
};

// 📄 Get All Leaves (Admin/HR/Manager)
exports.getAllLeaves = async (req, res) => {
  try {
    const user = req.user;
    let leaves = [];

    if (user.role === "Admin") {
      // Admin sees all users under them (HR, Manager, Employee)
      const subUsers = await User.find({ admin: user._id }, "_id");
      const userIds = subUsers.map((u) => u._id);

      const employeesUnderHR = await User.find({ hr: { $in: userIds } }, "_id");
      const allUserIds = [...userIds, ...employeesUnderHR.map((u) => u._id)];

      leaves = await Leave.find({ user: { $in: allUserIds } })
        .populate("user", "name email role")
        .populate("approver", "name email role")
        .sort({ createdAt: -1 });
    } else if (user.role === "Manager") {
      // Manager sees HRs under them
      const hrs = await User.find({ manager: user._id }, "_id");
      const hrIds = hrs.map((u) => u._id);

      const employees = await User.find({ hr: { $in: hrIds } }, "_id");
      const allUserIds = [...hrIds, ...employees.map((u) => u._id)];

      leaves = await Leave.find({ user: { $in: allUserIds } })
        .populate("user", "name email role")
        .populate("approver", "name email role")
        .sort({ createdAt: -1 });
    } else if (user.role === "HR") {
      // HR sees Employees under them
      const employees = await User.find({ hr: user._id }, "_id");
      const employeeIds = employees.map((u) => u._id);

      leaves = await Leave.find({ user: { $in: employeeIds } })
        .populate("user", "name email role")
        .populate("approver", "name email role")
        .sort({ createdAt: -1 });
    } else {
      return res.status(403).json({ message: "Not authorized to view leaves" });
    }

    res.status(200).json({ data: leaves });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch leaves", error: err.message });
  }
};

// 👤 Get Leaves by User
exports.getUserLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ user: req.params.id })
      .populate("user", "name email role") // 👈 populate user details
      .populate("approver", "name email role") // optional: also populate approver info
      .sort({ createdAt: -1 });

    res.status(200).json({ data: leaves });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch user leaves",
      error: err.message,
    });
  }
};

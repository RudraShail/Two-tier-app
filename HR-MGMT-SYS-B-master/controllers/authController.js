const User = require("../models/User");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");
const sendEmail = require("../utils/mailConfig");
const crypto = require("crypto");
const axios = require("axios");
const moment = require("moment");
const Attendance = require("../models/Attendance"); // if you track check-ins/outs
const Leave = require("../models/Leave");

const generateRandomPassword = () =>
  Math.random().toString(36).slice(-10) + "@A1"; // secure + special char

const API_URL =
  "https://hr-mgmt-sys-b-1.onrender.com/api/auth/register" ||
  "http://localhost:8080/api/auth/register";

exports.autoRegisterUser = async (req, res) => {
  try {
    const { name, email, role = "Admin" } = req.body;

    // 🧠 Validation
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and role are required.",
      });
    }

    // ❗Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "A user with this email already exists.",
      });
    }

    // ✅ Generate password
    const password = generateRandomPassword();

    // 🔄 Call internal register API
    const response = await axios.post(API_URL, {
      name,
      email,
      password,
      role,
    });

    const registeredUser = response.data?.user;
    console.log(registeredUser);

    // 📧 Send email with credentials
    const html = `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 24px; border-radius: 12px; background: #ffffff; border: 1px solid #e5e7eb; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
    <div style="text-align: center;">
      <h2 style="color: #1d4ed8; margin-bottom: 10px;">👨‍💼 <span style="color: #111827;">Admin Account Created</span></h2>
      <p style="font-size: 16px; color: #6b7280;">🎉 Welcome to the <strong style="color: #2563eb;">Attendance Management System</strong></p>
    </div>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />

    <div style="font-size: 15px; color: #374151;">
      <p>👋 <strong>Hello ${registeredUser.name},</strong></p>
      <p style="margin: 10px 0;">
        Your <strong style="color: #10b981;">Admin</strong> account has been successfully created in our system.
      </p>

      <p style="margin: 18px 0 6px;"><strong>🔐 Your Login Credentials:</strong></p>
      <ul style="list-style: none; padding: 0;">
        <li style="margin-bottom: 8px;">📧 <strong style="color: #1f2937;">Email:</strong> <span style="color: #2563eb;">${registeredUser.email}</span></li>
        <li>🔑 <strong style="color: #1f2937;">Password:</strong> <span style="color: #ef4444;">${password}</span></li>
      </ul>

      <p style="margin: 20px 0;">
        📩 An OTP has been sent to your email. Please <strong style="color: #f59e0b;">verify your email address</strong> after logging in.
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="http://localhost:5173/login" style="background-color: #3b82f6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">
          🚀 Login to Dashboard
        </a>
      </div>

      <p style="margin-top: 30px; color: #9ca3af;">⚠️ If you didn’t request this account or believe this is an error, please contact our support team immediately.</p>

      <p style="margin-top: 32px;">Warm regards,<br/>
      💻 <strong style="color: #6366f1;">Tech Team</strong><br/>
      Attendance Management System</p>
    </div>
  </div>
`;

    await sendEmail(email, "✅ Your Admin Login Credentials", html);

    res.status(201).json({
      success: true,
      message: "Admin registered & email sent successfully.",
      user: registeredUser,
    });
  } catch (err) {
    const apiError = err.response?.data || {};
    console.error(
      "🔥 Auto-registration error:",
      err.message || apiError.message
    );

    res.status(err.response?.status || 500).json({
      success: false,
      message: "Auto-registration failed",
      error: apiError.message || err.message,
    });
  }
};

// @desc    Register a new user with OTP verification
exports.register = async (req, res) => {
  try {
    console.log("📥 Incoming registration request:", req.body);

    const { name, email, password, role, admin, manager, hr } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password, and role are required.",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists.",
      });
    }

    // Validate hierarchy
    if (role === "Manager" && !admin) {
      return res
        .status(400)
        .json({ success: false, message: "Manager must have an Admin ID." });
    }
    if (role === "HR" && (!admin || !manager)) {
      return res.status(400).json({
        success: false,
        message: "HR must have Admin and Manager IDs.",
      });
    }
    if (role === "Employee" && (!admin || !manager || !hr)) {
      return res.status(400).json({
        success: false,
        message: "Employee must have Admin, Manager, and HR IDs.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const userData = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      otp,
      otpExpiry: Date.now() + 15 * 60 * 1000, // 15 minutes
    });

    if (["Admin", "Manager", "HR", "Employee"].includes(role)) {
      userData.admin = admin;
    }
    if (["HR", "Employee"].includes(role)) {
      userData.manager = manager;
    }
    if (role === "Employee") {
      userData.hr = hr;
    }

    const newUser = await User.create(userData);

    let user = await User.findById(newUser._id)
      .select("-password")
      .populate("admin", "name")
      .populate("manager", "name")
      .populate("hr", "name")
      .lean(); // 🔁 Converts to plain object

    if (role === "Admin") {
      delete user.manager;
      delete user.hr;
    }
    if (role === "Manager") {
      delete user.hr;
    }

    // 📧 HTML Email Template
    const html = `
      <div style="font-family:Arial,sans-serif;">
        <h2>👋 Welcome to Attendance Management System</h2>
        <p>Hi <strong>${user.name}</strong>,</p>
        <p>Your account has been created with role: <strong>${role}</strong>.</p>
        <p>Please verify your email using the following OTP:</p>
        <h1 style="color:#1a73e8;">${otp}</h1>
        <p>Valid for 15 minutes.</p>
        <hr/>
        <p><strong>Email:</strong> ${user.email}</p>
        ${user.admin ? `<p><strong>Admin:</strong> ${user.admin.name}</p>` : ""}
        ${
          user.manager
            ? `<p><strong>Manager:</strong> ${user.manager.name}</p>`
            : ""
        }
        ${user.hr ? `<p><strong>HR:</strong> ${user.hr.name}</p>` : ""}
        <p>If you did not initiate this request, please ignore this email.</p>
      </div>
    `;

    try {
      await sendEmail(user.email, "Verify Your Email (OTP)", html);
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "User created but failed to send OTP email.",
        error: err.message,
      });
    }

    res.status(201).json({
      success: true,
      message: "Registered successfully. OTP sent to email.",
      user, // already excludes password
    });
  } catch (err) {
    console.error("🔥 Registration error:", err.message);
    res.status(500).json({
      success: false,
      message: "Registration failed.",
      error: err.message,
    });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.isVerified)
      return res.status(400).json({ message: "User already verified" });

    if (user.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    if (user.otpExpires < Date.now())
      return res.status(400).json({ message: "OTP expired" });

    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res.json({ message: "Email verified successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @desc    Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).populate(
      "manager admin",
      "name"
    );

    if (!user) {
      return res.status(401).json({ message: "Email is invalid" });
    }

    if (!user.isVerified)
      return res
        .status(401)
        .json({ message: "Please verify your email first" });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Password is invalid" });
    }

    res.json({
      success: true,
      message: "Logged in successfully",
      token: generateToken(user._id, user.role), // pass the required arguments
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        manager: user.manager
          ? { id: user.manager._id, name: user.manager.name }
          : null,
        admin: user.admin
          ? { id: user.admin._id, name: user.admin.name }
          : null,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @desc    Logout user
exports.logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Logged out. Token must be removed from client.",
  });
};

// @desc    Role-specific dashboards
exports.superadminDashboard = async (req, res) => {
  try {
    const [totalUsers, verifiedUsers, admins, managers, hrs, employees] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ isVerified: true }),
        User.find({ role: "Admin" }).select("-password"),
        User.find({ role: "Manager" }).select("-password"),
        User.find({ role: "HR" }).select("-password"),
        User.find({ role: "Employee" }).select("-password"),
      ]);

    const unverifiedUsers = totalUsers - verifiedUsers;

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email role createdAt");

    const userRoleDistribution = [
      { role: "Admin", count: admins.length },
      { role: "Manager", count: managers.length },
      { role: "HR", count: hrs.length },
      { role: "Employee", count: employees.length },
    ];

    // Monthly Registrations (last 6 months)
    const sixMonthsAgo = moment().subtract(5, "months").startOf("month");
    const monthlyRegistrations = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo.toDate() },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const formattedMonthlyData = [...Array(6)].map((_, i) => {
      const date = moment().subtract(5 - i, "months");
      const monthStr = date.format("MMM");
      const match = monthlyRegistrations.find(
        (d) => d._id.month === date.month() + 1 && d._id.year === date.year()
      );
      return { month: monthStr, count: match?.count || 0 };
    });

    // Tenant Stats (flat)
    const tenantStats = await Promise.all(
      admins.map(async (admin) => {
        const totalUsers = await User.countDocuments({ admin: admin._id });
        return {
          adminId: admin._id,
          name: admin.name,
          email: admin.email,
          totalUsers,
        };
      })
    );

    // Tenant Hierarchy (nested)
    const tenantHierarchy = await Promise.all(
      admins.map(async (admin) => {
        const managers = await User.find({
          role: "Manager",
          admin: admin._id,
        }).select("-password");

        const managersWithTeam = await Promise.all(
          managers.map(async (manager) => {
            const hrs = await User.find({
              role: "HR",
              manager: manager._id,
            }).select("-password");

            const hrsWithEmployees = await Promise.all(
              hrs.map(async (hr) => {
                const employees = await User.find({
                  role: "Employee",
                  hr: hr._id,
                }).select("-password");

                return {
                  hrId: hr._id,
                  name: hr.name,
                  email: hr.email,
                  employees: employees.map((emp) => ({
                    employeeId: emp._id,
                    name: emp.name,
                    email: emp.email,
                  })),
                };
              })
            );

            return {
              managerId: manager._id,
              name: manager.name,
              email: manager.email,
              hrs: hrsWithEmployees,
            };
          })
        );

        return {
          adminId: admin._id,
          name: admin.name,
          email: admin.email,
          managers: managersWithTeam,
        };
      })
    );

    // Response
    res.status(200).json({
      success: true,
      message: "SuperAdmin Dashboard Data",
      stats: {
        totalUsers,
        verifiedUsers,
        unverifiedUsers,
        totalAdmins: admins.length,
        totalManagers: managers.length,
        totalHRs: hrs.length,
        totalEmployees: employees.length,
      },
      userRoleDistribution,
      recentUsers,
      usersByRole: {
        admins,
        managers,
        hrs,
        employees,
      },
      monthlyRegistrations: formattedMonthlyData,
      tenantStats,
      tenantHierarchy,
    });
  } catch (err) {
    console.error("🔥 SuperAdmin Dashboard Error:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to load SuperAdmin dashboard data",
      error: err.message,
    });
  }
};

exports.adminDashboard = async (req, res) => {
  try {
    const adminId = req.user._id;

    const [totalManagers, totalHRs, totalEmployees] = await Promise.all([
      User.countDocuments({ admin: adminId, role: "Manager" }),
      User.countDocuments({ admin: adminId, role: "HR" }),
      User.countDocuments({ admin: adminId, role: "Employee" }),
    ]);

    const recentUsers = await User.find({ admin: adminId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email role createdAt");

    const todayStart = moment().startOf("day").toDate();
    const todayEnd = moment().endOf("day").toDate();

    // Attendance Today
    const todayAttendance = await Attendance.aggregate([
      { $match: { clockIn: { $gte: todayStart, $lte: todayEnd } } },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      { $match: { "user.admin": adminId } },
      {
        $project: {
          clockIn: 1,
          breaks: 1,
          user: {
            _id: "$user._id",
            name: "$user.name",
            email: "$user.email",
            role: "$user.role",
          },
        },
      },
    ]);

    // Break time processing
    const breakDurationMap = {};
    todayAttendance.forEach((record) => {
      const userId = record.user._id.toString();
      if (!breakDurationMap[userId]) {
        breakDurationMap[userId] = {
          name: record.user.name,
          email: record.user.email,
          totalBreakMinutes: 0,
        };
      }
      (record.breaks || []).forEach((brk) => {
        if (brk.start >= todayStart && brk.start <= todayEnd) {
          breakDurationMap[userId].totalBreakMinutes +=
            brk.durationMinutes || 0;
        }
      });
    });

    const todayBreakDurations = Object.entries(breakDurationMap).map(
      ([userId, data]) => ({ userId, ...data })
    );

    // Top 5 Break Time Users
    const topBreakUsers = [...todayBreakDurations]
      .sort((a, b) => b.totalBreakMinutes - a.totalBreakMinutes)
      .slice(0, 5);

    // Late Comers (after 10:00 AM)
    const lateComers = todayAttendance.filter((a) =>
      moment(a.clockIn).isAfter(moment(todayStart).hour(10))
    );

    // Approved Leaves Today
    const todayLeaves = await Leave.aggregate([
      {
        $match: {
          from: { $lte: todayEnd },
          to: { $gte: todayStart },
          status: "Approved",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      { $match: { "user.admin": adminId } },
      {
        $project: {
          user: {
            _id: "$user._id",
            name: "$user.name",
            email: "$user.email",
            role: "$user.role",
          },
        },
      },
    ]);

    // Absent Without Leave
    const allEmployees = await User.find({ admin: adminId });
    const presentUserIds = new Set(
      todayAttendance.map((r) => r.user._id.toString())
    );
    const onLeaveUserIds = new Set(
      todayLeaves.map((l) => l.user._id.toString())
    );

    const absentUsers = allEmployees
      .filter(
        (user) =>
          !presentUserIds.has(user._id.toString()) &&
          !onLeaveUserIds.has(user._id.toString())
      )
      .map((u) => ({ _id: u._id, name: u.name, email: u.email, role: u.role }));

    // Attendance counts by role
    const attendanceCountsByRole = { Manager: 0, HR: 0, Employee: 0 };
    todayAttendance.forEach((r) => attendanceCountsByRole[r.user.role]++);

    const leaveCountsByRole = { Manager: 0, HR: 0, Employee: 0 };
    todayLeaves.forEach((r) => leaveCountsByRole[r.user.role]++);

    // Leave type distribution (pie chart)
    const leaveTypeDistAgg = await Leave.aggregate([
      { $match: { status: "Approved" } },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      { $match: { "user.admin": adminId } },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
        },
      },
    ]);
    const leaveTypeDistribution = leaveTypeDistAgg.map((d) => ({
      type: d._id,
      count: d.count,
    }));

    // Attendance trend: last 7 days
    const startOfWeek = moment().subtract(6, "days").startOf("day").toDate();
    const attendanceTrend = await Attendance.aggregate([
      {
        $match: {
          clockIn: { $gte: startOfWeek },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      { $match: { "user.admin": adminId } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$clockIn" } },
          count: { $sum: 1 },
        },
      },
    ]);

    const fullTrend = Array.from({ length: 7 }).map((_, i) => {
      const date = moment()
        .subtract(6 - i, "days")
        .format("YYYY-MM-DD");
      const entry = attendanceTrend.find((d) => d._id === date);
      return { date, count: entry?.count || 0 };
    });

    // Upcoming Approved Leaves (next 7 days)
    const upcomingLeaves = await Leave.aggregate([
      {
        $match: {
          from: { $gte: moment().toDate() },
          to: { $lte: moment().add(7, "days").endOf("day").toDate() },
          status: "Approved",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      { $match: { "user.admin": adminId } },
      {
        $project: {
          from: 1,
          to: 1,
          type: 1,
          user: {
            _id: "$user._id",
            name: "$user.name",
            email: "$user.email",
            role: "$user.role",
          },
        },
      },
    ]);

    // Pending leaves
    const pendingLeaves = await Leave.aggregate([
      { $match: { status: "Pending" } },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      { $match: { "user.admin": adminId } },
      { $sort: { createdAt: -1 } },
      { $limit: 10 },
      {
        $project: {
          from: 1,
          to: 1,
          reason: 1,
          user: {
            _id: "$user._id",
            name: "$user.name",
            email: "$user.email",
            role: "$user.role",
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      message: "Admin Dashboard Data",
      user: req.user,
      totalManagers,
      totalHRs,
      totalEmployees,
      recentUsers,
      todayAttendance,
      topBreakUsers,
      lateComers,
      absentUsers,
      todayLeaves,
      teamAttendance: attendanceCountsByRole,
      teamLeaves: leaveCountsByRole,
      pendingLeaves,
      leaveTypeDistribution,
      attendanceTrend: fullTrend,
      upcomingLeaves,
    });
  } catch (err) {
    console.error("❌ Admin Dashboard Error:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to load admin dashboard",
      error: err.message,
    });
  }
};

exports.managerDashboard = async (req, res) => {
  try {
    const managerId = req.user._id;

    // Get users under this manager
    const teamMembers = await User.find({ manager: managerId });
    const teamMemberIds = teamMembers.map((user) => user._id);

    const todayStart = moment().startOf("day").toDate();
    const todayEnd = moment().endOf("day").toDate();

    // Total Employees and HRs under the manager
    const [totalEmployees, totalHRs, recentUsers] = await Promise.all([
      User.countDocuments({ role: "Employee", manager: managerId }),
      User.countDocuments({ role: "HR", manager: managerId }),
      User.find({ manager: managerId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("name email role createdAt"),
    ]);

    // Today's Attendance
    const todayAttendance = await Attendance.aggregate([
      {
        $match: {
          clockIn: { $gte: todayStart, $lte: todayEnd },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      { $match: { "user.manager": managerId } },
      {
        $project: {
          clockIn: 1,
          breaks: 1,
          user: {
            _id: "$user._id",
            name: "$user.name",
            email: "$user.email",
            role: "$user.role",
          },
        },
      },
    ]);

    // Today's Approved Leaves
    const todayLeaves = await Leave.aggregate([
      {
        $match: {
          from: { $lte: todayEnd },
          to: { $gte: todayStart },
          status: "Approved",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      { $match: { "user.manager": managerId } },
      {
        $project: {
          user: {
            _id: "$user._id",
            name: "$user.name",
            email: "$user.email",
            role: "$user.role",
          },
        },
      },
    ]);

    // Upcoming Leaves (next 7 days)
    const upcomingLeaves = await Leave.aggregate([
      {
        $match: {
          from: { $gte: todayStart },
          to: { $lte: moment().add(7, "days").endOf("day").toDate() },
          status: "Approved",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      { $match: { "user.manager": managerId } },
      {
        $project: {
          from: 1,
          to: 1,
          type: 1,
          user: {
            _id: "$user._id",
            name: "$user.name",
            email: "$user.email",
            role: "$user.role",
          },
        },
      },
    ]);

    // Break Time Processing
    const breakDurationMap = {};
    todayAttendance.forEach((record) => {
      const userId = record.user._id.toString();
      if (!breakDurationMap[userId]) {
        breakDurationMap[userId] = {
          name: record.user.name,
          email: record.user.email,
          totalBreakMinutes: 0,
        };
      }
      (record.breaks || []).forEach((brk) => {
        if (brk.start >= todayStart && brk.start <= todayEnd) {
          breakDurationMap[userId].totalBreakMinutes +=
            brk.durationMinutes || 0;
        }
      });
    });

    const todayBreakDurations = Object.entries(breakDurationMap).map(
      ([userId, data]) => ({ userId, ...data })
    );

    const topBreakUsers = [...todayBreakDurations]
      .sort((a, b) => b.totalBreakMinutes - a.totalBreakMinutes)
      .slice(0, 5);

    // Late Comers (after 10:00 AM)
    const lateComers = todayAttendance.filter((a) =>
      moment(a.clockIn).isAfter(moment(todayStart).hour(10))
    );

    // Absent Users (not in attendance and not on leave)
    const presentUserIds = new Set(
      todayAttendance.map((a) => a.user._id.toString())
    );
    const leaveUserIds = new Set(todayLeaves.map((l) => l.user._id.toString()));

    const absentUsers = teamMembers
      .filter(
        (u) =>
          !presentUserIds.has(u._id.toString()) &&
          !leaveUserIds.has(u._id.toString())
      )
      .map((u) => ({
        _id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
      }));

    // Leave Type Distribution
    const leaveTypeDistAgg = await Leave.aggregate([
      {
        $match: {
          status: "Approved",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      { $match: { "user.manager": managerId } },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
        },
      },
    ]);
    const leaveTypeDistribution = leaveTypeDistAgg.map((d) => ({
      type: d._id,
      count: d.count,
    }));

    // Attendance Trend (last 7 days)
    const startOfWeek = moment().subtract(6, "days").startOf("day").toDate();
    const attendanceTrend = await Attendance.aggregate([
      {
        $match: {
          clockIn: { $gte: startOfWeek },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      { $match: { "user.manager": managerId } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$clockIn" } },
          count: { $sum: 1 },
        },
      },
    ]);
    const fullTrend = Array.from({ length: 7 }).map((_, i) => {
      const date = moment()
        .subtract(6 - i, "days")
        .format("YYYY-MM-DD");
      const entry = attendanceTrend.find((d) => d._id === date);
      return { date, count: entry?.count || 0 };
    });

    res.status(200).json({
      success: true,
      message: "Manager Dashboard Data",
      totalEmployees,
      totalHRs,
      recentUsers,
      todayAttendance,
      todayLeaves,
      upcomingLeaves,
      topBreakUsers,
      lateComers,
      absentUsers,
      leaveTypeDistribution,
      attendanceTrend: fullTrend,
    });
  } catch (error) {
    console.error("❌ Manager Dashboard Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch manager dashboard data",
      error: error.message,
    });
  }
};

exports.hrDashboard = async (req, res) => {
  try {
    const hrId = req.user._id;

    // Step 1: Find users managed by this HR
    const managedUsers = await User.find({ hr: hrId });
    const managedUserIds = managedUsers.map((user) => user._id);

    const todayStart = moment().startOf("day").toDate();
    const todayEnd = moment().endOf("day").toDate();

    // Step 2: Fetch basic user stats
    const [totalEmployees, totalManagers, recentUsers] = await Promise.all([
      User.countDocuments({ role: "Employee", hr: hrId }),
      User.countDocuments({ role: "Manager", hr: hrId }),
      User.find({ hr: hrId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("name email role createdAt"),
    ]);

    // Step 3: Today's Attendance
    const todayAttendance = await Attendance.aggregate([
      {
        $match: {
          clockIn: { $gte: todayStart, $lte: todayEnd },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      { $match: { "user.hr": hrId } },
      {
        $project: {
          clockIn: 1,
          breaks: 1,
          user: {
            _id: "$user._id",
            name: "$user.name",
            email: "$user.email",
            role: "$user.role",
          },
        },
      },
    ]);

    // Step 4: Today's Approved Leaves
    const todayLeaves = await Leave.aggregate([
      {
        $match: {
          from: { $lte: todayEnd },
          to: { $gte: todayStart },
          status: "Approved",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      { $match: { "user.hr": hrId } },
      {
        $project: {
          user: {
            _id: "$user._id",
            name: "$user.name",
            email: "$user.email",
            role: "$user.role",
          },
        },
      },
    ]);

    // Step 5: Upcoming Leaves (next 7 days)
    const upcomingLeaves = await Leave.aggregate([
      {
        $match: {
          from: { $gte: todayStart },
          to: { $lte: moment().add(7, "days").endOf("day").toDate() },
          status: "Approved",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      { $match: { "user.hr": hrId } },
      {
        $project: {
          from: 1,
          to: 1,
          type: 1,
          user: {
            _id: "$user._id",
            name: "$user.name",
            email: "$user.email",
            role: "$user.role",
          },
        },
      },
    ]);

    // Step 6: Break Time Calculation
    const breakDurationMap = {};
    todayAttendance.forEach((record) => {
      const userId = record.user._id.toString();
      if (!breakDurationMap[userId]) {
        breakDurationMap[userId] = {
          name: record.user.name,
          email: record.user.email,
          totalBreakMinutes: 0,
        };
      }
      (record.breaks || []).forEach((brk) => {
        if (brk.start >= todayStart && brk.start <= todayEnd) {
          breakDurationMap[userId].totalBreakMinutes +=
            brk.durationMinutes || 0;
        }
      });
    });

    const todayBreakDurations = Object.entries(breakDurationMap).map(
      ([userId, data]) => ({ userId, ...data })
    );

    const topBreakUsers = [...todayBreakDurations]
      .sort((a, b) => b.totalBreakMinutes - a.totalBreakMinutes)
      .slice(0, 5);

    // Step 7: Late Comers (after 10:00 AM)
    const lateComers = todayAttendance.filter((a) =>
      moment(a.clockIn).isAfter(moment(todayStart).hour(10))
    );

    // Step 8: Absent Users (not in attendance and not on leave)
    const presentUserIds = new Set(
      todayAttendance.map((a) => a.user._id.toString())
    );
    const leaveUserIds = new Set(todayLeaves.map((l) => l.user._id.toString()));

    const absentUsers = managedUsers
      .filter(
        (u) =>
          !presentUserIds.has(u._id.toString()) &&
          !leaveUserIds.has(u._id.toString())
      )
      .map((u) => ({
        _id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
      }));

    // Step 9: Leave Type Distribution
    const leaveTypeDistAgg = await Leave.aggregate([
      {
        $match: {
          status: "Approved",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      { $match: { "user.hr": hrId } },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
        },
      },
    ]);
    const leaveTypeDistribution = leaveTypeDistAgg.map((d) => ({
      type: d._id,
      count: d.count,
    }));

    // Step 10: Attendance Trend (last 7 days)
    const startOfWeek = moment().subtract(6, "days").startOf("day").toDate();
    const attendanceTrend = await Attendance.aggregate([
      {
        $match: {
          clockIn: { $gte: startOfWeek },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      { $match: { "user.hr": hrId } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$clockIn" } },
          count: { $sum: 1 },
        },
      },
    ]);
    const fullTrend = Array.from({ length: 7 }).map((_, i) => {
      const date = moment()
        .subtract(6 - i, "days")
        .format("YYYY-MM-DD");
      const entry = attendanceTrend.find((d) => d._id === date);
      return { date, count: entry?.count || 0 };
    });

    // Step 11: Pending Leaves (latest 10)
    const pendingLeaves = await Leave.aggregate([
      { $match: { status: "Pending" } },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      { $match: { "user.hr": hrId } },
      { $sort: { createdAt: -1 } },
      { $limit: 10 },
      {
        $project: {
          from: 1,
          to: 1,
          reason: 1,
          user: {
            _id: "$user._id",
            name: "$user.name",
            email: "$user.email",
            role: "$user.role",
          },
        },
      },
    ]);

    // Final Response
    res.status(200).json({
      success: true,
      message: "HR Dashboard Data",
      totalEmployees,
      totalManagers,
      recentUsers,
      todayAttendance,
      todayLeaves,
      upcomingLeaves,
      topBreakUsers,
      lateComers,
      absentUsers,
      leaveTypeDistribution,
      attendanceTrend: fullTrend,
      pendingLeaves,
    });
  } catch (error) {
    console.error("❌ HR Dashboard Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch HR dashboard data",
      error: error.message,
    });
  }
};

exports.employeeDashboard = async (req, res) => {
  try {
    const employeeId = req.user._id;

    const todayStart = moment().startOf("day").toDate();
    const todayEnd = moment().endOf("day").toDate();

    // Today's attendance
    const todayAttendance = await Attendance.findOne({
      user: employeeId,
      clockIn: { $gte: todayStart, $lte: todayEnd },
    });

    // Breaks Today Summary
    const totalBreakMinutes = (todayAttendance?.breaks || []).reduce(
      (sum, brk) =>
        brk.start >= todayStart && brk.start <= todayEnd
          ? sum + (brk.durationMinutes || 0)
          : sum,
      0
    );

    // Approved Leaves (past + future)
    const approvedLeaves = await Leave.find({
      user: employeeId,
      status: "Approved",
    });

    // Upcoming approved leaves (next 7 days)
    const upcomingLeaves = await Leave.find({
      user: employeeId,
      status: "Approved",
      from: { $gte: todayStart },
      to: { $lte: moment().add(7, "days").endOf("day").toDate() },
    });

    // Pending Leaves
    const pendingLeaves = await Leave.find({
      user: employeeId,
      status: "Pending",
    });

    // Leave distribution by type
    const leaveTypeDistributionAgg = await Leave.aggregate([
      { $match: { user: employeeId, status: "Approved" } },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
        },
      },
    ]);
    const leaveTypeDistribution = leaveTypeDistributionAgg.map((d) => ({
      type: d._id,
      count: d.count,
    }));

    // Weekly Attendance Trend
    const startOfWeek = moment().subtract(6, "days").startOf("day").toDate();
    const attendanceTrendAgg = await Attendance.aggregate([
      {
        $match: {
          user: employeeId,
          clockIn: { $gte: startOfWeek },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$clockIn" },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    const attendanceTrend = Array.from({ length: 7 }).map((_, i) => {
      const date = moment()
        .subtract(6 - i, "days")
        .format("YYYY-MM-DD");
      const entry = attendanceTrendAgg.find((d) => d._id === date);
      return { date, count: entry?.count || 0 };
    });

    res.status(200).json({
      success: true,
      message: "Employee Dashboard Data",
      todayAttendance,
      totalBreakMinutes,
      approvedLeaves,
      upcomingLeaves,
      pendingLeaves,
      leaveTypeDistribution,
      attendanceTrend,
    });
  } catch (err) {
    console.error("❌ Employee Dashboard Error:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to load employee dashboard",
      error: err.message,
    });
  }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  console.log(email);
  if (!email)
    return res
      .status(400)
      .json({ success: false, message: "Email is required" });

  const user = await User.findOne({ email });

  if (!user)
    return res
      .status(404)
      .json({ success: false, message: "User not found with this email" });

  const resetToken = crypto.randomBytes(32).toString("hex");
  const tokenExpiry = Date.now() + 3600000; // 1 hour

  user.resetToken = resetToken;
  user.resetTokenExpiry = tokenExpiry;
  await user.save();

  const resetURL = `http://localhost:5173/reset-password/${resetToken}`;

  // ✅ HTML Email Template for Reset Password
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
      <h2 style="color: #1a73e8;">🔒 Reset Your Password</h2>
      <p>Hi <strong>${user.name}</strong>,</p>
      <p>We received a request to reset your password for your <strong>Attendance Management System</strong> account.</p>
      <p>Please click the button below to reset your password:</p>
      <div style="margin: 20px 0;">
        <a href="${resetURL}" target="_blank" style="padding: 12px 24px; background-color: #1a73e8; color: #fff; text-decoration: none; border-radius: 5px;">Reset Password</a>
      </div>
      <p>Or copy and paste this link into your browser:</p>
      <p><a href="${resetURL}">${resetURL}</a></p>
      <p>This link will expire in <strong>1 hour</strong>.</p>
      <hr/>
      <p>If you didn’t request a password reset, you can safely ignore this email.</p>
      <p>Thanks,<br/>Team Attendance Management System</p>
    </div>
  `;

  try {
    await sendEmail(user.email, "Reset Your Password", html);
    res
      .status(200)
      .json({ success: true, message: "Reset link sent to email" });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to send reset email.",
      error: err.message,
    });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  const user = await User.findOne({
    resetToken: token,
    resetTokenExpiry: { $gt: Date.now() },
  });

  if (!user)
    return res
      .status(400)
      .json({ success: false, message: "Invalid or expired token" });

  const bcrypt = require("bcryptjs");
  user.password = await bcrypt.hash(newPassword, 10);
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;

  await user.save();

  res.status(200).json({ success: true, message: "Password reset successful" });
};

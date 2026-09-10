const express = require("express");
const router = express.Router();

const {
  register,
  login,
  logout,
  verifyOTP,
  superadminDashboard,
  adminDashboard,
  hrDashboard,
  managerDashboard,
  employeeDashboard,
  forgotPassword,
  resetPassword,
  autoRegisterUser,
} = require("../controllers/authController");

const { protect, restrictTo } = require("../middleware/authMiddleware");

// 🟢 Public Routes
router.post("/register", register);
router.post("/form-auto-register", autoRegisterUser);

router.post("/verify-otp", verifyOTP);
router.post("/login", login);
router.post("/logout", logout);

// 🔐 Protected Routes by Role
router.get(
  "/superadmin/dashboard",
  protect,
  restrictTo("SuperAdmin"),
  superadminDashboard
);
router.get("/admin/dashboard", protect, restrictTo("Admin"), adminDashboard);
router.get("/hr/dashboard", protect, restrictTo("HR"), hrDashboard);
router.get(
  "/manager/dashboard",
  protect,
  restrictTo("Manager"),
  managerDashboard
);
router.get(
  "/employee/dashboard",
  protect,
  restrictTo("Employee"),
  employeeDashboard
);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

module.exports = router;

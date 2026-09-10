const express = require("express");
const { getDashboardStats } = require("../controllers/dashboardController");
const { protect } = require("../middleware/authMiddleware"); // You likely have this

const router = express.Router();

// Get today's dashboard stats
router.get("/today", protect, getDashboardStats);

router.get("/", (req, res) => {
  res.send("✅ Welcome to the Attendance Management Server!");
});

module.exports = router;

const express = require("express");
const router = express.Router();
const {
  applyLeave,
  approveLeave,
  rejectLeave,
  getAllLeaves,
  getUserLeaves,
} = require("../controllers/leaveController");

const { protect, restrictTo } = require("../middleware/authMiddleware");

router.post("/apply", protect, applyLeave);
router.put("/:id/approve", protect, approveLeave);
router.put("/:id/reject", protect, rejectLeave);

router.get("/user/:id", protect, getUserLeaves);
router.get("/", protect, restrictTo("Admin", "Manager", "HR"), getAllLeaves);

module.exports = router;

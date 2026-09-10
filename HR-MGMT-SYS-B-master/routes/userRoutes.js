const express = require("express");
const router = express.Router();
const {
  getAdmins,
  getManagers,
  getHRs,
  getEmployees,
  getUserById,
  updateUser,
  deleteUser,
  getSubordinates,
  forgotPassword,
  resetPassword,
} = require("../controllers/userController");

const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/subordinates", getSubordinates);

router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

router.get("/role/admins", getAdmins);
router.get("/role/managers", getManagers);
router.get("/role/hrs", getHRs);
router.get("/role/employees", getEmployees);

module.exports = router;

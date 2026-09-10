const User = require("../models/User");
const mongoose = require("mongoose");

// Get all Admins – Accessible by SuperAdmin only
exports.getAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: "Admin" }).select(
      "-password -otp -otpExpiry"
    );
    res.status(200).json({ success: true, data: admins });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

// Get all Managers – Accessible by SuperAdmin or Admin
exports.getManagers = async (req, res) => {
  try {
    let filter = { role: "Manager" };

    if (req.user.role === "Admin") {
      filter.admin = req.user._id;
    }

    const managers = await User.find(filter).select(
      "-password -otp -otpExpiry"
    );
    res.status(200).json({ success: true, data: managers });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

// Get all HRs – Accessible by SuperAdmin, Admin, or Manager
exports.getHRs = async (req, res) => {
  try {
    let filter = { role: "HR" };

    if (req.user.role === "Admin") {
      filter.admin = req.user._id;
    } else if (req.user.role === "Manager") {
      filter.manager = req.user._id;
    }

    const hrs = await User.find(filter).select("-password -otp -otpExpiry");
    res.status(200).json({ success: true, data: hrs });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

// Get all Employees – Accessible by SuperAdmin, Admin, Manager, or HR
exports.getEmployees = async (req, res) => {
  try {
    let filter = { role: "Employee" };

    if (req.user.role === "Admin") {
      filter.admin = req.user._id;
    } else if (req.user.role === "Manager") {
      filter.manager = req.user._id;
    } else if (req.user.role === "HR") {
      filter.hr = req.user._id;
    }

    const employees = await User.find(filter).select(
      "-password -otp -otpExpiry"
    );
    res.status(200).json({ success: true, data: employees });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

// Get user by ID (Universal)
exports.getUserById = async (req, res) => {
  console.log(req.params);
  try {
    const user = await User.findById(req.params.id)
      .select("-password -otp -otpExpiry")
      .populate("admin", "name email")
      .populate("manager", "name email")
      .populate("hr", "name email");

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

// Update user (role-based control can be added later)
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role },
      { new: true }
    ).select("-password");

    if (!updated)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    res
      .status(200)
      .json({ success: true, message: "User updated", data: updated });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

const cleanUser = (u) =>
  Object.fromEntries(
    Object.entries(u).filter(
      ([_, v]) => v !== null && v !== undefined && v !== ""
    )
  );

exports.getSubordinates = async (req, res) => {
  try {
    const user = req.user;
    const userId = new mongoose.Types.ObjectId(user._id);

    // SuperAdmin Logic
    if (user.role === "SuperAdmin") {
      const [admins, managers, hrs, employees] = await Promise.all([
        User.find({ role: "Admin" }).select("-password -otp -otpExpiry").lean(),
        User.find({ role: "Manager" })
          .select("-password -otp -otpExpiry")
          .lean(),
        User.find({ role: "HR" }).select("-password -otp -otpExpiry").lean(),
        User.find({ role: "Employee" })
          .select("-password -otp -otpExpiry")
          .lean(),
      ]);

      const superAdmin = cleanUser(user.toObject());

      const hierarchy = admins.map((admin) => {
        const adminManagers = managers.filter(
          (m) => String(m.admin) === String(admin._id)
        );
        return {
          ...admin,
          managers: adminManagers.map((manager) => {
            const managerHrs = hrs.filter(
              (h) => String(h.manager) === String(manager._id)
            );
            return {
              ...manager,
              hrs: managerHrs.map((hr) => {
                const hrEmployees = employees.filter(
                  (e) => String(e.hr) === String(hr._id)
                );
                return { ...hr, employees: hrEmployees };
              }),
            };
          }),
        };
      });

      return res.status(200).json({
        success: true,
        data: {
          superAdmin,
          hierarchy,
        },
      });
    }

    // Admin Logic
    if (user.role === "Admin") {
      const admin = cleanUser(user.toObject());
      const managers = await User.find({ role: "Manager", admin: userId })
        .select("-password -otpExpiry")
        .lean();
      const managerIds = managers.map((m) => m._id);

      const hrs = await User.find({
        role: "HR",
        $or: [{ admin: userId }, { manager: { $in: managerIds } }],
      })
        .select("-password -otpExpiry")
        .lean();

      const hrIds = hrs.map((hr) => hr._id);
      const employees = await User.find({
        role: "Employee",
        $or: [{ manager: { $in: managerIds } }, { hr: { $in: hrIds } }],
      })
        .select("-password -otpExpiry")
        .lean();

      const hierarchy = [
        {
          ...admin,
          managers: managers.map((manager) => {
            const managerHrs = hrs.filter(
              (h) => String(h.manager) === String(manager._id)
            );
            return {
              ...manager,
              hrs: managerHrs.map((hr) => {
                const hrEmployees = employees.filter(
                  (e) => String(e.hr) === String(hr._id)
                );
                return { ...hr, employees: hrEmployees };
              }),
            };
          }),
        },
      ];

      return res.status(200).json({
        success: true,
        data: {
          admin,
          hierarchy,
        },
      });
    }

    // Manager Logic
    if (user.role === "Manager") {
      const manager = cleanUser(user.toObject());

      // Fetch associated Admin
      const admin = await User.findById(manager.admin)
        .select("-password -otpExpiry")
        .lean();

      // Fetch all Managers under same Admin
      const managers = await User.find({
        role: "Manager",
        admin: manager.admin,
      })
        .select("-password -otpExpiry")
        .lean();

      const managerIds = managers.map((m) => m._id);

      // Fetch HRs under these Managers or Admin
      const hrs = await User.find({
        role: "HR",
        $or: [{ admin: manager.admin }, { manager: { $in: managerIds } }],
      })
        .select("-password -otpExpiry")
        .lean();

      const hrIds = hrs.map((hr) => hr._id);

      // Fetch Employees under these HRs or Managers
      const employees = await User.find({
        role: "Employee",
        $or: [{ manager: { $in: managerIds } }, { hr: { $in: hrIds } }],
      })
        .select("-password -otpExpiry")
        .lean();

      // Build hierarchy for response
      const hierarchy = [
        {
          ...admin,
          managers: managers.map((m) => {
            const managerHrs = hrs.filter(
              (hr) => String(hr.manager) === String(m._id)
            );
            return {
              ...m,
              hrs: managerHrs.map((hr) => {
                const hrEmployees = employees.filter(
                  (emp) => String(emp.hr) === String(hr._id)
                );
                return {
                  ...hr,
                  employees: hrEmployees,
                };
              }),
            };
          }),
        },
      ];

      return res.status(200).json({
        success: true,
        data: {
          manager,
          hierarchy,
        },
      });
    }

    // HR Logic
    if (user.role === "HR") {
      const hr = cleanUser(user.toObject());

      // Fetch associated Admin
      const admin = await User.findById(hr.admin)
        .select("-password -otp -otpExpiry")
        .lean();

      // Fetch associated Manager
      const manager = await User.findById(hr.manager)
        .select("-password -otp -otpExpiry")
        .lean();

      // Fetch employees under this HR
      const employees = await User.find({ role: "Employee", hr: userId })
        .select("-password -otpExpiry")
        .lean();

      // Build hierarchy
      const hierarchy = {
        ...admin,
        managers: [
          {
            ...manager,
            hrs: [
              {
                ...hr,
                employees,
              },
            ],
          },
        ],
      };

      return res.status(200).json({
        success: true,
        data: {
          hr,
          hierarchy,
        },
      });
    }

    return res.status(403).json({
      success: false,
      message: "Access denied. No subordinates for this role.",
    });
  } catch (err) {
    console.error("Error fetching subordinates:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

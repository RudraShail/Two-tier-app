import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// (Optional) Replace emoji icons with React Icons for consistency if needed
// import {
//   FaHome, FaUserShield, FaUserTie, FaUserPlus, FaNetworkWired,
//   FaCalendarAlt, FaUsers, FaPause, FaCog, FaSignOutAlt
// } from "react-icons/fa";

const Sidebar = ({ closeSidebar }) => {
  const { user, logout } = useAuth();
  const role = user?.role;
  const navigate = useNavigate();

  const navItemStyle =
    "flex items-center gap-3 p-2 rounded-md hover:bg-indigo-100 text-gray-700 hover:text-indigo-600 transition-all duration-200 font-medium";
  const activeStyle =
    "bg-indigo-100 text-indigo-700 shadow-inner font-semibold";

  const handleLogout = () => {
    logout();
    localStorage.clear();
    navigate("/");
  };

  const navLinks = [
    { to: "/", label: "Dashboard", icon: "🏠" },

    {
      to: "/admin-registration",
      label: "Admin Registration",
      icon: "🛡️",
      roles: ["SuperAdmin"],
    },
    {
      to: "/manager-registration",
      label: "Manager Registration",
      icon: "👨‍💼",
      roles: ["Admin"],
    },
    {
      to: "/hr-registration",
      label: "HR Registration",
      icon: "👔",
      roles: ["Manager"],
    },
    {
      to: "/employee-registration",
      label: "Employee Registration",
      icon: "👨‍💻",
      roles: ["HR"],
    },
    {
      to: "/hierarchy",
      label: "Team Hierarchy",
      icon: "🏢",
      roles: ["HR", "Manager", "Admin", "SuperAdmin"],
    },
    {
      to: "/leave-approval",
      label: "Team Leaves",
      icon: "✅",
      roles: ["HR", "Manager", "Admin"],
    },
    {
      to: "/attendance",
      label: "Attendance",
      icon: "📅",
      roles: ["HR", "Manager", "Admin", "Employee"],
    },
    {
      to: "/team-attendance",
      label: "Team Attendance",
      icon: "📅",
      roles: ["HR", "Manager", "Admin"],
    },
    {
      to: "/leaves",
      label: "Apply Leave",
      icon: "📝",
      roles: ["Employee", "Manager", "HR"],
    },
    {
      to: "/breaks",
      label: "Breaks",
      icon: "☕",
      roles: ["Employee", "Manager", "HR"],
    },
    {
      to: "/update-password",
      label: "Update Password",
      icon: "⚙️",
      roles: ["SuperAdmin", "Admin"],
    },
    {
      label: "Logout",
      icon: "🚪",
      roles: ["SuperAdmin", "Admin", "Manager", "HR", "Employee"],
      onClick: handleLogout,
    },
  ];

  const isAllowed = (linkRoles) => !linkRoles || linkRoles.includes(role);

  return (
    <div className="w-64 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 shadow-xl min-h-screen p-6 flex flex-col">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-indigo-600 tracking-wide">
          💼 Tech<span className="text-pink-500">Dev</span>
        </h1>
        <p className="text-xs text-pink-500 mt-3 uppercase font-bold text-center">
          {role}
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-3 text-sm">
        {navLinks
          .filter(({ roles }) => isAllowed(roles))
          .map(({ to, label, icon, onClick }) =>
            onClick ? (
              <button
                key={label}
                onClick={() => {
                  const confirmed = window.confirm(
                    "Are you sure you want to log out?"
                  );
                  if (confirmed) {
                    onClick();
                    closeSidebar?.();
                  }
                }}
                className="flex items-center gap-3 p-2 rounded-md text-red-600 hover:bg-red-100 hover:text-red-700 transition-all duration-200 font-medium"
              >
                {icon} {label}
              </button>
            ) : (
              <NavLink
                key={to}
                to={to}
                onClick={closeSidebar}
                className={({ isActive }) =>
                  `${navItemStyle} ${isActive ? activeStyle : ""}`
                }
              >
                {icon} {label}
              </NavLink>
            )
          )}
      </nav>

      {/* Footer */}
      <div className="mt-auto pt-6 text-center text-xs text-gray-400 italic">
        Made by{" "}
        <span className="text-indigo-600 font-semibold">Aman Sharma</span> 💻
      </div>
    </div>
  );
};

export default Sidebar;

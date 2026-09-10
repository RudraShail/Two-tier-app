import React, { useEffect, useState } from "react";
import {
  FaUserFriends,
  FaUserTie,
  FaUserCheck,
  FaHourglassHalf,
  FaChartLine,
  FaCalendarCheck,
  FaBell,
  FaBuilding,
  FaUsers,
  FaClipboardList,
} from "react-icons/fa";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import { TESTING_API_URL, PROD_API_URL } from "../../utils/api";
import HierarchyCard from "../../components/Hierarchy";

const API_URL = PROD_API_URL ? `${PROD_API_URL}` : `${TESTING_API_URL}`;

const COLORS = ["#6366f1", "#22c55e", "#facc15", "#f472b6", "#38bdf8"];

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState([]);
  const [monthlyRegs, setMonthlyRegs] = useState([]);
  const [weeklyActive, setWeeklyActive] = useState([]);
  const [verificationStats, setVerificationStats] = useState({});
  const [tenantStats, setTenantStats] = useState([]);
  const [tenantHierarchy, setTenantHierarchy] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/auth/superadmin/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const d = res.data;

        setStats([
          {
            title: "Total Users",
            icon: <FaUserFriends />,
            value: d.stats.totalUsers,
            color: "from-blue-400 to-blue-600",
          },
          {
            title: "Verified Users",
            icon: <FaUserCheck />,
            value: d.stats.verifiedUsers,
            color: "from-green-400 to-green-600",
          },
          {
            title: "Unverified Users",
            icon: <FaHourglassHalf />,
            value: d.stats.unverifiedUsers,
            color: "from-yellow-400 to-yellow-600",
          },
          {
            title: "Admins",
            icon: <FaUserTie />,
            value: d.stats.totalAdmins,
            color: "from-purple-400 to-purple-600",
          },
          {
            title: "Managers",
            icon: <FaUserTie />,
            value: d.stats.totalManagers,
            color: "from-indigo-400 to-indigo-600",
          },
          {
            title: "HRs",
            icon: <FaUserTie />,
            value: d.stats.totalHRs,
            color: "from-pink-400 to-pink-600",
          },
          {
            title: "Employees",
            icon: <FaUserTie />,
            value: d.stats.totalEmployees,
            color: "from-cyan-400 to-cyan-600",
          },
        ]);

        setMonthlyRegs(d.monthlyRegistrations);
        setTenantStats(d.tenantStats);
        setRecentUsers(d.recentUsers);
        setTenantHierarchy(d.tenantHierarchy);
        setNotifications([
          { id: 1, message: "🏢 Tenant ACME corp reached 50 users!" },
          { id: 2, message: "🎉 New HR account created today" },
        ]);

        // Weekly Active Users
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 13);

        // Verification Progress
        const verify = (
          (d.stats.verifiedUsers / d.stats.totalUsers) *
          100
        ).toFixed(1);
        setVerificationStats({
          verified: d.stats.verifiedUsers,
          total: d.stats.totalUsers,
          percent: verify,
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div className="p-2 space-y-8">
      {loading ? (
        <div className="text-center py-20">Loading dashboard...</div>
      ) : (
        <>
          {/* 🌟 Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <div
                key={i}
                className={`bg-gradient-to-r ${s.color} text-white p-5 rounded-xl shadow-md flex items-center`}
              >
                <div className="text-3xl">{s.icon}</div>
                <div className="ml-4">
                  <div className="text-sm opacity-90">{s.title}</div>
                  <div className="text-2xl font-bold">{s.value}</div>
                </div>
              </div>
            ))}
          </div>
          {/* User Verification */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold mb-4 text-green-600">
              <FaUserCheck className="inline mr-2 text-green-500" />
              User Verification
            </h3>
            <div className="w-full bg-gray-200 rounded-full h-4 mb-2 overflow-hidden">
              <div
                className="bg-green-500 h-4 transition-all duration-300"
                style={{ width: `${verificationStats.percent}%` }}
              />
            </div>
            <div className="text-sm text-gray-700 font-medium">
              {verificationStats.percent}% verified (
              <span className="text-green-600 font-semibold">
                {verificationStats.verified}
              </span>
              /
              <span className="text-gray-800 font-semibold">
                {verificationStats.total}
              </span>
              )
            </div>
          </div>

          {/* 📈 Charts + Calendar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md col-span-2">
              <h3 className="flex items-center text-lg font-semibold mb-4">
                <FaChartLine className="mr-2" />
                Monthly Registrations
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={monthlyRegs}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Recent Registrations */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold mb-4 text-purple-600">
                <FaClipboardList className="inline mr-2 text-purple-500" />
                Recent Registrations
              </h3>
              <ul className="space-y-3 text-sm">
                {recentUsers.map((u, i) => (
                  <li
                    key={i}
                    className="flex justify-between items-start bg-purple-50 px-4 py-3 rounded-md hover:bg-purple-100 transition"
                  >
                    <div>
                      <div className="text-purple-900 font-semibold">
                        {u.name}{" "}
                        <span className="text-xs text-purple-600">
                          ({u.role})
                        </span>
                      </div>
                      <div className="text-xs text-purple-700">{u.email}</div>
                    </div>
                    <div className="text-purple-600 text-xs font-semibold pt-1">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <HierarchyCard tenantHierarchy={tenantHierarchy} />
        </>
      )}
    </div>
  );
};

export default SuperAdminDashboard;

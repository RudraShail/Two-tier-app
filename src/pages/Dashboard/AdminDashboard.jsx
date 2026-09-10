import React, { useEffect, useState } from "react";
import {
  FaUserCheck,
  FaUserTie,
  FaUserFriends,
  FaPause,
  FaCalendarCheck,
  FaBell,
  FaClock,
  FaBan,
  FaChartLine,
  FaTrophy,
} from "react-icons/fa";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import { PROD_API_URL, TESTING_API_URL } from "../../utils/api";

const API_URL = PROD_API_URL ? `${PROD_API_URL}` : `${TESTING_API_URL}`;

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#f87171", "#60a5fa"];

const AdminDashboard = () => {
  const [todayLeaves, setTodayLeaves] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [todayBreaks, setTodayBreaks] = useState([]);
  const [breakChartData, setBreakChartData] = useState([]);
  const [teamAttendance, setTeamAttendance] = useState({});
  const [teamLeaves, setTeamLeaves] = useState({});
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [upcomingLeaves, setUpcomingLeaves] = useState([]);
  const [topBreakUsers, setTopBreakUsers] = useState([]);
  const [lateComers, setLateComers] = useState([]);
  const [absentUsers, setAbsentUsers] = useState([]);
  const [attendanceTrend, setAttendanceTrend] = useState([]);
  const [leaveTypeDistribution, setLeaveTypeDistribution] = useState([]);
  const [recentLeaveApprovals, setRecentLeaveApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("today");
  const [activeTab1, setActiveTab1] = useState("attendance");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const token = localStorage.getItem("token");

        const res = await axios.get(`${API_URL}/auth/admin/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = res.data;

        const statCards = [
          {
            title: "Total Managers",
            icon: <FaUserTie />,
            value: data.totalManagers,
            color: "bg-indigo-100 text-indigo-700",
          },
          {
            title: "Total HRs",
            icon: <FaUserTie />,
            value: data.totalHRs,
            color: "bg-pink-100 text-pink-700",
          },
          {
            title: "Total Employees",
            icon: <FaUserFriends />,
            value: data.totalEmployees,
            color: "bg-cyan-100 text-cyan-700",
          },
        ];

        setStats(statCards);
        setRecentUsers(data.recentUsers || []);
        setTodayBreaks(data.todayBreakDurations || []);
        setTeamAttendance(data.teamAttendance || {});
        setTeamLeaves(data.teamLeaves || {});
        setPendingLeaves(data.pendingLeaves || []);
        setTopBreakUsers(data.topBreakUsers || []);
        setLateComers(data.lateComers || []);
        setAbsentUsers(data.absentUsers || []);
        setAttendanceTrend(data.attendanceTrend || []);
        setLeaveTypeDistribution(data.leaveTypeDistribution || []);
        setRecentLeaveApprovals(data.recentLeaveApprovals || []);
        setTodayLeaves(data.todayLeaves);
        setUpcomingLeaves(data.upcomingLeaves);
        setTodayAttendance(data.todayAttendance);

        const breakChart = (data.todayBreakDurations || []).map((u) => ({
          name: u.name,
          minutes: u.totalBreakMinutes,
        }));
        setBreakChartData(breakChart);

        setNotifications([
          { id: 1, message: "📢 Attendance tracking is live." },
          { id: 2, message: "✅ Pending leave requests need approval." },
        ]);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const renderTable = (leaves, color) => {
    if (leaves.length === 0) {
      return (
        <div className="text-sm text-gray-500 italic">
          No {color === "red" ? "approved" : "upcoming"} leaves found.
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-200">
          <thead
            className={`${
              color === "red"
                ? "bg-red-100 text-red-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            <tr>
              <th className="p-2 text-left">#</th>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Role</th>
              <th className="p-2 text-left">From</th>
              <th className="p-2 text-left">To</th>
              <th className="p-2 text-left">Type</th>
            </tr>
          </thead>
          <tbody>
            {leaves.map((leave, i) => (
              <tr
                key={leave._id}
                className={`border-b hover:${
                  color === "red" ? "bg-red-50" : "bg-yellow-50"
                } transition duration-150`}
              >
                <td className="p-2">{i + 1}</td>
                <td className="p-2">{leave.user?.name || "N/A"}</td>
                <td className="p-2">{leave.user?.email || "N/A"}</td>
                <td className="p-2">
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      leave.user?.role === "Manager"
                        ? "bg-indigo-100 text-indigo-700"
                        : leave.user?.role === "HR"
                        ? "bg-pink-100 text-pink-700"
                        : "bg-cyan-100 text-cyan-700"
                    }`}
                  >
                    {leave.user?.role}
                  </span>
                </td>
                <td className="p-2">
                  {new Date(leave.from).toLocaleDateString()}
                </td>
                <td className="p-2">
                  {new Date(leave.to).toLocaleDateString()}
                </td>
                <td
                  className={`p-2 text-sm font-medium ${
                    color === "red" ? "text-red-600" : "text-yellow-700"
                  }`}
                >
                  {leave.type}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderAttendance = () => {
    if (todayAttendance.length === 0) {
      return (
        <div className="text-sm text-gray-500 italic">
          No attendance records today.
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-200">
          <thead className="bg-green-100 text-green-800">
            <tr>
              <th className="p-2 text-left">#</th>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Role</th>
              <th className="p-2 text-left">Clock In</th>
            </tr>
          </thead>
          <tbody>
            {todayAttendance.map((record, i) => (
              <tr
                key={record._id}
                className="border-b hover:bg-green-50 transition duration-150"
              >
                <td className="p-2">{i + 1}</td>
                <td className="p-2">{record.user?.name || "N/A"}</td>
                <td className="p-2">{record.user?.email || "N/A"}</td>
                <td className="p-2">
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      record.user?.role === "Manager"
                        ? "bg-indigo-100 text-indigo-700"
                        : record.user?.role === "HR"
                        ? "bg-pink-100 text-pink-700"
                        : "bg-cyan-100 text-cyan-700"
                    }`}
                  >
                    {record.user?.role}
                  </span>
                </td>
                <td className="p-2">
                  {new Date(record.clockIn).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderLeaves = () => {
    if (todayLeaves.length === 0) {
      return (
        <div className="text-sm text-gray-500 italic">
          No approved leaves today.
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-200">
          <thead className="bg-red-100 text-red-800">
            <tr>
              <th className="p-2 text-left">#</th>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Role</th>
              <th className="p-2 text-left">From</th>
              <th className="p-2 text-left">To</th>
              <th className="p-2 text-left">Type</th>
            </tr>
          </thead>
          <tbody>
            {todayLeaves.map((leave, i) => (
              <tr
                key={leave._id}
                className="border-b hover:bg-red-50 transition duration-150"
              >
                <td className="p-2">{i + 1}</td>
                <td className="p-2">{leave.user?.name || "N/A"}</td>
                <td className="p-2">{leave.user?.email || "N/A"}</td>
                <td className="p-2">
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      leave.user?.role === "Manager"
                        ? "bg-indigo-100 text-indigo-700"
                        : leave.user?.role === "HR"
                        ? "bg-pink-100 text-pink-700"
                        : "bg-cyan-100 text-cyan-700"
                    }`}
                  >
                    {leave.user?.role}
                  </span>
                </td>
                <td className="p-2">
                  {new Date(leave.from).toLocaleDateString()}
                </td>
                <td className="p-2">
                  {new Date(leave.to).toLocaleDateString()}
                </td>
                <td className="p-2 text-sm font-medium text-red-600">
                  {leave.type}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  console.log(upcomingLeaves);
  return (
    <div className="p-4 md:p-6">
      {/* Statistic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {stats.map(({ title, icon, value, color }, idx) => (
          <div
            key={idx}
            className={`rounded-xl shadow-md p-4 ${color} flex flex-col gap-2`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{title}</span>
              <span className="text-xl">{icon}</span>
            </div>
            <h3 className="text-xl font-semibold">{value}</h3>
          </div>
        ))}
      </div>

      {/* Additional Charts or Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-xl shadow-md">
          <h2 className="font-semibold mb-2 flex items-center gap-2">
            <FaChartLine /> Weekly Attendance Trend
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={attendanceTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#6366f1"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-md">
          <h2 className="font-semibold mb-2 flex items-center gap-2">
            <FaCalendarCheck /> Leave Type Distribution
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={leaveTypeDistribution}
                dataKey="count"
                nameKey="type"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {leaveTypeDistribution.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-md">
          <h2 className="font-semibold mb-4 flex items-center gap-2 text-red-600">
            <FaBan className="text-red-500" /> Absent Users Today
          </h2>

          {absentUsers.length === 0 ? (
            <div className="text-sm text-gray-500 italic">
              🎉 No absentees today!
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {absentUsers.map((u, i) => (
                <li
                  key={i}
                  className="py-2 px-2 hover:bg-red-50 rounded-md transition duration-200 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium text-gray-800">{u.name}</p>
                    <p className="text-xs text-gray-500">{u.email}</p>
                  </div>
                  <span className="text-xs text-red-500 font-semibold">
                    ❌ Absent
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-yellow-600">
            <FaTrophy className="text-yellow-500" /> Top Users by Break Duration
          </h2>

          {topBreakUsers.length === 0 ? (
            <div className="text-sm text-gray-500 italic">
              No break data available yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200">
                <thead className="bg-yellow-100 text-yellow-800">
                  <tr>
                    <th className="text-left p-2 border-b">#</th>
                    <th className="text-left p-2 border-b">Name</th>
                    <th className="text-left p-2 border-b">Email</th>
                    <th className="text-left p-2 border-b">Break Minutes</th>
                  </tr>
                </thead>
                <tbody>
                  {topBreakUsers.map((u, i) => (
                    <tr
                      key={i}
                      className="hover:bg-yellow-50 border-b transition duration-150"
                    >
                      <td className="p-2 font-semibold">{i + 1}</td>
                      <td className="p-2">{u.name}</td>
                      <td className="p-2 text-gray-600">{u.email}</td>
                      <td className="p-2 font-medium text-yellow-700">
                        {u.totalBreakMinutes} min
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-red-600">
            <FaCalendarCheck className="text-red-500" /> Today's Approved Leaves
          </h2>

          <div className="bg-white p-4 rounded shadow-md">
            <div className="flex space-x-4 border-b mb-4">
              <button
                onClick={() => setActiveTab("today")}
                className={`py-2 px-4 font-medium ${
                  activeTab === "today"
                    ? "border-b-2 border-red-600 text-red-600"
                    : "text-gray-500 hover:text-red-500"
                }`}
              >
                Today’s Leaves
              </button>
              <button
                onClick={() => setActiveTab("upcoming")}
                className={`py-2 px-4 font-medium ${
                  activeTab === "upcoming"
                    ? "border-b-2 border-yellow-600 text-yellow-600"
                    : "text-gray-500 hover:text-yellow-500"
                }`}
              >
                Upcoming Leaves
              </button>
            </div>

            {activeTab === "today"
              ? renderTable(todayLeaves, "red")
              : renderTable(upcomingLeaves, "yellow")}
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow-md">
          <div className="flex space-x-4 border-b mb-4">
            <button
              onClick={() => setActiveTab1("attendance")}
              className={`py-2 px-4 font-medium ${
                activeTab1 === "attendance"
                  ? "border-b-2 border-green-600 text-green-600"
                  : "text-gray-500 hover:text-green-500"
              }`}
            >
              Today's Attendance
            </button>
            <button
              onClick={() => setActiveTab1("leaves")}
              className={`py-2 px-4 font-medium ${
                activeTab1 === "leaves"
                  ? "border-b-2 border-red-600 text-red-600"
                  : "text-gray-500 hover:text-red-500"
              }`}
            >
              Today's Leaves
            </button>
          </div>

          {activeTab1 === "attendance" ? renderAttendance() : renderLeaves()}
        </div>

        <div className="bg-white p-4 rounded-xl shadow-md">
          <h2 className="font-semibold mb-2 flex items-center gap-2">
            <FaClock /> Late Comers Today
          </h2>
          <ul className="text-sm space-y-1">
            {lateComers.map((u, i) => (
              <li key={i}>
                {u.name} ({u.email})
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-md">
          <h2 className="font-semibold mb-2 flex items-center gap-2">
            <FaCalendarCheck /> Recent Leave Approvals
          </h2>
          <ul className="text-sm space-y-1">
            {recentLeaveApprovals.map((leave, i) => (
              <li key={i}>
                {leave.user.name} ({leave.user.email}) - {leave.type} (
                {new Date(leave.from).toLocaleDateString()} to{" "}
                {new Date(leave.to).toLocaleDateString()})
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

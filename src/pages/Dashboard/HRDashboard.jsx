import React, { useEffect, useState } from "react";
import {
  FaUserTie,
  FaUserFriends,
  FaChartLine,
  FaTrophy,
  FaCalendarCheck,
  FaCalendarAlt,
  FaBan,
  FaClock,
} from "react-icons/fa";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import axios from "axios";
import { PROD_API_URL, TESTING_API_URL } from "../../utils/api";

const API_URL = PROD_API_URL ? `${PROD_API_URL}` : `${TESTING_API_URL}`;
const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#f87171", "#60a5fa"];

const HRDashboard = () => {
  const [stats, setStats] = useState([]);
  const [attendanceTrend, setAttendanceTrend] = useState([]);
  const [leaveTypeDistribution, setLeaveTypeDistribution] = useState([]);
  const [topBreakUsers, setTopBreakUsers] = useState([]);
  const [todayLeaves, setTodayLeaves] = useState([]);
  const [upcomingLeaves, setUpcomingLeaves] = useState([]);
  const [absentUsers, setAbsentUsers] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/auth/hr/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = res.data;

        setStats([
          {
            title: "Total Managers",
            icon: <FaUserTie />,
            value: data.totalManagers,
            color: "bg-pink-100 text-pink-700",
          },
          {
            title: "Total Employees",
            icon: <FaUserFriends />,
            value: data.totalEmployees,
            color: "bg-cyan-100 text-cyan-700",
          },
        ]);

        setAttendanceTrend(data.attendanceTrend || []);
        setLeaveTypeDistribution(data.leaveTypeDistribution || []);
        setTopBreakUsers(data.topBreakUsers || []);
        setTodayLeaves(data.todayLeaves || []);
        setUpcomingLeaves(data.upcomingLeaves || []);
        setAbsentUsers(data.absentUsers || []);
        setPendingLeaves(data.pendingLeaves || []);
        setTodayAttendance(data.todayAttendance || []);
      } catch (error) {
        console.error("Error fetching HR dashboard data", error);
      }
    };

    fetchDashboardData();
  }, []);

  const renderTable = (data, title, icon, color, columns) => (
    <div className="bg-white p-6 rounded-xl shadow-md mb-6">
      <h2
        className={`text-lg font-semibold mb-4 flex items-center gap-2 ${color}`}
      >
        {icon} {title}
      </h2>
      {data.length === 0 ? (
        <div className="text-sm text-gray-500 italic">No data available.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-gray-200">
            <thead className={`text-${color}-800 bg-${color}-100`}>
              <tr>
                {columns.map((col, i) => (
                  <th key={i} className="p-2 text-left border-b">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr
                  key={i}
                  className="border-b hover:bg-gray-50 transition duration-150"
                >
                  {columns.map((col, j) => (
                    <td key={j} className="p-2">
                      {col.render ? col.render(row, i) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-4 md:p-6">
      {/* Stats */}
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

      {/* Attendance Trend */}
      <div className="bg-white p-4 rounded-xl shadow-md mb-6">
        <h2 className="font-semibold mb-2 flex items-center gap-2">
          <FaChartLine /> Weekly Attendance Trend
        </h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={attendanceTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
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

      {/* Leave Type Distribution */}
      <div className="bg-white p-4 rounded-xl shadow-md mb-6">
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

      {/* Top Break Users */}
      {renderTable(
        topBreakUsers,
        "Top Break Users",
        <FaTrophy className="text-yellow-500" />,
        "yellow",
        [
          { label: "#", render: (_, i) => i + 1 },
          { label: "Name", key: "name" },
          { label: "Email", key: "email" },
          { label: "Break Minutes", key: "totalBreakMinutes" },
        ]
      )}

      {/* Today's Approved Leaves */}
      {renderTable(
        todayLeaves,
        "Today's Approved Leaves",
        <FaCalendarAlt className="text-red-500" />,
        "red",
        [
          { label: "#", render: (_, i) => i + 1 },
          { label: "Name", render: (r) => r.user?.name },
          { label: "Email", render: (r) => r.user?.email },
          {
            label: "From",
            render: (r) => new Date(r.from).toLocaleDateString(),
          },
          { label: "To", render: (r) => new Date(r.to).toLocaleDateString() },
          { label: "Type", key: "type" },
        ]
      )}

      {/* Upcoming Leaves */}
      {renderTable(
        upcomingLeaves,
        "Upcoming Leaves (7 Days)",
        <FaCalendarAlt className="text-blue-500" />,
        "blue",
        [
          { label: "#", render: (_, i) => i + 1 },
          { label: "Name", render: (r) => r.user?.name },
          { label: "Email", render: (r) => r.user?.email },
          {
            label: "From",
            render: (r) => new Date(r.from).toLocaleDateString(),
          },
          { label: "To", render: (r) => new Date(r.to).toLocaleDateString() },
          { label: "Type", key: "type" },
        ]
      )}

      {/* Pending Leaves */}
      {renderTable(
        pendingLeaves,
        "Pending Leaves",
        <FaClock className="text-orange-500" />,
        "orange",
        [
          { label: "#", render: (_, i) => i + 1 },
          { label: "Name", render: (r) => r.user?.name },
          { label: "Email", render: (r) => r.user?.email },
          {
            label: "From",
            render: (r) => new Date(r.from).toLocaleDateString(),
          },
          { label: "To", render: (r) => new Date(r.to).toLocaleDateString() },
          { label: "Reason", key: "reason" },
        ]
      )}

      {/* Absent Users */}
      {renderTable(
        absentUsers,
        "Absent Users",
        <FaBan className="text-gray-600" />,
        "gray",
        [
          { label: "#", render: (_, i) => i + 1 },
          { label: "Name", key: "name" },
          { label: "Email", key: "email" },
          { label: "Role", key: "role" },
        ]
      )}

      {renderTable(
        todayAttendance,
        "Today's Attendance",
        <FaClock className="text-green-600" />,
        "green",
        [
          { label: "#", render: (_, i) => i + 1 },
          { label: "Name", render: (r) => r.user?.name },
          { label: "Email", render: (r) => r.user?.email },
          {
            label: "Clock In",
            render: (r) => new Date(r.clockIn).toLocaleTimeString(),
          },
          {
            label: "Breaks",
            render: (r) =>
              (r.breaks || []).length === 0
                ? "—"
                : r.breaks
                    .map((b, i) => `#${i + 1}: ${b.durationMinutes || 0}m`)
                    .join(", "),
          },
        ]
      )}
    </div>
  );
};

export default HRDashboard;

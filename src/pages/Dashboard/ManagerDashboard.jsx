import React, { useEffect, useState } from "react";
import {
  FaUserTie,
  FaUsers,
  FaUserClock,
  FaUserTimes,
  FaBed,
  FaChartLine,
  FaCalendarPlus,
  FaUserPlus,
  FaClock,
  FaChartPie,
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
} from "recharts";
import axios from "axios";
import { PROD_API_URL, TESTING_API_URL } from "../../utils/api";

const API_URL = PROD_API_URL ? `${PROD_API_URL}` : `${TESTING_API_URL}`;
const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#f87171", "#60a5fa"];

const ManagerDashboard = () => {
  const [totalHRs, setTotalHRs] = useState(0);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [todayLeaves, setTodayLeaves] = useState([]);
  const [upcomingLeaves, setUpcomingLeaves] = useState([]);
  const [absentUsers, setAbsentUsers] = useState([]);
  const [attendanceTrend, setAttendanceTrend] = useState([]);
  const [leaveTypeDistribution, setLeaveTypeDistribution] = useState([]);
  const [lateComers, setLateComers] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [topBreakUsers, setTopBreakUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("attendance");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/auth/manager/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = res.data;

        setTotalHRs(data.totalHRs);
        setTotalEmployees(data.totalEmployees);
        setTodayAttendance(data.todayAttendance || []);
        setTodayLeaves(data.todayLeaves || []);
        setUpcomingLeaves(data.upcomingLeaves || []);
        setAbsentUsers(data.absentUsers || []);
        setAttendanceTrend(data.attendanceTrend || []);
        setLeaveTypeDistribution(data.leaveTypeDistribution || []);
        setLateComers(data.lateComers || []);
        setRecentUsers(data.recentUsers || []);
        setTopBreakUsers(data.topBreakUsers || []);
      } catch (err) {
        console.error("Error fetching manager dashboard data", err);
      }
    };

    fetchData();
  }, []);

  const cards = [
    {
      title: "Total HRs",
      value: totalHRs,
      icon: <FaUserTie className="text-pink-600 text-xl" />,
      bg: "bg-pink-100 text-pink-800",
    },
    {
      title: "Total Employees",
      value: totalEmployees,
      icon: <FaUsers className="text-cyan-600 text-xl" />,
      bg: "bg-cyan-100 text-cyan-800",
    },
    {
      title: "Today Present",
      value: todayAttendance.length,
      icon: <FaUserClock className="text-green-600 text-xl" />,
      bg: "bg-green-100 text-green-800",
    },
    {
      title: "On Leave Today",
      value: todayLeaves.length,
      icon: <FaBed className="text-red-600 text-xl" />,
      bg: "bg-red-100 text-red-800",
    },
    {
      title: "Absent Users",
      value: absentUsers.length,
      icon: <FaUserTimes className="text-gray-600 text-xl" />,
      bg: "bg-gray-100 text-gray-800",
    },
    {
      title: "Late Comers",
      value: lateComers.length,
      icon: <FaUserClock className="text-yellow-600 text-xl" />,
      bg: "bg-yellow-100 text-yellow-800",
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "attendance":
        return (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded shadow">
              <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <FaChartLine className="text-blue-600" /> Weekly Attendance
                Trend
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={attendanceTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-4 rounded shadow">
              <h2 className="text-lg font-semibold mb-2">Today's Attendance</h2>
              <ul className="list-disc list-inside text-sm space-y-1">
                {todayAttendance.map((a, i) => (
                  <li key={i}>
                    {a.user?.name} ({a.user?.role})
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-4 rounded shadow">
              <h2 className="text-lg font-semibold mb-2">Absent Users</h2>
              <ul className="list-disc list-inside text-sm space-y-1">
                {absentUsers.map((u, i) => (
                  <li key={i}>
                    {u.name} ({u.role})
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      case "leaves":
        return (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded shadow">
              <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <FaChartPie className="text-purple-600" /> Leave Type
                Distribution
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

            <div className="bg-white p-4 rounded shadow">
              <h2 className="text-lg font-semibold mb-2">Today's Leaves</h2>
              <ul className="list-disc list-inside text-sm space-y-1">
                {todayLeaves.map((l, i) => (
                  <li key={i}>
                    {l.user?.name} ({l.user?.role}) - {l.type}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-4 rounded shadow">
              <h2 className="text-lg font-semibold mb-2 flex items-center gap-2 text-blue-600">
                <FaCalendarPlus /> Upcoming Leaves
              </h2>
              {upcomingLeaves.length === 0 ? (
                <p className="text-sm text-gray-500 italic">
                  No upcoming leaves.
                </p>
              ) : (
                <ul className="space-y-1">
                  {upcomingLeaves.map((leave, i) => (
                    <li key={i} className="text-sm">
                      {leave.user?.name} ({leave.user?.role}) - {leave.type}{" "}
                      leave from {new Date(leave.from).toLocaleDateString()} to{" "}
                      {new Date(leave.to).toLocaleDateString()}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        );
      case "users":
        return (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded shadow">
              <h2 className="text-lg font-semibold mb-2 flex items-center gap-2 text-green-600">
                <FaUserPlus /> Recent Registrations
              </h2>
              {recentUsers.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No recent users.</p>
              ) : (
                <ul className="space-y-1">
                  {recentUsers.map((user, i) => (
                    <li key={i} className="text-sm">
                      {user.name} ({user.role}) - {user.email}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="bg-white p-4 rounded shadow">
              <h2 className="text-lg font-semibold mb-2 flex items-center gap-2 text-yellow-600">
                <FaClock /> Break Usage
              </h2>
              {topBreakUsers.length === 0 ? (
                <p className="text-sm text-gray-500 italic">
                  No break data available.
                </p>
              ) : (
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
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {cards.map((card, i) => (
          <div
            key={i}
            className={`rounded-xl shadow-md p-4 ${card.bg} flex items-center justify-between`}
          >
            <div>
              <h3 className="text-sm font-medium">{card.title}</h3>
              <p className="text-2xl font-bold">{card.value}</p>
            </div>
            <div className="bg-white rounded-full p-2 shadow">{card.icon}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b text-sm font-medium">
        <button
          className={`px-4 py-2 border-b-2 transition-all duration-200 ${
            activeTab === "attendance"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-blue-600"
          }`}
          onClick={() => setActiveTab("attendance")}
        >
          Attendance
        </button>
        <button
          className={`px-4 py-2 border-b-2 transition-all duration-200 ${
            activeTab === "leaves"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-blue-600"
          }`}
          onClick={() => setActiveTab("leaves")}
        >
          Leaves
        </button>
        <button
          className={`px-4 py-2 border-b-2 transition-all duration-200 ${
            activeTab === "users"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-blue-600"
          }`}
          onClick={() => setActiveTab("users")}
        >
          Users
        </button>
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
};

export default ManagerDashboard;

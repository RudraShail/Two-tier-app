import React, { useEffect, useState } from "react";
import {
  FaClock,
  FaCalendarCheck,
  FaCalendarAlt,
  FaChartLine,
  FaBan,
} from "react-icons/fa";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import axios from "axios";
import { PROD_API_URL, TESTING_API_URL } from "../../utils/api";

const API_URL = PROD_API_URL ? `${PROD_API_URL}` : `${TESTING_API_URL}`;
const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#f87171", "#60a5fa"];

const EmployeeDashboard = () => {
  const [attendanceTrend, setAttendanceTrend] = useState([]);
  const [leaveTypeDistribution, setLeaveTypeDistribution] = useState([]);
  const [approvedLeaves, setApprovedLeaves] = useState([]);
  const [upcomingLeaves, setUpcomingLeaves] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [totalBreakMinutes, setTotalBreakMinutes] = useState(0);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/auth/employee/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data;
        setAttendanceTrend(data.attendanceTrend || []);
        setLeaveTypeDistribution(data.leaveTypeDistribution || []);
        setApprovedLeaves(data.approvedLeaves || []);
        setUpcomingLeaves(data.upcomingLeaves || []);
        setPendingLeaves(data.pendingLeaves || []);
        setTodayAttendance(data.todayAttendance || null);
        setTotalBreakMinutes(data.totalBreakMinutes || 0);
      } catch (err) {
        console.error("Failed to load employee dashboard", err);
      }
    };

    fetchDashboard();
  }, []);

  const renderTable = (data, title, icon, color, columns) => (
    <div className="bg-white p-6 rounded-xl shadow-md mb-6">
      <h2
        className={`text-lg font-semibold mb-4 flex items-center gap-2 text-${color}-700`}
      >
        {icon} {title}
      </h2>
      {data.length === 0 ? (
        <div className="text-sm text-gray-500 italic">No data available.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-gray-200">
            <thead className={`bg-${color}-100 text-${color}-800`}>
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
      {/* Today's Attendance Card */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-6">
        <h2 className="text-lg font-semibold mb-2 flex items-center gap-2 text-green-700">
          <FaClock /> Today’s Attendance
        </h2>
        {todayAttendance ? (
          <div className="text-sm space-y-1">
            <p>
              <strong>Clock In:</strong>{" "}
              {new Date(todayAttendance.clockIn).toLocaleTimeString()}
            </p>
            <p>
              <strong>Clock Out:</strong>{" "}
              {new Date(todayAttendance.clockOut).toLocaleTimeString()}
            </p>
            <p>
              <strong>Break Time:</strong> {totalBreakMinutes} minutes
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">
            You have not marked attendance today.
          </p>
        )}
      </div>

      {/* Attendance Trend */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-6">
        <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
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
              stroke="#3b82f6"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Leave Type Pie Chart */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-6">
        <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <FaCalendarCheck /> Your Leave Distribution
        </h2>
        {leaveTypeDistribution.length > 0 ? (
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
                {leaveTypeDistribution.map((entry, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-gray-500 italic">
            No approved leaves yet.
          </p>
        )}
      </div>

      {/* Approved Leaves */}
      {renderTable(
        approvedLeaves,
        "Approved Leaves",
        <FaCalendarAlt />,
        "blue",
        [
          { label: "#", render: (_, i) => i + 1 },
          {
            label: "From",
            render: (r) => new Date(r.from).toLocaleDateString(),
          },
          {
            label: "To",
            render: (r) => new Date(r.to).toLocaleDateString(),
          },
          { label: "Type", key: "type" },
        ]
      )}

      {/* Upcoming Leaves */}
      {renderTable(
        upcomingLeaves,
        "Upcoming Leaves (7 Days)",
        <FaCalendarAlt />,
        "cyan",
        [
          { label: "#", render: (_, i) => i + 1 },
          {
            label: "From",
            render: (r) => new Date(r.from).toLocaleDateString(),
          },
          {
            label: "To",
            render: (r) => new Date(r.to).toLocaleDateString(),
          },
          { label: "Type", key: "type" },
        ]
      )}

      {/* Pending Leaves */}
      {renderTable(pendingLeaves, "Pending Leaves", <FaBan />, "orange", [
        { label: "#", render: (_, i) => i + 1 },
        {
          label: "From",
          render: (r) => new Date(r.from).toLocaleDateString(),
        },
        {
          label: "To",
          render: (r) => new Date(r.to).toLocaleDateString(),
        },
        { label: "Reason", key: "reason" },
      ])}
    </div>
  );
};

export default EmployeeDashboard;

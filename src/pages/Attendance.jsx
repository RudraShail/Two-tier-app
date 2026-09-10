import { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import {
  FaSignInAlt,
  FaSignOutAlt,
  FaFilePdf,
  FaFileExcel,
} from "react-icons/fa";
import { TESTING_API_URL, PROD_API_URL } from "../utils/api";

const API_URL = PROD_API_URL
  ? `${PROD_API_URL}/attendance`
  : `${TESTING_API_URL}/attendance`;

const CHECK_URL = PROD_API_URL
  ? `${PROD_API_URL}/attendance/check`
  : `${TESTING_API_URL}/attendance/check`;

const Attendance = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [perPage] = useState(5);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [hasCheckedOut, setHasCheckedOut] = useState(false);
  const [liveTimes, setLiveTimes] = useState({});
  const [liveBreakTimes, setLiveBreakTimes] = useState({});
  const [loadingCheckIn, setLoadingCheckIn] = useState(false);
  const [loadingCheckOut, setLoadingCheckOut] = useState(false);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const fetchUserAttendanceData = async (userId) => {
    try {
      const res = await axios.get(`${API_URL}/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const today = new Date().toISOString().slice(0, 10);
      const todayData = res.data.data.find(
        (entry) => new Date(entry.date).toISOString().slice(0, 10) === today
      );

      setHasCheckedIn(!!todayData?.clockIn);
      setHasCheckedOut(!!todayData?.clockOut);
      setData(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (error) {
      console.error("Error fetching attendance data by user:", error);
    }
  };

  const fetchTeamAttendanceData = async () => {
    try {
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (error) {
      console.error("Error fetching attendance data:", error);
    }
  };

  useEffect(() => {
    if (user?.role === "SuperAdmin") {
      fetchTeamAttendanceData();
    } else {
      fetchUserAttendanceData(user?.id);
    }
  }, []);

  // 🔄 Auto-reset check-in/out if date changes (every minute)
  useEffect(() => {
    const interval = setInterval(() => {
      const today = new Date().toISOString().slice(0, 10);
      const todayData = data.find(
        (entry) => new Date(entry.date).toISOString().slice(0, 10) === today
      );
      setHasCheckedIn(!!todayData?.clockIn);
      setHasCheckedOut(!!todayData?.clockOut);
    }, 60 * 1000); // Every minute

    return () => clearInterval(interval);
  }, [data]);

  const handleCheck = async (type) => {
    const now = new Date();
    const payload = {
      date: now.toISOString().slice(0, 10),
      time: now.toISOString(),
    };

    if (type === "in") setLoadingCheckIn(true);
    if (type === "out") setLoadingCheckOut(true);

    try {
      await axios.post(`${CHECK_URL}${type}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (type === "in") setHasCheckedIn(true);
      if (type === "out") setHasCheckedOut(true);

      if (user?.role === "SuperAdmin") {
        await fetchTeamAttendanceData();
      } else {
        await fetchUserAttendanceData(user?.id);
      }
    } catch (err) {
      console.error("Error checking in/out:", err);
      alert(err?.response?.data?.message);
    } finally {
      setLoadingCheckIn(false);
      setLoadingCheckOut(false);
    }
  };

  const handlePDF = () => {
    const doc = new jsPDF();
    doc.text("Attendance Report", 14, 10);
    doc.autoTable({ html: "#attendance-table", theme: "grid" });
    doc.save("attendance.pdf");
  };

  const handleExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
    XLSX.writeFile(workbook, "attendance.xlsx");
  };

  const filteredData = data;
  const paginatedData = filteredData.slice(
    (page - 1) * perPage,
    page * perPage
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const updatedBreaks = {};
      const updatedWorkTimes = {};

      paginatedData.forEach((item) => {
        const clockIn = item.clockIn ? new Date(item.clockIn) : null;
        const clockOut = item.clockOut ? new Date(item.clockOut) : null;

        const ongoingBreak = item.breaks?.find((b) => b.start && !b.end);
        if (ongoingBreak) {
          const now = new Date();
          const start = new Date(ongoingBreak.start);
          const diffMs = now - start;
          const hours = String(Math.floor(diffMs / (1000 * 60 * 60))).padStart(
            2,
            "0"
          );
          const mins = String(Math.floor((diffMs / (1000 * 60)) % 60)).padStart(
            2,
            "0"
          );
          const secs = String(Math.floor((diffMs / 1000) % 60)).padStart(
            2,
            "0"
          );
          updatedBreaks[item._id] = `${hours}:${mins}:${secs}`;
        }

        if (clockIn && !clockOut) {
          const now = new Date();
          const totalMs = now - clockIn;

          const breakMinutes =
            item.breaks?.reduce(
              (acc, cur) => acc + (cur.durationMinutes || 0),
              0
            ) || 0;

          const totalMins = Math.floor(totalMs / (1000 * 60));
          const workMins = totalMins - breakMinutes;

          const hours = String(Math.floor(workMins / 60)).padStart(2, "0");
          const mins = String(workMins % 60).padStart(2, "0");
          const secs = String(Math.floor((totalMs / 1000) % 60)).padStart(
            2,
            "0"
          );

          updatedWorkTimes[item._id] = `${hours}:${mins}:${secs}`;
        }
      });

      setLiveBreakTimes(updatedBreaks);
      setLiveTimes((prev) => ({ ...prev, ...updatedWorkTimes }));
    }, 1000);

    return () => clearInterval(interval);
  }, [paginatedData]);

  return (
    <div className="p-4">
      <h2 className="text-3xl font-bold mb-6 text-blue-700">
        Attendance Records
      </h2>

      {user?.role !== "SuperAdmin" && (
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => handleCheck("in")}
            disabled={hasCheckedIn || loadingCheckIn}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded w-1/2 text-white ${
              hasCheckedIn || loadingCheckIn
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loadingCheckIn ? (
              <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <>
                <FaSignInAlt /> Check In
              </>
            )}
          </button>

          <button
            onClick={() => handleCheck("out")}
            disabled={hasCheckedOut || loadingCheckOut}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded w-1/2 text-white ${
              hasCheckedOut || loadingCheckOut
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-yellow-600 hover:bg-yellow-700"
            }`}
          >
            {loadingCheckOut ? (
              <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <>
                <FaSignOutAlt /> Check Out
              </>
            )}
          </button>
        </div>
      )}

      {/* Attendance Table */}
      <table
        id="attendance-table"
        className="w-full table-auto bg-white shadow rounded overflow-hidden"
      >
        <thead className="bg-blue-100 text-blue-800 text-sm">
          <tr>
            <th className="p-2">Date</th>
            <th className="p-2">User</th>
            <th className="p-2">Clock In</th>
            <th className="p-2">Clock Out</th>
            <th className="p-2">Break (mins)</th>
            <th className="p-2">Working Hours</th>
            <th className="p-2">Ongoing Break</th>
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((item) => {
            const breakMinutes =
              item.breaks?.reduce(
                (acc, cur) => acc + (cur.durationMinutes || 0),
                0
              ) || 0;

            const clockIn = item.clockIn ? new Date(item.clockIn) : null;
            const clockOut = item.clockOut ? new Date(item.clockOut) : null;

            let workDisplay = "-";
            if (clockIn && clockOut) {
              const diffMs = clockOut.getTime() - clockIn.getTime();
              const totalMins = Math.floor(diffMs / (1000 * 60));
              const workMins = totalMins - breakMinutes;

              const hours = String(Math.floor(workMins / 60)).padStart(2, "0");
              const mins = String(workMins % 60).padStart(2, "0");
              workDisplay = `${hours}:${mins}:00`;
            } else if (clockIn && !clockOut) {
              workDisplay = liveTimes[item._id] || "00:00:00";
            }

            const ongoingBreak = item.breaks?.find((b) => b.start && !b.end);
            const breakDisplay = ongoingBreak
              ? liveBreakTimes[item._id] || "00:00:00"
              : "-";

            return (
              <tr
                key={item._id}
                className="text-center border-b text-sm hover:bg-gray-50"
              >
                <td className="p-2">
                  {new Date(item.date).toLocaleDateString()}
                </td>
                <td className="p-2">{item.user?.name || item.user || "N/A"}</td>
                <td className="p-2">
                  {item.clockIn
                    ? new Date(item.clockIn).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })
                    : "-"}
                </td>
                <td className="p-2">
                  {item.clockOut
                    ? new Date(item.clockOut).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })
                    : "-"}
                </td>
                <td className="p-2">{breakMinutes}</td>
                <td className="p-2 font-extrabold text-green-700">
                  {workDisplay}
                </td>
                <td className="p-2 text-red-600 font-semibold">
                  {breakDisplay !== "-" ? `⏸ ${breakDisplay}` : "-"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="mt-4 flex justify-center gap-4">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-3 py-1 bg-gray-300 rounded"
        >
          Prev
        </button>
        <span className="px-4 py-1">Page {page}</span>
        <button
          disabled={page * perPage >= filteredData.length}
          onClick={() => setPage(page + 1)}
          className="px-3 py-1 bg-gray-300 rounded"
        >
          Next
        </button>
      </div>

      <div className="flex gap-2 w-full mt-6">
        <button
          onClick={handlePDF}
          className="flex items-center justify-center gap-2 bg-red-500 text-white px-4 py-2 rounded w-1/2 hover:bg-red-600"
        >
          <FaFilePdf /> PDF
        </button>
        <button
          onClick={handleExcel}
          className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded w-1/2 hover:bg-green-700"
        >
          <FaFileExcel /> Excel
        </button>
      </div>
    </div>
  );
};

export default Attendance;

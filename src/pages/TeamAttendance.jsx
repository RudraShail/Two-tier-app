import { useEffect, useState } from "react";
import axios from "axios";
import "jspdf-autotable";
import { TESTING_API_URL, PROD_API_URL } from "../utils/api";

const API_URL = PROD_API_URL
  ? `${PROD_API_URL}/attendance`
  : `${TESTING_API_URL}/attendance`;

const TeamAttendance = () => {
  const [data, setData] = useState([]);
  const [search] = useState("");
  const [page, setPage] = useState(1);
  const [perPage] = useState(5);
  const [filterDate] = useState("");
  const [liveTimes, setLiveTimes] = useState({});
  const [liveBreakTimes, setLiveBreakTimes] = useState({});

  const token = localStorage.getItem("token");

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API_URL}/attendance-hierarchy`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(res.data);
      setData(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (error) {
      console.error("Error fetching attendance data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = data.filter((item) => {
    const matchDate =
      !filterDate ||
      new Date(item.date).toISOString().slice(0, 10) === filterDate;
    const matchSearch = [
      item.user?.name?.toLowerCase(),
      item.total?.toLowerCase(),
      item.clockIn?.toLowerCase(),
      item.clockOut?.toLowerCase(),
    ].some((field) => field?.includes(search.toLowerCase()));
    return matchDate && matchSearch;
  });

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

        // 🔴 LIVE BREAK TIMER
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

        // 🔵 LIVE WORK DURATION TIMER
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-blue-700">
          Team Attendance Records
        </h2>
      </div>

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
            <th className="p-2">Ongoing Break </th>
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

            let workDurationMins = 0;
            let workDisplay = "-";

            if (clockIn && clockOut) {
              const diffMs = clockOut.getTime() - clockIn.getTime();
              const totalMins = Math.floor(diffMs / (1000 * 60));
              workDurationMins = totalMins - breakMinutes;

              const hours = String(Math.floor(workDurationMins / 60)).padStart(
                2,
                "0"
              );
              const mins = String(workDurationMins % 60).padStart(2, "0");
              workDisplay = `${hours}:${mins}:00`;
            } else if (clockIn && !clockOut) {
              workDisplay = liveTimes[item._id] || "00:00:00";
            }

            // 🟡 Check if break is ongoing
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
    </div>
  );
};

export default TeamAttendance;

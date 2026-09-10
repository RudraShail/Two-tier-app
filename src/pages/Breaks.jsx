import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaClock,
  FaPlay,
  FaPause,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { TESTING_API_URL, PROD_API_URL } from "../utils/api";

const API_URL = PROD_API_URL
  ? `${PROD_API_URL}/attendance`
  : `${TESTING_API_URL}/attendance`;

const BREAK_URL = PROD_API_URL
  ? `${PROD_API_URL}/attendance/break`
  : `${TESTING_API_URL}/attendance/break`;

const MAX_BREAKS_PER_DAY = 5;
const MAX_BREAK_DURATION = 15; // In minutes

const Breaks = () => {
  const [data, setData] = useState([]);
  const [hasBreakIn, setHasBreakIn] = useState(false);
  const [todayBreaks, setTodayBreaks] = useState([]);
  const [remainingBreaks, setRemainingBreaks] = useState(MAX_BREAKS_PER_DAY);
  const [isLoading, setIsLoading] = useState(false);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [hasCheckedOut, setHasCheckedOut] = useState(false);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const fetchData = async () => {
    try {
      const url =
        user?.role === "SuperAdmin" ? API_URL : `${API_URL}/user/${user?.id}`;
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const today = new Date().toISOString().split("T")[0]; // 'YYYY-MM-DD'

      const allBreaks = [];
      const todayList = [];

      let checkInFound = false;
      let checkOutDone = false;

      (res.data.data || []).forEach((att) => {
        const attDate = new Date(att.date).toISOString().split("T")[0];

        console.log("att.date:", att.date);
        console.log("today:", today);

        if (attDate === today) {
          console.log("Same date");
          checkInFound = !!att.clockIn;
          checkOutDone = !!att.clockOut;

          (att.breaks || []).forEach((brk) => {
            const breakObj = {
              date: attDate,
              start: brk.start,
              end: brk.end,
              durationMinutes: brk.durationMinutes,
              user: att.user,
            };
            console.log("Break:", breakObj);
            allBreaks.push(breakObj);
            todayList.push(breakObj);
          });
        } else {
          console.log("Different date");
        }
      });

      setHasCheckedIn(checkInFound);
      setHasCheckedOut(checkOutDone);

      const ongoing = todayList.some((b) => b.start && !b.end);
      setHasBreakIn(ongoing);
      setTodayBreaks(todayList);
      setRemainingBreaks(MAX_BREAKS_PER_DAY - todayList.length);
      setData(allBreaks);
    } catch (error) {
      console.error("Error fetching break data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      autoBreakCorrection();
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [todayBreaks, hasBreakIn]);

  const autoBreakCorrection = async () => {
    if (!hasBreakIn || !todayBreaks.length) return;

    const ongoingBreak = todayBreaks.find((b) => b.start && !b.end);
    if (!ongoingBreak) return;

    const startTime = new Date(ongoingBreak.start);
    const now = new Date();
    const diff = Math.floor((now - startTime) / 60000);

    if (diff > MAX_BREAK_DURATION) {
      try {
        // Step 1: Auto Break Out
        await axios.post(
          `${BREAK_URL}/end`,
          {
            date: new Date().toISOString().slice(0, 10),
            time: now.toISOString(),
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Step 2: Auto Break In again
        await axios.post(
          `${BREAK_URL}/start`,
          {
            date: new Date().toISOString().slice(0, 10),
            time: now.toISOString(),
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.warn(
          `⚠️ Break exceeded ${MAX_BREAK_DURATION} min. Auto-corrected.`
        );
        fetchData();
      } catch (err) {
        console.error("Auto break correction failed:", err);
      }
    }
  };

  const handleBreak = async (type) => {
    setIsLoading(true);
    const now = new Date();
    const payload = {
      date: now.toISOString().slice(0, 10),
      time: now.toISOString(),
    };

    if (type === "in") {
      if (todayBreaks.length >= MAX_BREAKS_PER_DAY) {
        alert("Maximum 5 breaks allowed per day.");
        setIsLoading(false);
        return;
      }
    }

    if (type === "out") {
      const lastBreak = todayBreaks.find((b) => b.start && !b.end);
      if (lastBreak) {
        const start = new Date(lastBreak.start);
        const nowTime = new Date();
        const duration = Math.floor((nowTime - start) / 60000);
        if (duration > MAX_BREAK_DURATION) {
          alert("Break duration exceeded 5 minutes. Please contact Admin.");
          setIsLoading(false);
          return;
        }
      }
    }

    try {
      await axios.post(
        `${BREAK_URL}/${type === "in" ? "start" : "end"}`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setHasBreakIn(type === "in");
      fetchData();
    } catch (error) {
      console.error(`Error during break ${type}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto bg-gray-50 rounded-lg shadow">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-blue-700 flex items-center gap-2">
          <FaClock /> Break Logs
        </h2>
        <div className="text-sm text-gray-600">
          <span className="font-semibold text-green-600">
            Breaks Remaining:
          </span>{" "}
          {remainingBreaks} / {MAX_BREAKS_PER_DAY}
        </div>
      </div>

      {/* ✅ Conditionally show break buttons only after check-in and before check-out */}
      {hasCheckedIn && !hasCheckedOut && (
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => handleBreak("in")}
            disabled={hasBreakIn || remainingBreaks === 0 || isLoading}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded text-white font-semibold transition ${
              hasBreakIn || remainingBreaks === 0 || isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isLoading ? (
              "Processing..."
            ) : (
              <>
                <FaPlay /> Break In
              </>
            )}
          </button>
          <button
            onClick={() => handleBreak("out")}
            disabled={!hasBreakIn || isLoading}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded text-white font-semibold transition ${
              !hasBreakIn || isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-yellow-600 hover:bg-yellow-700"
            }`}
          >
            {isLoading ? (
              "Processing..."
            ) : (
              <>
                <FaPause /> Break Out
              </>
            )}
          </button>
        </div>
      )}

      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full table-auto text-sm text-center">
          <thead className="bg-blue-100 text-blue-800">
            <tr>
              <th className="p-2">Date</th>
              <th className="p-2">Start</th>
              <th className="p-2">End</th>
              <th className="p-2">Duration (mins)</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((item, index) => (
                <tr
                  key={index}
                  className="border-b hover:bg-gray-50 transition-all"
                >
                  <td className="p-2">
                    {new Date(item.date).toLocaleDateString()}
                  </td>
                  <td className="p-2">
                    {item.start
                      ? new Date(item.start).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })
                      : "-"}
                  </td>
                  <td className="p-2">
                    {item.end
                      ? new Date(item.end).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })
                      : "-"}
                  </td>
                  <td className="p-2">{item.durationMinutes || "-"}</td>
                  <td className="p-2">
                    {item.end ? (
                      <span className="text-green-600 flex items-center justify-center gap-1">
                        <FaCheckCircle /> Completed
                      </span>
                    ) : (
                      <span className="text-red-600 flex items-center justify-center gap-1">
                        <FaTimesCircle /> Ongoing
                      </span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-gray-500 py-6">
                  No break records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Breaks;

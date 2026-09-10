import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  FaPlaneDeparture,
  FaHistory,
  FaCheck,
  FaTimes,
  FaCalendarAlt,
  FaClipboardList,
  FaFileAlt,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { TESTING_API_URL, PROD_API_URL } from "../utils/api";

const API_URL = PROD_API_URL
  ? `${PROD_API_URL}/leaves`
  : `${TESTING_API_URL}/leaves`;

const LeavePage = () => {
  const [form, setForm] = useState({ type: "", from: "", to: "", reason: "" });
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("user"));

  const headers = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const fetchLeaves = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/user/${currentUser?.id}`,
        headers
      );
      setLeaves(res.data.data);
    } catch (err) {
      toast.error("Failed to fetch leaves");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (new Date(form.to) < new Date(form.from)) {
      return toast.warning("To date must be after From date");
    }
    try {
      setLoading(true);
      await axios.post(`${API_URL}/apply`, form, headers);
      toast.success("Leave applied successfully");
      setForm({ type: "", from: "", to: "", reason: "" });
      fetchLeaves();
    } catch (err) {
      toast.error("Error applying leave");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  return (
    <div className="">
      {/* 📝 Leave Form */}
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white rounded-2xl shadow-xl p-6 mb-8"
      >
        <h2 className="text-3xl font-bold mb-6 flex items-center gap-3 text-blue-700">
          <FaPlaneDeparture className="text-blue-500" />
          Apply for Leave
        </h2>

        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
          {/* Leave Type */}
          <div>
            <label className="block mb-2 font-medium">Leave Type</label>
            <div className="flex items-center border rounded px-3">
              <FaClipboardList className="text-gray-500 mr-2" />
              <select
                className="w-full p-2 focus:outline-none"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                required
              >
                <option value="">Select Leave Type</option>
                <option value="Sick">Sick Leave</option>
                <option value="Casual">Casual Leave</option>
                <option value="Paid">Paid Leave</option>
              </select>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block mb-2 font-medium">Reason</label>
            <div className="flex items-center border rounded px-3">
              <FaFileAlt className="text-gray-500 mr-2" />
              <input
                type="text"
                className="w-full p-2 focus:outline-none"
                placeholder="Reason"
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                required
              />
            </div>
          </div>

          {/* From Date */}
          <div>
            <label className="block mb-2 font-medium">From Date</label>
            <div className="flex items-center border rounded px-3">
              <FaCalendarAlt className="text-gray-500 mr-2" />
              <input
                type="date"
                className="w-full p-2 focus:outline-none"
                value={form.from}
                onChange={(e) => setForm({ ...form, from: e.target.value })}
                required
              />
            </div>
          </div>

          {/* To Date */}
          <div>
            <label className="block mb-2 font-medium">To Date</label>
            <div className="flex items-center border rounded px-3">
              <FaCalendarAlt className="text-gray-500 mr-2" />
              <input
                type="date"
                className="w-full p-2 focus:outline-none"
                value={form.to}
                onChange={(e) => setForm({ ...form, to: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="md:col-span-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition duration-200"
          >
            {loading ? "Applying..." : "Apply Leave"}
          </button>
        </form>
      </motion.div>

      {/* 📄 Leave History */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-xl p-6"
      >
        <h2 className="text-3xl font-bold mb-6 flex items-center gap-3 text-green-700">
          <FaHistory className="text-green-500" />
          Leave History
        </h2>

        {leaves.length === 0 ? (
          <p className="text-gray-500">No leave history found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border rounded-xl overflow-hidden">
              <thead className="bg-blue-50 text-gray-700">
                <tr>
                  <th className="p-3 text-left">Applied On</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Type</th>
                  <th className="p-3 text-left">Reason</th>
                  <th className="p-3 text-left">From</th>
                  <th className="p-3 text-left">To</th>
                  <th className="p-3 text-left">Approved By</th>
                  <th className="p-3 text-left">Approved At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {leaves.map((leave, index) => (
                  <motion.tr
                    key={leave._id}
                    className={`hover:bg-blue-50 transition ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-100"
                    }`}
                    whileHover={{ scale: 1.005 }}
                  >
                    <td className="p-3">
                      {new Date(leave.createdAt).toLocaleDateString()}
                    </td>
                    <td
                      className={`p-3 font-medium capitalize ${
                        leave.status === "Approved"
                          ? "text-green-600"
                          : leave.status === "Rejected"
                          ? "text-red-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {leave.status}
                    </td>

                    <td className="p-3 font-medium text-blue-700">
                      {leave.type}
                    </td>
                    <td className="p-3 text-gray-600">{leave.reason}</td>

                    <td className="p-3">
                      {new Date(leave.from).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      {new Date(leave.to).toLocaleDateString()}
                    </td>

                    <td className="p-3 text-gray-700">
                      {leave.approver ? (
                        <div>
                          <div className="font-semibold">
                            {leave.approver.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {leave.approver.email}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Not yet</span>
                      )}
                    </td>
                    <td className="p-3">
                      {leave.status !== "Pending"
                        ? new Date(leave.updatedAt).toLocaleString()
                        : "--"}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default LeavePage;

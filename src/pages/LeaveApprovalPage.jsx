import { useEffect, useState } from "react";
import axios from "axios";
import { FaCheck, FaTimes, FaHistory } from "react-icons/fa";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { TESTING_API_URL, PROD_API_URL } from "../utils/api";

const API_URL = PROD_API_URL
  ? `${PROD_API_URL}/leaves`
  : `${TESTING_API_URL}/leaves`;

const LeaveApprovalPage = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  const headers = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const fetchAllLeaves = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}`, headers); // Assuming route for pending only
      setLeaves(res.data.data);
    } catch (err) {
      toast.error("Failed to fetch leave requests");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (leaveId, status) => {
    try {
      const endpoint =
        status === "Approved"
          ? `${API_URL}/${leaveId}/approve`
          : `${API_URL}/${leaveId}/reject`;

      await axios.put(endpoint, { comment: "Reviewed" }, headers);
      toast.success(`Leave ${status.toLowerCase()} successfully`);
      fetchAllLeaves();
    } catch (err) {
      toast.error("Failed to update status", err);
    }
  };

  useEffect(() => {
    fetchAllLeaves();
  }, []);

  return (
    <div className="">
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white rounded-2xl shadow-xl p-6"
      >
        <h2 className="text-3xl font-bold mb-6 flex items-center gap-3 text-purple-700">
          <FaHistory className="text-purple-500" />
          Leave Requests for Approval
        </h2>

        {loading ? (
          <p>Loading...</p>
        ) : leaves.length === 0 ? (
          <p className="text-gray-500">No pending leave requests.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border rounded-xl overflow-hidden">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="p-3 text-left">Employee</th>
                  <th className="p-3 text-left">Type</th>
                  <th className="p-3 text-left">From</th>
                  <th className="p-3 text-left">To</th>
                  <th className="p-3 text-left">Reason</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Approved By</th>
                  <th className="p-3 text-left">Approved On</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>

              <tbody>
                {leaves.map((leave) => {
                  const status = leave.status;
                  const approverName = leave.approver?.name || "—";
                  const approvedDate =
                    status !== "Pending"
                      ? new Date(leave.updatedAt).toLocaleString()
                      : "—";

                  let bgClass =
                    status === "Approved"
                      ? "bg-green-50"
                      : status === "Rejected"
                      ? "bg-red-50"
                      : "bg-white";

                  return (
                    <tr
                      key={leave._id}
                      className={`border-t hover:bg-gray-100 transition ${bgClass}`}
                    >
                      <td className="p-3">{leave.user?.name || "N/A"}</td>
                      <td className="p-3">{leave.type}</td>
                      <td className="p-3">
                        {new Date(leave.from).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        {new Date(leave.to).toLocaleDateString()}
                      </td>
                      <td className="p-3">{leave.reason}</td>

                      {/* ✅ Status */}
                      <td className="p-3">
                        <span
                          className={`text-sm font-semibold px-2 py-1 rounded-full ${
                            status === "Approved"
                              ? "bg-green-200 text-green-800"
                              : status === "Rejected"
                              ? "bg-red-200 text-red-800"
                              : "bg-yellow-200 text-yellow-800"
                          }`}
                        >
                          {status}
                        </span>
                      </td>

                      {/* ✅ Approved By */}
                      <td className="p-3">{approverName}</td>

                      {/* ✅ Approved On */}
                      <td className="p-3">{approvedDate}</td>

                      {/* ✅ Actions */}
                      <td className="p-3">
                        {status === "Pending" ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                updateStatus(leave._id, "Approved")
                              }
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded flex items-center gap-1"
                            >
                              <FaCheck /> Approve
                            </button>
                            <button
                              onClick={() =>
                                updateStatus(leave._id, "Rejected")
                              }
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded flex items-center gap-1"
                            >
                              <FaTimes /> Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-500 italic">
                            No actions
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default LeaveApprovalPage;

import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { TESTING_API_URL, PROD_API_URL } from "../utils/api";

const API_URL = PROD_API_URL
  ? `${PROD_API_URL}/auth`
  : `${TESTING_API_URL}/auth`;

const ForgotResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_URL}/forgot-password`, { email });
      toast.success("Reset link sent to your email.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to send reset link");
    }
    setLoading(false);
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }
    setLoading(true);
    try {
      await axios.post(`${API_URL}/reset-password/${token}`, { newPassword });
      toast.success("Password reset successful!");
      setTimeout(() => navigate("/login"), 2000); // Redirect after 2s
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to reset password");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-300 via-purple-300 to-pink-300 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden w-full max-w-4xl flex flex-col md:flex-row">
        {/* 🔵 Left Side */}
        <div className="bg-gradient-to-br from-purple-300 to-indigo-400 p-8 md:w-1/2 text-white flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-4">
              🚀 Tech Dev Attendance System
            </h2>
            {token ? (
              <>
                <p className="text-sm mb-2">
                  🔒 You're resetting your password for your account. Please
                  enter a <strong>new secure password</strong> in the form.
                </p>
                <p className="text-sm">
                  ✅ This reset link is valid only for <strong>1 hour</strong>.
                  Once completed, you can return to the login page.
                </p>
              </>
            ) : (
              <>
                <p className="text-sm mb-2">
                  📩 Enter your registered email and we'll send you a password
                  reset link.
                </p>
                <p className="text-sm">
                  🔐 Resetting your password helps keep your account secure.
                </p>
              </>
            )}
          </div>

          <div className="mt-6 text-sm font-extrabold italic text-center">
            Stay secure 🔐 – Built with ❤️ by Aman Sharma
          </div>
        </div>

        {/* 🔴 Right Side */}
        <div className="p-8 md:w-1/2 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-6 text-center">
              {token ? "🔒 Reset Password" : "📩 Forgot Password"}
            </h2>

            {token ? (
              <form onSubmit={handleResetSubmit} className="space-y-4">
                <input
                  type="password"
                  placeholder="Enter New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-3 border rounded"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                  {loading ? "Updating..." : "Reset Password"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <input
                  type="email"
                  placeholder="Enter Your Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 border rounded"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
            )}
          </div>

          {/* 🔁 Back to Login */}
          <div className="text-right mt-4">
            <button
              onClick={() => navigate("/login")}
              className="text-sm text-indigo-600 hover:underline"
            >
              🔙 Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotResetPassword;

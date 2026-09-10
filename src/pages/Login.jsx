import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUserShield,
  FaLock,
  FaSignInAlt,
  FaKey,
  FaPaperPlane,
  FaSyncAlt,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { TESTING_API_URL, PROD_API_URL } from "../utils/api";

const API_URL = PROD_API_URL ? `${PROD_API_URL}` : `${TESTING_API_URL}`;

const Login = () => {
  const [activeTab, setActiveTab] = useState("login");
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("123456");
  const [showPassword, setShowPassword] = useState(false); // add this state
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const otpRefs = useRef([]);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });
      login(res.data);

      const role = res.data?.user?.role;

      // Role-based redirection
      if (role === "admin") {
        navigate("/dashboard");
      } else if (role === "manager") {
        navigate("/attendance");
      } else if (role === "employee") {
        navigate("/breaks");
      } else {
        navigate("/"); // default
      }

      console.log("Login successful ✅", res.data);
    } catch (err) {
      setError(`${err?.response?.data?.message}`);
      console.error("Login failed ❌", err);
    }

    setLoading(false);
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const enteredOtp = otp.join("");
    try {
      const res = await axios.post(`${API_URL}/auth/verify-otp`, {
        email,
        otp: enteredOtp,
      });

      if (res.data) {
        console.log("OTP verified successfully:", res.data.message);
        setActiveTab("login");
      } else {
        alert("❌ " + res.data.message || "Invalid OTP");
      }
    } catch (err) {
      console.error("OTP verification failed:", err);
      alert("❌ Verification failed. Please try again.");
    }
  };

  const handleResendOtp = () => {
    console.log("Resend OTP to:", email);
    alert("OTP resent to " + email);
  };

  const handleForgotPasswordClick = () => {
    navigate("/forgot-password");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-300 via-purple-300 to-pink-300 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden w-full max-w-4xl flex flex-col md:flex-row">
        {/* Left Side */}
        <div className="bg-gradient-to-br from-purple-300 to-indigo-400 p-8 md:w-1/2 text-white flex flex-col justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">👋 Welcome Back!</h1>
            <h2 className="text-xl font-semibold mb-4">
              🚀 Tech Dev Attendance System
            </h2>
            <p className="text-sm mb-2">
              📝 Please <strong>login with your email & password</strong> if
              you've already verified your email OTP.
            </p>
            <p className="text-sm mb-2">
              🔐 If you're a <strong>new user</strong> and haven't verified the
              OTP sent to your Gmail during registration, please go to the{" "}
              <strong>OTP Verification</strong> tab first!
            </p>
            <p className="text-sm">
              ✅ Once your OTP is verified, you'll be able to login and access
              your dashboard smoothly.
            </p>
          </div>

          <div className="mt-6 text-sm font-extrabold italic text-center">
            Stay secure 🔐 – Built with ❤️ by Aman Sharma
          </div>
        </div>

        {/* Right Side */}
        <div className="p-8 md:w-1/2 w-full">
          {/* Tabs */}
          <div className="flex justify-around mb-6">
            <button
              onClick={() => setActiveTab("login")}
              className={`py-2 px-4 w-full font-medium rounded-t-md ${
                activeTab === "login"
                  ? "bg-indigo-500 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              🔐 Login
            </button>
            <button
              onClick={() => setActiveTab("otp")}
              className={`py-2 px-4 w-full font-medium rounded-t-md ${
                activeTab === "otp"
                  ? "bg-indigo-500 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              🔢 OTP Verification
            </button>
          </div>

          {/* Content */}
          {activeTab === "login" ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FaSignInAlt /> Login Form
              </h2>

              {error && <p className="text-red-500 text-center">{error}</p>}

              <div className="relative">
                <FaUserShield className="absolute top-5 left-3 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter Email"
                  className="w-full pl-10 p-3 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div className="relative">
                <FaLock className="absolute top-5 left-3 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"} // toggle input type
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Password"
                  className="w-full pl-10 p-3 border border-gray-300 rounded-md"
                  required
                />
                <span
                  className="absolute top-4 right-3 text-gray-500 cursor-pointer"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white w-full py-3 rounded-md font-medium flex justify-center gap-2"
              >
                {loading ? (
                  <>
                    <FaPaperPlane className="animate-spin" /> Logging In...
                  </>
                ) : (
                  <>
                    <FaPaperPlane /> Login
                  </>
                )}
              </button>
              <div className="text-right mt-4">
                <button
                  onClick={handleForgotPasswordClick}
                  className="text-indigo-600 hover:underline flex items-center justify-end gap-2 text-sm"
                >
                  <FaKey className="text-sm" /> Forgot Password
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-5">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FaKey /> OTP Verification
              </h2>

              <div className="relative">
                <FaUserShield className="absolute top-5 left-3 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter Email"
                  className="w-full pl-10 p-3 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div className="flex justify-center gap-2">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpRefs.current[idx] = el)}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-12 h-12 text-center text-xl border border-gray-300 rounded-md"
                  />
                ))}
              </div>

              <button
                onClick={handleVerifyOtp}
                className="bg-green-600 hover:bg-green-700 text-white w-full py-3 rounded-md font-medium"
              >
                ✅ Verify OTP
              </button>

              <div className="text-center">
                <button
                  onClick={handleResendOtp}
                  className="text-indigo-600 hover:underline flex items-center justify-center gap-2 text-sm"
                >
                  <FaSyncAlt /> Resend OTP
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;

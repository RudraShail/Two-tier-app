import React, { useState } from "react";
import axios from "axios";
import {
  FaUserPlus,
  FaUser,
  FaEnvelope,
  FaLock,
  FaShieldAlt,
  FaUserShield,
} from "react-icons/fa";
import { TESTING_API_URL, PROD_API_URL } from "../utils/api";

const API_URL = PROD_API_URL
  ? `${PROD_API_URL}/auth/register`
  : `${TESTING_API_URL}/auth/register`;

const AdminRegistration = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Admin",
    admin: "68415709c742856c5a9afdff", // Super Admin ID
  });

  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!emailRegex.test(form.email)) errs.email = "Invalid email";
    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 6)
      errs.password = "Password must be at least 6 characters";
    if (!form.admin.trim()) errs.admin = "Super Admin ID is required";

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");
    setLoading(true); // Start loader

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setLoading(false); // Stop loader on validation fail
      return;
    }
    setErrors({});

    try {
      await axios.post(API_URL, form);
      setSuccessMsg("🎉 Admin registered successfully!");
      setForm({
        name: "",
        email: "",
        password: "",
        role: "Admin",
        admin: "68415709c742856c5a9afdff",
      });
    } catch (err) {
      setErrorMsg("❌ Failed to register admin. Try again.", err);
    }

    setLoading(false); // Stop loader
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center px-4">
      <div className="bg-white shadow-2xl rounded-xl w-full p-8">
        <h2 className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-2">
          <FaUserPlus className="text-indigo-500" /> Create New Admin
        </h2>

        {successMsg && (
          <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-center text-sm">
            {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center text-sm">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Super Admin ID */}
          <div className="relative">
            <FaUserShield className="absolute top-5 left-3 text-gray-400" />
            <input
              name="admin"
              value={form.admin}
              disabled
              onChange={handleChange}
              placeholder="Your Super Admin ID"
              className="w-full pl-10 p-3 bg-gray-100 border rounded-md text-gray-500"
            />
            {errors.admin && (
              <p className="text-red-500 text-xs mt-1">{errors.admin}</p>
            )}
          </div>

          {/* Role (Hidden/Locked as admin) */}
          <div className="relative">
            <FaShieldAlt className="absolute top-5 left-3 text-gray-400" />
            <input
              name="role"
              value={form.role}
              disabled
              className="w-full pl-10 p-3 bg-gray-100 border rounded-md text-gray-500"
            />
          </div>

          {/* Name */}
          <div className="relative">
            <FaUser className="absolute top-5 left-3 text-gray-400" />
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Full Name"
              className="w-full pl-10 p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div className="relative">
            <FaEnvelope className="absolute top-5 left-3 text-gray-400" />
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              className="w-full pl-10 p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="relative">
            <FaLock className="absolute top-5 left-3 text-gray-400" />
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full pl-10 p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-md flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Register Admin"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminRegistration;

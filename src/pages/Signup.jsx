import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../api/axiosInstance";
import bg from "../assets/bg.jpg";

export default function Signup() {
  const navigate = useNavigate();

  const [userType, setUserType] = useState("userAdmin");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    licenseNumber: "",
    profilePic: "",
    vehicleType: "",
    vehicleNumber: "",
    vehicleModel: "",
    latitude: "",
    longitude: "",
  });

  const [isAdmin, setIsAdmin] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUserTypeToggle = (type) => {
    setUserType(type);
    if (type === "driver") {
      setIsAdmin(false);
    }
  };

  const handleRoleChange = (e) => {
    setIsAdmin(e.target.value === "admin");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let res;

      if (userType === "driver") {
        const payload = {
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
          role: "driver",
          licenseNumber: form.licenseNumber,
          profilePic: form.profilePic,
          vehicleDetails: {
            vehicleType: form.vehicleType,
            vehicleNumber: form.vehicleNumber,
            vehicleModel: form.vehicleModel,
          },
          location: {
            type: "Point",
            coordinates: [
              parseFloat(form.longitude),
              parseFloat(form.latitude),
            ],
          },
        };
        res = await axios.post("/drivers/register", payload);
      } else {
        const payload = {
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
          isAdmin,
        };
        res = await axios.post("/auth/register", payload);
      }
      console.log("Signup response:", res.data);
      alert("Signup successful! Please login to continue.");
      navigate("/login");
    } catch (err) {
      console.error("Signup failed:", err.response?.data || err.message);
      alert(
        "Signup failed: " + (err.response?.data?.message || "Server error")
      );
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-start p-4"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg space-y-5"
      >
        <h2 className="text-3xl font-bold text-center text-gray-800">
          Sign Up
        </h2>

        <div className="flex justify-center space-x-4 mb-4">
          <button
            type="button"
            onClick={() => handleUserTypeToggle("userAdmin")}
            className={`px-6 py-2 rounded-md font-semibold ${
              userType === "userAdmin"
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            User / Admin
          </button>
          <button
            type="button"
            onClick={() => handleUserTypeToggle("driver")}
            className={`px-6 py-2 rounded-md font-semibold ${
              userType === "driver"
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Driver
          </button>
        </div>

        {/* Common fields */}
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded-md"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded-md"
          required
        />
        <input
          type="text"
          name="phone"
          placeholder="Phone Number"
          value={form.phone}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded-md"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded-md"
          required
        />

        {/* Admin/User role dropdown */}
        {userType === "userAdmin" && (
          <select
            name="role"
            value={isAdmin ? "admin" : "user"}
            onChange={handleRoleChange}
            className="w-full p-3 border border-gray-300 rounded-md"
            required
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        )}

        {/* Driver-specific fields */}
        {userType === "driver" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="licenseNumber"
              placeholder="License Number"
              value={form.licenseNumber}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md"
              required
            />

            <input
              type="text"
              name="vehicleNumber"
              placeholder="Vehicle Number"
              value={form.vehicleNumber}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md"
              required
            />
            <select
              name="vehicleType"
              value={form.vehicleType}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md"
              required
            >
              <option value="">Select Vehicle Type</option>
              <option value="Car">Car</option>
              <option value="Bike">Bike</option>
            </select>

            <select
              name="vehicleModel"
              value={form.vehicleModel}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md"
              required
            >
              <option value="">Select Vehicle Model</option>
              <option value="Honda City">Honda City</option>
              <option value="Maruti Swift">Maruti Swift</option>
              <option value="Hyundai i20">Hyundai i20</option>
              <option value="Bajaj Pulsar">Bajaj Pulsar</option>
              <option value="TVS Apache">TVS Apache</option>
            </select>

            <input
              type="number"
              name="latitude"
              placeholder="Latitude"
              value={form.latitude}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md"
              required
            />
            <input
              type="number"
              name="longitude"
              placeholder="Longitude"
              value={form.longitude}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md"
              required
            />
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-green-600 text-white p-3 rounded-md hover:bg-green-700"
        >
          Sign Up
        </button>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-green-600 font-medium hover:underline"
          >
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}

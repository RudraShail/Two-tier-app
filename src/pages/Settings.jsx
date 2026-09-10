import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom"; // assuming you're using react-router
import { toast } from "react-toastify"; // optional for better UX
import { TESTING_API_URL, PROD_API_URL } from "../utils/api";

const API_URL = PROD_API_URL
  ? `${PROD_API_URL}/users`
  : `${TESTING_API_URL}/users`;

const Settings = () => {
  const { id } = useParams(); // grab user ID from route
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    role: "",
  });
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  // Fetch user data on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${API_URL}/${user?.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data.data);
        setLoading(false);
      } catch (err) {
        toast.error("Failed to fetch user");
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  // Handle input change
  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  // Handle submit (update user)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`/api/users/${id}`, profile);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error("Update failed");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Profile Settings</h2>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded shadow space-y-4"
      >
        <input
          type="text"
          name="name"
          value={profile.name}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          placeholder="Name"
        />
        <input
          type="email"
          name="email"
          value={profile.email}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          placeholder="Email"
        />
        <select
          name="role"
          value={profile.role}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          <option value="">Select Role</option>
          <option value="Admin">Admin</option>
          <option value="HR">HR</option>
          <option value="Manager">Manager</option>
          <option value="Employee">Employee</option>
        </select>
        <button className="bg-blue-500 text-white px-4 py-2 rounded">
          Update Profile
        </button>
      </form>
    </div>
  );
};

export default Settings;

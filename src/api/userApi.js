import axios from "axios";
import { TESTING_API_URL, PROD_API_URL } from "../utils/api";

const API_BASE_URL = PROD_API_URL || TESTING_API_URL; // For Production

const token = localStorage.getItem("token");

const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};

// ✅ Get all Admins
export const getAllAdmins = async () => {
  return await axios.get(`${API_BASE_URL}/role/admins`, { headers });
};
// ✅ Get all Manager
export const getAllManagers = async () => {
  return await axios.get(`${API_BASE_URL}/role/managers`, { headers });
};
// ✅ Get all HR
export const getAllHR = async () => {
  return await axios.get(`${API_BASE_URL}/role/hrs`, { headers });
};
// ✅ Get all Employee
export const getAllEmployee = async () => {
  return await axios.get(`${API_BASE_URL}/role/employees`, { headers });
};

// ✅ Create user
export const createUser = async (userData) => {
  return await axios.post(`${API_BASE_URL}/auth/register`, userData, {
    headers,
  });
};

// ✅ Update user
export const updateUser = async (userId, updatedData) => {
  return await axios.put(`${API_BASE_URL}/users/${userId}`, updatedData, {
    headers,
  });
};

// ✅ Delete user
export const deleteUser = async (userId) => {
  return await axios.delete(`${API_BASE_URL}/users/${userId}`, { headers });
};

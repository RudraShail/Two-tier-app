// components/UserForm.js
import { useState, useEffect } from "react";
import { FaUserPlus } from "react-icons/fa";
import { createUser, updateUser } from "../api/userApi";

const UserForm = ({
  currentUser,
  editingUser,
  setEditingUser,
  fetchUsersData,
}) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    admin: "",
    manager: "",
    hr: "",
  });

  useEffect(() => {
    if (editingUser) {
      setForm({
        name: editingUser.name,
        email: editingUser.email,
        password: "",
        role: editingUser.role,
        admin: editingUser.admin || "",
        manager: editingUser.manager || "",
        hr: editingUser.hr || "",
      });
    } else {
      setForm({
        name: "",
        email: "",
        password: "",
        role: "",
        admin: "",
        manager: "",
        hr: "",
      });
    }
  }, [editingUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const role = form.role;

    const userData = {
      ...form,
      ...(role === "Admin" && {
        admin: currentUser?.admin?.id || currentUser?.id,
      }),
      ...(role === "Manager" && {
        admin: currentUser?.id,
        manager: currentUser?.id,
      }),
      ...(role === "HR" && {
        admin:
          currentUser?.admin?.id || currentUser?.manager?.id || currentUser?.id,
        manager: currentUser?.manager?.id || currentUser?.id,
        hr: currentUser?.id,
      }),
      ...(role === "Employee" && {
        admin: currentUser?.admin?.id,
        manager: currentUser?.manager?.id,
        hr: currentUser?.id,
      }),
    };

    const allowedFields = {
      Admin: ["name", "email", "password", "role", "admin"],
      Manager: ["name", "email", "password", "role", "admin", "manager"],
      HR: ["name", "email", "password", "role", "admin", "manager", "hr"],
      Employee: ["name", "email", "password", "role", "admin", "manager", "hr"],
    }[role];

    Object.keys(userData).forEach((key) => {
      if (!allowedFields.includes(key) || userData[key] === "") {
        delete userData[key];
      }
    });

    if (editingUser) {
      await updateUser(editingUser._id, userData);
    } else {
      await createUser(userData);
    }

    setEditingUser(null);
    fetchUsersData();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-white p-4 shadow rounded border border-blue-100"
    >
      <h2 className="text-2xl font-semibold flex gap-2 items-center text-blue-600">
        <FaUserPlus />
        {editingUser ? "Edit User" : "Add New User"}
      </h2>
      <input
        className="w-full border p-2 rounded"
        placeholder="Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <input
        className="w-full border p-2 rounded"
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <input
        type="password"
        className="w-full border p-2 rounded"
        placeholder="Password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />
      <select
        className="w-full border p-2 rounded"
        value={form.role}
        onChange={(e) => setForm({ ...form, role: e.target.value })}
      >
        <option value="">Select Role</option>
        {currentUser?.role === "SuperAdmin" && (
          <option value="Admin">Admin</option>
        )}
        {currentUser?.role === "Admin" && (
          <option value="Manager">Manager</option>
        )}
        {currentUser?.role === "Manager" && <option value="HR">HR</option>}
        {currentUser?.role === "HR" && (
          <option value="Employee">Employee</option>
        )}
      </select>

      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full">
        {editingUser ? "Update User" : "Create User"}
      </button>
    </form>
  );
};

export default UserForm;

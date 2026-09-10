import { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaUserPlus } from "react-icons/fa";
import { createUser, updateUser } from "../api/userApi";
import axios from "axios";
import UserHierarchy from "./UserHierarchy ";
import { TESTING_API_URL, PROD_API_URL } from "../utils/api";

const API_URL = PROD_API_URL ? `${PROD_API_URL}` : `${TESTING_API_URL}`;

const Users = () => {
  const [setUsers] = useState([]);
  const [setHierarchy] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    admin: "",
    manager: "",
    hr: "",
  });

  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("user"));

  const fetchUsersData = async () => {
    try {
      const url = `${API_URL}/users/subordinates`;
      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setHierarchy(res.data.data.hierarchy);
      setUsers(res.data.data);
    } catch (err) {
      console.error("Error fetching user by ID:", err);
    }
  };

  useEffect(() => {
    fetchUsersData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const role = form.role;

    const userData = {
      ...form,

      ...(role === "Admin" && {
        admin: currentUser?.admin?.id || currentUser?.id,
      }),

      ...(role === "Manager" && {
        admin: currentUser?.id,
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

    // ✅ Remove unnecessary fields (manager/hr) if not needed
    const allowedFields = {
      Admin: ["name", "email", "password", "role", "admin"],
      Manager: ["name", "email", "password", "role", "admin"],
      HR: ["name", "email", "password", "role", "admin", "manager"],
      Employee: ["name", "email", "password", "role", "admin", "manager", "hr"],
    }[role];

    Object.keys(userData).forEach((key) => {
      if (
        !allowedFields.includes(key) ||
        userData[key] === "" ||
        userData[key] === undefined ||
        userData[key] === null
      ) {
        delete userData[key];
      }
    });

    console.log(userData);

    if (editingUser) {
      await updateUser(editingUser._id, userData);
    } else {
      await createUser(userData);
    }

    setForm({
      name: "",
      email: "",
      password: "",
      role: "",
      admin: "",
      manager: "",
      hr: "",
    });
    alert("Registration Successfull !!!");
    setEditingUser(null);
    fetchUsersData();
    setLoading(false);
  };

  const getCreateText = (role) => {
    switch (role.toLowerCase()) {
      case "SuperAdmin":
        return "Create Admin";
      case "admin":
        return "Create Manager";
      case "manager":
        return "Create HR";
      case "hr":
        return "Create Employee";
      default:
        return "Manage Team";
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-3xl font-bold text-blue-700 mb-4 flex items-center gap-2">
        <FaUserPlus /> {getCreateText(currentUser?.role)}
      </h2>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-4 shadow rounded border border-blue-100"
      >
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
          <option value="">Select</option>

          {currentUser?.role === "SuperAdmin" && (
            <>
              <option value="Admin">Admin</option>
            </>
          )}

          {currentUser?.role === "Admin" && (
            <>
              <option value="Manager">Manager</option>
            </>
          )}

          {currentUser?.role === "Manager" && (
            <>
              <option value="HR">HR</option>
            </>
          )}

          {currentUser?.role === "HR" && (
            <>
              <option value="Employee">Employee</option>
            </>
          )}
        </select>

        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full flex justify-center items-center gap-2"
          disabled={loading}
        >
          {loading ? (
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              ></path>
            </svg>
          ) : (
            <>
              {editingUser
                ? `Update ${getCreateText(currentUser?.role)}`
                : `${getCreateText(currentUser?.role)}`}
            </>
          )}
        </button>
      </form>

      {/* <div className="mt-8">
        {currentUser?.role !== "SuperAdmin" ? (
          <table className="w-full bg-white shadow rounded overflow-hidden text-sm">
            <thead className="bg-blue-100 text-blue-800">
              <tr>
                <th className="p-2 text-left">ID</th>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Role</th>
                <th className="p-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users ? (
                <>
                  {users.admin && (
                    <tr
                      key={users.admin._id}
                      className="border-b bg-yellow-100 hover:bg-yellow-200"
                    >
                      <td className="p-2">{users.admin._id}</td>
                      <td className="p-2">{users.admin.name}</td>
                      <td className="p-2">{users.admin.email}</td>
                      <td className="p-2 capitalize">{users.admin.role}</td>
                      <td className="p-2 text-center space-x-2">
                        <button
                          onClick={() => handleEdit(users.admin)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(users.admin._id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  )}

                  {users.managers?.map((u) => (
                    <tr
                      key={u._id}
                      className="border-b bg-blue-100 hover:bg-blue-200"
                    >
                      <td className="p-2">{u._id}</td>
                      <td className="p-2">{u.name}</td>
                      <td className="p-2">{u.email}</td>
                      <td className="p-2 capitalize">{u.role}</td>
                      <td className="p-2 text-center space-x-2">
                        <button
                          onClick={() => handleEdit(u)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(u._id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {users.hrs?.map((u) => (
                    <tr
                      key={u._id}
                      className="border-b bg-green-100 hover:bg-green-200"
                    >
                      <td className="p-2">{u._id}</td>
                      <td className="p-2">{u.name}</td>
                      <td className="p-2">{u.email}</td>
                      <td className="p-2 capitalize">{u.role}</td>
                      <td className="p-2 text-center space-x-2">
                        <button
                          onClick={() => handleEdit(u)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(u._id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {users.employees?.map((u) => (
                    <tr
                      key={u._id}
                      className="border-b bg-white hover:bg-gray-50"
                    >
                      <td className="p-2">{u._id}</td>
                      <td className="p-2">{u.name}</td>
                      <td className="p-2">{u.email}</td>
                      <td className="p-2 capitalize">{u.role}</td>
                      <td className="p-2 text-center space-x-2">
                        <button
                          onClick={() => handleEdit(u)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(u._id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </>
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-gray-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <div className="bg-red-200">
            <UserHierarchy hierarchy={hierarchy} />
          </div>
        )}
      </div> */}
    </div>
  );
};

export default Users;

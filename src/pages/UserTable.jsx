// components/UserTable.js
import { FaEdit, FaTrash } from "react-icons/fa";
import UserHierarchy from "./UserHierarchy ";

const UserTable = ({
  currentUser,
  users,
  setEditingUser,
  handleDelete,
  hierarchy,
}) => {
  return (
    <>
      {currentUser?.role !== "SuperAdmin" ? (
        <table className="w-full bg-white shadow rounded overflow-hidden text-sm mt-8">
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
            {/* Admin */}
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
                    onClick={() => setEditingUser(users.admin)}
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

            {/* Managers */}
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
                    onClick={() => setEditingUser(u)}
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

            {/* HRs */}
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
                    onClick={() => setEditingUser(u)}
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

            {/* Employees */}
            {users.employees?.map((u) => (
              <tr key={u._id} className="border-b hover:bg-gray-100">
                <td className="p-2">{u._id}</td>
                <td className="p-2">{u.name}</td>
                <td className="p-2">{u.email}</td>
                <td className="p-2 capitalize">{u.role}</td>
                <td className="p-2 text-center space-x-2">
                  <button
                    onClick={() => setEditingUser(u)}
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
          </tbody>
        </table>
      ) : (
        <div className="mt-4 bg-red-200 rounded">
          <UserHierarchy hierarchy={hierarchy} />
        </div>
      )}
    </>
  );
};

export default UserTable;

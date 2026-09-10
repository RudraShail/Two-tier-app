import { useState } from "react";
import {
  FaUserShield,
  FaUserTie,
  FaUserCog,
  FaUser,
  FaChevronDown,
  FaChevronRight,
  FaSearch,
} from "react-icons/fa";

const UserHierarchy = ({ hierarchy = [] }) => {
  const [expandedAdmins, setExpandedAdmins] = useState({});
  const [expandedManagers, setExpandedManagers] = useState({});
  const [expandedHRs, setExpandedHRs] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  const toggleAdmin = (id) =>
    setExpandedAdmins((prev) => ({ ...prev, [id]: !prev[id] }));
  const toggleManager = (id) =>
    setExpandedManagers((prev) => ({ ...prev, [id]: !prev[id] }));
  const toggleHR = (id) =>
    setExpandedHRs((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleVerify = async (userId) => {
    try {
      const response = await fetch(`/api/users/${userId}/verify-otp`, {
        method: "PATCH",
      });
      const data = await response.json();

      if (data.success) {
        alert("User verified successfully!");
        window.location.reload();
      } else {
        alert("Verification failed: " + data.message);
      }
    } catch (error) {
      alert("An error occurred while verifying the user.");
      console.error(error);
    }
  };

  const renderOTPInfo = (user) => (
    console.log(user),
    (
      <div className="ml-10 text-sm text-gray-600 bg-gray-100 p-3 rounded shadow-sm w-fit">
        <div>
          <span className="font-medium">Verified:</span>{" "}
          <span
            className={`font-bold ${
              user.isVerified ? "text-green-600" : "text-red-500"
            }`}
          >
            {user.isVerified ? "Yes" : "No"}
          </span>
        </div>
        {!user.isVerified && (
          <button
            onClick={() => handleVerify(user._id)}
            className="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Verify OTP
          </button>
        )}
      </div>
    )
  );

  const filterHierarchy = (data) => {
    return data
      .map((admin) => {
        const filteredManagers = admin.managers
          ?.map((manager) => {
            const filteredHRs = manager.hrs
              ?.map((hr) => {
                const filteredEmployees = hr.employees?.filter((emp) =>
                  `${emp.name} ${emp.email}`
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
                );
                if (
                  `${hr.name} ${hr.email}`
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                  filteredEmployees.length
                ) {
                  return { ...hr, employees: filteredEmployees };
                }
                return null;
              })
              .filter(Boolean);

            if (
              `${manager.name} ${manager.email}`
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
              filteredHRs.length
            ) {
              return { ...manager, hrs: filteredHRs };
            }
            return null;
          })
          .filter(Boolean);

        if (
          `${admin.name} ${admin.email}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          filteredManagers.length
        ) {
          return { ...admin, managers: filteredManagers };
        }

        return null;
      })
      .filter(Boolean);
  };

  const filteredHierarchy = filterHierarchy(hierarchy);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-blue-700 mb-4">User Hierarchy</h1>

      <div className="flex items-center border rounded px-3 mb-6 shadow w-full max-w-md">
        <FaSearch className="text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 outline-none"
        />
      </div>

      <div className="space-y-4">
        {filteredHierarchy.length > 0 ? (
          filteredHierarchy.map((admin) => (
            <div
              key={admin._id}
              className="border border-blue-200 rounded-lg shadow bg-white"
            >
              <div
                className="cursor-pointer flex items-center justify-between p-4 bg-blue-50"
                onClick={() => toggleAdmin(admin._id)}
              >
                <div className="flex items-center gap-2 text-blue-700 font-semibold text-lg">
                  <FaUserShield />
                  <span>{admin.name}</span>
                  <span className="text-sm text-gray-500">({admin.email})</span>
                </div>
                {expandedAdmins[admin._id] ? (
                  <FaChevronDown />
                ) : (
                  <FaChevronRight />
                )}
              </div>
              {renderOTPInfo(admin)}

              {expandedAdmins[admin._id] &&
                admin.managers?.map((manager) => (
                  <div
                    key={manager._id}
                    className="ml-6 border-l-4 border-blue-200"
                  >
                    <div
                      className="cursor-pointer flex items-center justify-between p-3 bg-green-50"
                      onClick={() => toggleManager(manager._id)}
                    >
                      <div className="flex items-center gap-2 text-green-700 font-semibold">
                        <FaUserTie />
                        <span>{manager.name}</span>
                        <span className="text-sm text-gray-500">
                          ({manager.email})
                        </span>
                      </div>
                      {expandedManagers[manager._id] ? (
                        <FaChevronDown />
                      ) : (
                        <FaChevronRight />
                      )}
                    </div>
                    {renderOTPInfo(manager)}

                    {expandedManagers[manager._id] &&
                      manager.hrs?.map((hr) => (
                        <div
                          key={hr._id}
                          className="ml-6 border-l-4 border-green-200"
                        >
                          <div
                            className="cursor-pointer flex items-center justify-between p-3 bg-yellow-50"
                            onClick={() => toggleHR(hr._id)}
                          >
                            <div className="flex items-center gap-2 text-yellow-700 font-medium">
                              <FaUserCog />
                              <span>{hr.name}</span>
                              <span className="text-sm text-gray-500">
                                ({hr.email})
                              </span>
                            </div>
                            {expandedHRs[hr._id] ? (
                              <FaChevronDown />
                            ) : (
                              <FaChevronRight />
                            )}
                          </div>
                          {renderOTPInfo(hr)}

                          {expandedHRs[hr._id] &&
                            hr.employees?.map((emp) => (
                              <div
                                key={emp._id}
                                className="ml-6 flex items-center gap-2 p-2 bg-gray-50 text-gray-700 border-l-4 border-yellow-100"
                              >
                                <FaUser />
                                <span>{emp.name}</span>
                                <span className="text-sm text-gray-500">
                                  ({emp.email})
                                </span>
                                {renderOTPInfo(emp)}
                              </div>
                            ))}
                        </div>
                      ))}
                  </div>
                ))}
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 mt-10">No users found.</div>
        )}
      </div>
    </div>
  );
};

export default UserHierarchy;

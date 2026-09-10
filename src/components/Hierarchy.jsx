import React, { useState } from "react";
import { FaUserTie, FaUserCog, FaUserShield, FaUser } from "react-icons/fa";

const HierarchyCard = ({ tenantHierarchy }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-md mt-6">
      <h2 className="text-xl font-bold mb-4 text-indigo-600 flex items-center gap-2">
        🏢 Tenant Hierarchy Overview
      </h2>

      {tenantHierarchy.length === 0 ? (
        <p className="text-gray-500 italic">No hierarchy data available.</p>
      ) : (
        <div className="space-y-4">
          {tenantHierarchy.map((admin, index) => (
            <AdminCard key={index} admin={admin} />
          ))}
        </div>
      )}
    </div>
  );
};

const AdminCard = ({ admin }) => {
  const [showManagers, setShowManagers] = useState(false);

  return (
    <div className="border-l-4 border-indigo-500 pl-4 py-2">
      <div
        className="cursor-pointer font-semibold text-indigo-700 flex items-center justify-between"
        onClick={() => setShowManagers(!showManagers)}
      >
        <span className="flex items-center gap-2">
          <FaUserTie /> 👤 Admin: {admin.name} ({admin.email})
        </span>
        <span>{showManagers ? "🔼" : "🔽"}</span>
      </div>

      {showManagers &&
        admin.managers?.map((manager, i) => (
          <ManagerCard key={i} manager={manager} />
        ))}
    </div>
  );
};

const ManagerCard = ({ manager }) => {
  const [showHRs, setShowHRs] = useState(false);

  return (
    <div className="ml-6 border-l-4 border-purple-400 pl-4 mt-2">
      <div
        className="cursor-pointer text-purple-700 font-medium flex items-center justify-between"
        onClick={() => setShowHRs(!showHRs)}
      >
        <span className="flex items-center gap-2">
          <FaUserCog /> 🧑‍💼 Manager: {manager.name} ({manager.email})
        </span>
        <span>{showHRs ? "🔼" : "🔽"}</span>
      </div>

      {showHRs && manager.hrs?.map((hr, i) => <HRCard key={i} hr={hr} />)}
    </div>
  );
};

const HRCard = ({ hr }) => {
  const [showEmployees, setShowEmployees] = useState(false);

  return (
    <div className="ml-6 border-l-4 border-pink-400 pl-4 mt-2">
      <div
        className="cursor-pointer text-pink-700 font-medium flex items-center justify-between"
        onClick={() => setShowEmployees(!showEmployees)}
      >
        <span className="flex items-center gap-2">
          <FaUserShield /> 🤝 HR: {hr.name} ({hr.email})
        </span>
        <span>{showEmployees ? "🔼" : "🔽"}</span>
      </div>

      {showEmployees && (
        <ul className="ml-6 mt-2 space-y-1 text-gray-700 text-sm">
          {hr.employees.map((emp, i) => (
            <li key={i} className="flex items-center gap-2">
              <FaUser className="text-gray-500" /> 👨‍💻 Employee: {emp.name} (
              {emp.email})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default HierarchyCard;

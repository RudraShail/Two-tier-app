import React from "react";
import SuperAdminDashboard from "./Dashboard/SuperAdminDashboard";
import AdminDashboard from "./Dashboard/AdminDashboard";
import ManagerDashboard from "./Dashboard/ManagerDashboard";
import HRDashboard from "./Dashboard/HRDashboard";
import EmployeeDashboard from "./Dashboard/EmployeeDashboard";

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    return <div>Please log in to view your dashboard.</div>;
  }

  const { role } = user;

  const renderDashboard = () => {
    switch (role) {
      case "SuperAdmin":
        return <SuperAdminDashboard />;
      case "Admin":
        return <AdminDashboard />;
      case "Manager":
        return <ManagerDashboard />;
      case "HR":
        return <HRDashboard />;
      case "Employee":
        return <EmployeeDashboard />;
      //
      default:
        return <div>Unauthorized role. Please contact support.</div>;
    }
  };

  return (
    <div>
      {/* <h2>Welcome, {role.charAt(0).toUpperCase() + role.slice(1)}</h2> */}
      {renderDashboard()}
    </div>
  );
};

export default Dashboard;

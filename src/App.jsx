import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";

import Dashboard from "./pages/Dashboard";
import Attendance from "./pages/Attendance";
import Breaks from "./pages/Breaks";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import PrivateRoute from "./utils/PrivateRoute";
import Hierarchy from "./pages/Hierarchy";
import AdminRegistration from "./pages/AdminRegistration";

import { useAuth } from "./context/AuthContext";
import LeavePage from "./pages/LeavePage";
import LeaveApprovalPage from "./pages/LeaveApprovalPage";
import ForgotResetPassword from "./pages/ForgotResetPassword";
import TeamAttendance from "./pages/TeamAttendance";
import LandingPage from "./pages/LandingPage";

const App = () => {
  const { token } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Router>
      {token ? (
        <div className="flex h-screen overflow-hidden">
          {/* Desktop Sidebar */}

          {/* Desktop Sidebar */}
          <aside className="hidden md:flex w-64 bg-white shadow-lg flex-col">
            <Sidebar />
          </aside>

          {/* Mobile Sidebar */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-50 flex md:hidden">
              {/* Backdrop */}
              <div
                className="fixed inset-0 bg-black bg-opacity-50"
                onClick={() => setSidebarOpen(false)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Escape" && setSidebarOpen(false)}
              />
              {/* Sidebar panel */}
              <aside className="relative w-64 bg-white shadow-lg z-50 flex flex-col overflow-y-auto">
                <Sidebar closeSidebar={() => setSidebarOpen(false)} />
              </aside>
            </div>
          )}

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="h-16 bg-white shadow-md">
              <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
            </div>
            <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
              <Routes>
                <Route
                  path="/"
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/attendance"
                  element={
                    <PrivateRoute>
                      <Attendance />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/team-attendance"
                  element={
                    <PrivateRoute>
                      <TeamAttendance />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/breaks"
                  element={
                    <PrivateRoute>
                      <Breaks />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/users"
                  element={
                    <PrivateRoute>
                      <Users />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/hierarchy"
                  element={
                    <PrivateRoute>
                      <Hierarchy />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/admin-registration"
                  element={
                    <PrivateRoute>
                      <AdminRegistration />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/manager-registration"
                  element={
                    <PrivateRoute>
                      <Users />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/hr-registration"
                  element={
                    <PrivateRoute>
                      <Users />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/employee-registration"
                  element={
                    <PrivateRoute>
                      <Users />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/leaves"
                  element={
                    <PrivateRoute>
                      <LeavePage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/leave-approval"
                  element={
                    <PrivateRoute>
                      <LeaveApprovalPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/update-password"
                  element={
                    <PrivateRoute>
                      <Settings />
                    </PrivateRoute>
                  }
                />

                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
          </div>
        </div>
      ) : (
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotResetPassword />} />
          <Route
            path="/reset-password/:token"
            element={<ForgotResetPassword />}
          />
          <Route path="/admin-registration" element={<AdminRegistration />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      )}
    </Router>
  );
};

export default App;

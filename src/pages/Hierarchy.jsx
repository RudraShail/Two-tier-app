import axios from "axios";
import { useEffect, useState, useRef } from "react";
import {
  FaUserShield,
  FaUserTie,
  FaUserCog,
  FaUser,
  FaChevronDown,
  FaChevronRight,
  FaCrown,
  FaChalkboardTeacher,
  FaUsersCog,
  FaUserFriends,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { TESTING_API_URL, PROD_API_URL } from "../utils/api";

const API_URL = PROD_API_URL
  ? `${PROD_API_URL}/users`
  : `${TESTING_API_URL}/users`;

const VERIFY_API_URL = PROD_API_URL
  ? `${PROD_API_URL}/auth`
  : `${TESTING_API_URL}/auth`;

const Hierarchy = () => {
  const [expanded, setExpanded] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [hierarchi, setHierarchi] = useState([]);
  const [roleFilter, setRoleFilter] = useState("All");
  const token = localStorage.getItem("token");

  const exportRef = useRef();

  const fetchUsersData = async () => {
    try {
      const res = await axios.get(`${API_URL}/subordinates`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHierarchi(res.data.data.hierarchy || []);
    } catch (err) {
      console.error("Error fetching user hierarchy:", err);
    }
  };

  useEffect(() => {
    fetchUsersData();
  }, []);

  const toggle = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  // const handleVerifyOtp = async (user) => {
  //   setLoadingId(user._id);
  //   try {
  //     await axios.post(
  //       `${VERIFY_API_URL}/verify-otp`,
  //       { email: user.email, otp: user.otp },
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );
  //     toast.success("OTP Verified Successfully");
  //     fetchUsersData();
  //   } catch (err) {
  //     toast.error("OTP verification failed", err);
  //   } finally {
  //     setLoadingId(null);
  //   }
  // };

  const getRoleBadge = (role) => {
    const roleStyles = {
      SuperAdmin: {
        color: "bg-purple-600",
        icon: <FaCrown className="mr-1" />,
      },
      Admin: {
        color: "bg-blue-600",
        icon: <FaUserShield className="mr-1" />,
      },
      Manager: {
        color: "bg-green-600",
        icon: <FaUserTie className="mr-1" />,
      },
      HR: {
        color: "bg-yellow-600",
        icon: <FaUserCog className="mr-1" />,
      },
      Employee: {
        color: "bg-gray-600",
        icon: <FaUser className="mr-1" />,
      },
    };

    const roleStyle = roleStyles[role] || {
      color: "bg-gray-600",
      icon: <FaUser className="mr-1" />,
    };

    return (
      <div className="flex items-center gap-2 ml-3">
        {/* Role badge */}
        <span
          className={`flex items-center text-white text-xs px-2 py-1 rounded-full ${roleStyle.color}`}
        >
          {roleStyle.icon}
          {role}
        </span>
      </div>
    );
  };

  const renderOTPInfo = (user) => {
    if (user.role === "SuperAdmin" || !user.otp) return null;

    const otpDigits = user.otp?.toString().padStart(6, "0").split("");

    return (
      <div className="ml-10 mb-4 p-1 bg-gray-100 rounded shadow grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        {/* OTP Display */}
        <div className="flex gap-2">
          {otpDigits.map((digit, index) => (
            <div
              key={index}
              className={`w-7 h-7 flex items-center justify-center border text-lg font-semibold rounded shadow ${
                user.isVerified
                  ? "border-green-500 bg-green-100 text-green-700"
                  : "border-red-400 bg-red-50 text-red-600"
              }`}
            >
              {digit}
            </div>
          ))}
        </div>

        {/* Verify Button */}
        {/* {!user.isVerified && (
          <div className="text-right">
            <button
              onClick={() => {
                console.log("Verifying OTP for:", user.email);
                console.log("OTP:", user.otp);
                handleVerifyOtp(user);
              }}
              disabled={loadingId === user._id}
              className="bg-blue-600 hover:bg-blue-700 text-white px-7 py-2 rounded shadow disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              {loadingId === user._id && (
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              )}
              <span>Verify OTP</span>
            </button>
          </div>
        )} */}
      </div>
    );
  };

  const filterHierarchy = (data) =>
    data
      .map((admin) => {
        if (
          roleFilter !== "All" &&
          admin.role !== roleFilter &&
          !admin.managers?.some((m) => m.role === roleFilter)
        )
          return null;
        const filteredManagers = admin.managers
          ?.map((manager) => {
            if (
              roleFilter !== "All" &&
              manager.role !== roleFilter &&
              !manager.hrs?.some((h) => h.role === roleFilter)
            )
              return null;
            const filteredHRs = manager.hrs
              ?.map((hr) => {
                if (
                  roleFilter !== "All" &&
                  hr.role !== roleFilter &&
                  !hr.employees?.some((e) => e.role === roleFilter)
                )
                  return null;
                const filteredEmployees = hr.employees?.filter((emp) => {
                  const searchMatch = `${emp.name} ${emp.email}`
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase());
                  return (
                    searchMatch &&
                    (roleFilter === "All" || emp.role === roleFilter)
                  );
                });
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

  const filteredHierarchy = filterHierarchy(
    Array.isArray(hierarchi) ? hierarchi : [hierarchi]
  );

  const getCounts = () => {
    let admin = 0,
      manager = 0,
      hr = 0,
      employee = 0;
    filteredHierarchy.forEach((a) => {
      admin++;
      a.managers?.forEach((m) => {
        manager++;
        m.hrs?.forEach((h) => {
          hr++;
          employee += h.employees?.length || 0;
        });
      });
    });
    return { admin, manager, hr, employee };
  };

  const { admin, manager, hr, employee } = getCounts();

  return (
    <div className="p-6">
      <ToastContainer />

      <div className="mb-4 bg-gray-100 p-3 rounded shadow text-sm text-center">
        <span className="inline-flex items-center gap-1 mr-10 font-bold">
          <FaCrown className="text-purple-700" size={35} /> Admins: {admin}
        </span>
        <span className="inline-flex items-center gap-1 mr-10 font-bold">
          <FaChalkboardTeacher className="text-green-700" size={35} /> Managers:{" "}
          {manager}
        </span>
        <span className="inline-flex items-center gap-1 mr-10 font-bold">
          <FaUsersCog className="text-yellow-600" size={35} /> HRs: {hr}
        </span>
        <span className="inline-flex items-center gap-1 font-bold">
          <FaUserFriends className="text-gray-700" size={35} /> Employees:{" "}
          {employee}
        </span>
      </div>

      <div ref={exportRef} className="space-y-4 print-section ">
        {filteredHierarchy.length > 0 ? (
          filteredHierarchy.map((admin) => (
            <div
              key={admin._id}
              className="border border-blue-200 rounded-lg shadow-xl bg-white"
            >
              <div
                className={`cursor-pointer flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 transition ${
                  admin.isVerified
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
                onClick={() => toggle(admin._id)}
              >
                <div className="flex items-center gap-2 text-blue-700 font-semibold text-lg">
                  {/* <FaUserShield /> */}
                  {getRoleBadge("Admin", admin.isVerified)}
                  <span>{admin.name}</span>
                  <span className="text-sm text-gray-500">({admin.email})</span>
                </div>
                {expanded[admin._id] ? <FaChevronDown /> : <FaChevronRight />}
              </div>
              {renderOTPInfo(admin)}
              {expanded[admin._id] &&
                admin.managers?.map((manager) => (
                  <div
                    key={manager._id}
                    className="ml-20 border-l-4 border-blue-200"
                  >
                    <div
                      className={`cursor-pointer flex items-center mt-2 mb-3 justify-between p-4 bg-blue-50 hover:bg-blue-100 transition ${
                        manager.isVerified
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                      onClick={() => toggle(manager._id)}
                    >
                      <div className="flex items-center gap-2 text-green-700 font-semibold">
                        {getRoleBadge("Manager", manager.isVerified)}
                        <span>{manager.name}</span>
                        <span className="text-sm text-gray-500">
                          ({manager.email})
                        </span>
                      </div>
                      {expanded[manager._id] ? (
                        <FaChevronDown />
                      ) : (
                        <FaChevronRight />
                      )}
                    </div>
                    {renderOTPInfo(manager)}
                    {expanded[manager._id] &&
                      manager.hrs?.map((hr) => (
                        <div
                          key={hr._id}
                          className="ml-20 border-l-4 border-green-200"
                        >
                          <div
                            className={`cursor-pointer flex items-center mb-3 justify-between p-4 bg-blue-50 hover:bg-blue-100 transition ${
                              hr.isVerified
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                            onClick={() => toggle(hr._id)}
                          >
                            <div className="flex items-center gap-2 text-yellow-700 font-medium">
                              {getRoleBadge("HR", hr.isVerified)}
                              <span>{hr.name}</span>
                              <span className="text-sm text-gray-500">
                                ({hr.email})
                              </span>
                            </div>
                            {expanded[hr._id] ? (
                              <FaChevronDown />
                            ) : (
                              <FaChevronRight />
                            )}
                          </div>

                          {renderOTPInfo(hr)}

                          {expanded[hr._id] &&
                            hr.employees?.map((emp) => (
                              <div
                                key={emp._id}
                                className="ml-20 flex items-center gap-2 p-2 bg-cyan-100 mt-2 mb-2 hover:bg-gray-100 transition text-gray-700 border-l-4 border-yellow-100"
                              >
                                {getRoleBadge("Employee", emp.isVerified)}
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

export default Hierarchy;

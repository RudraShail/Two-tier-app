import { useEffect, useState } from "react";
import { FaBars } from "react-icons/fa";

const Topbar = ({ onMenuClick }) => {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const [currentTime, setCurrentTime] = useState("");
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      let hours = now.getHours();
      const mins = String(now.getMinutes()).padStart(2, "0");
      const secs = String(now.getSeconds()).padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12; // Convert 0 -> 12

      setCurrentTime(
        `${String(hours).padStart(2, "0")}:${mins}:${secs} ${ampm}`
      );

      if (now.getHours() < 12) setGreeting("Good Morning");
      else if (now.getHours() < 18) setGreeting("Good Afternoon");
      else setGreeting("Good Evening");
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="flex justify-between items-center px-6 py-3 shadow bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 text-white">
      <button
        onClick={onMenuClick}
        className="md:hidden p-2 rounded hover:bg-white hover:bg-opacity-20 transition"
        aria-label="Toggle menu"
      >
        <FaBars className="w-6 h-6" />
      </button>
      {/* Left: Time */}
      <div className="text-lg font-mono hidden md:block">{currentTime}</div>

      {/* Center: Greeting */}
      <h2 className=" text-lg sm:text-xl font-semibold text-center">
        👋 {greeting}, {user.name || "User"}
      </h2>
    </div>
  );
};

export default Topbar;

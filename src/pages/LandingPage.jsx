// Enhanced and enriched Landing Page with emojis and icons without Lottie
import React, { useState } from "react";
import {
  FaUserShield,
  FaEnvelope,
  FaUsers,
  FaClock,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaCodeBranch,
  FaMobileAlt,
  FaDatabase,
  FaRocket,
  FaSignInAlt,
  FaStar,
  FaQuoteLeft,
  FaQuoteRight,
  FaUser,
  FaUserCog,
  FaUserTie,
  FaTools,
  FaClipboardCheck,
  FaLaptopCode,
  FaComments,
  FaKey,
  FaServer,
} from "react-icons/fa";
import { motion } from "framer-motion";
import pic1 from "../assets/login.png";
import pic2 from "../assets/dashboard.png";
import pic3 from "../assets/otp.png";
import pic4 from "../assets/hierarchy.png";
import pic5 from "../assets/leave-approval.png";
import pic6 from "../assets/leave.png";
import pic7 from "../assets/manager.png";
import pic8 from "../assets/team-attendance.png";
import axios from "axios";
import { PROD_API_URL, TESTING_API_URL } from "../utils/api";

const screenshots = [pic1, pic2, pic3, pic4, pic5, pic6, pic7, pic8];

const keyFeatures = [
  {
    icon: <FaUserShield className="text-yellow-400 text-4xl mb-4" />,
    title: "Role-Based Access",
    description:
      "Manage multi-level hierarchy with roles like Admin, Manager, HR, Employee.",
  },
  {
    icon: <FaClock className="text-green-400 text-4xl mb-4" />,
    title: "Smart Time Tracking",
    description:
      "Live clock-in/out, track working hours, breaks & geo-location.",
  },
  {
    icon: <FaCheckCircle className="text-pink-400 text-4xl mb-4" />,
    title: "Secure Auth",
    description: "JWT login, OTP verification, and password reset flow.",
  },
  {
    icon: <FaCodeBranch className="text-indigo-400 text-4xl mb-4" />,
    title: "Real-Time Hierarchy",
    description:
      "Interactive view of reporting structure & filtered role-wise access.",
  },
  {
    icon: <FaMobileAlt className="text-blue-400 text-4xl mb-4" />,
    title: "Mobile-First UI",
    description: "Optimized layout for mobile, tablet & desktop.",
  },
  {
    icon: <FaDatabase className="text-orange-400 text-4xl mb-4" />,
    title: "MongoDB Powered",
    description:
      "Robust NoSQL data modeling using references, population & indexing.",
  },
  {
    icon: <FaRocket className="text-red-400 text-4xl mb-4" />,
    title: "Performance First",
    description: "Clean reusable components, code splitting & lazy loading.",
  },
  {
    icon: <FaClipboardCheck className="text-purple-400 text-4xl mb-4" />,
    title: "Leave Management",
    description: "Apply, approve and track leaves in real time.",
  },
  {
    icon: <FaLaptopCode className="text-cyan-400 text-4xl mb-4" />,
    title: "Developer Friendly",
    description: "Built with React, Tailwind CSS, Express.js and MongoDB.",
  },
];

const testimonials = [
  {
    name: "Rohit Mehra",
    role: "HR Manager at TechWaves",
    quote:
      "The most intuitive and reliable attendance system we've used. The live tracking and role access features are game-changers!",
  },
  {
    name: "Sneha Kapoor",
    role: "Project Manager at DevNest",
    quote:
      "Our team collaboration improved drastically thanks to the visual hierarchy and instant clock-in insights. Highly recommended!",
  },
  {
    name: "Anuj Verma",
    role: "Founder at SoftCore Solutions",
    quote:
      "A robust backend and beautiful frontend. Hats off to the developer. The UI/UX is simply delightful.",
  },
];

const roles = [
  {
    Icon: FaUserShield,
    title: "Admin",
    desc: "🛠️ Creates Managers • 👁️ Views All Users (Managers, HRs, Employees) • 📊 Full Access to Attendance, Breaks & Hierarchy",
    color: "text-yellow-400",
  },
  {
    Icon: FaUserTie,
    title: "Manager",
    desc: "📋 Creates HRs • 🧭 Views Assigned HRs & Employees • 🕵️ Monitors Attendance & Breaks • 🗂️ Approves Leaves",
    color: "text-yellow-300",
  },
  {
    Icon: FaUserCog,
    title: "HR",
    desc: "👥 Creates Employees • 📝 Manages Leave Requests • ⏱️ Monitors Attendance Logs • 🧾 Generates Reports",
    color: "text-green-300",
  },
  {
    Icon: FaUser,
    title: "Employee",
    desc: "🕒 Marks Clock-in/out • 🛌 Applies for Leaves • 📅 Views Personal Attendance & Break Records",
    color: "text-pink-400",
  },
];

const API_URL = PROD_API_URL
  ? `${PROD_API_URL}/auth/form-auto-register`
  : `${TESTING_API_URL}/auth/form-auto-register`;

const LandingPage = () => {
  const [form, setForm] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.post(API_URL, form);
      alert("✅ Request sent successfully!");
      setForm({ name: "", email: "" });
    } catch (err) {
      alert("❌ Submission failed. Please try again.", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white font-sans">
      {/* Header */}
      <header className="flex justify-between items-center p-6">
        <h1 className="text-3xl font-extrabold text-yellow-300 tracking-wide uppercase">
          Tech<span className="text-white">-</span>
          <span className="text-pink-500">Dev</span>
        </h1>

        <div className="flex items-center gap-4">
          <a
            href="/login"
            className="flex items-center gap-2 bg-yellow-400 text-blue-900 px-4 py-2 rounded-full hover:bg-yellow-300 font-semibold transition"
          >
            <FaSignInAlt /> Login
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="text-center py-10">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-5xl font-bold"
        >
          🕒 Modern Attendance Monitoring System
        </motion.h1>
        <p className="mt-4 text-lg md:text-xl text-blue-200">
          📱 A smart solution to manage clock-ins, breaks, leaves & hierarchy 🌐
        </p>
      </section>

      {/* Roles Section */}
      <section className="py-16 px-6 md:px-20 text-center bg-blue-950">
        <p className="max-w-4xl mx-auto mb-10 text-blue-200 leading-relaxed text-sm sm:text-base">
          <span className="text-yellow-300 font-medium">🛠️ Admin</span> has
          top-level control and can create
          <span className="text-yellow-200 font-medium"> 📋 Managers</span>,
          view all users, track attendance, manage breaks, and access the entire
          hierarchy.
          <br />
          <span className="text-yellow-200 font-medium">📋 Managers</span> can
          create
          <span className="text-green-300 font-medium"> 👥 HRs</span>, supervise
          their team’s performance, monitor breaks, and approve leaves.
          <br />
          <span className="text-green-300 font-medium">👥 HRs</span> onboard
          <span className="text-pink-300 font-medium"> 📊 Employees</span>,
          manage their records, approve/reject leave requests, and generate
          reports.
          <br />
          <span className="text-pink-300 font-medium">📊 Employees</span> can
          clock in/out, apply for leaves, and view their attendance and breaks
          in real-time.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {roles.map((role, index) => (
            <motion.div
              key={index}
              className="bg-blue-800 p-6 rounded-xl shadow-md hover:bg-blue-700 transition"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
            >
              <div className={`text-5xl mb-3 ${role.color}`}>
                <role.Icon />
              </div>
              <h3 className={`text-xl font-bold mb-1 ${role.color}`}>
                {role.title}
              </h3>
              <p className="text-blue-200 text-sm whitespace-pre-wrap">
                {role.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Key Features */}
      <section className="py-16 px-6 md:px-20">
        <h2 className="text-3xl font-bold text-center mb-10">
          🚀 Key Features
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {keyFeatures.map((feature, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.05 }}
              className="bg-blue-800 p-6 rounded-2xl shadow-xl text-center"
            >
              {feature.icon}
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-blue-100 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Screenshots */}
      <section className="py-16 px-6 md:px-20 bg-blue-950">
        <h2 className="text-3xl font-bold text-center mb-10">
          🖼️ Preview Screens
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {screenshots.map((src, idx) => (
            <motion.div
              key={idx}
              className="bg-white p-2 rounded-xl shadow-md overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <img
                src={src}
                alt={`Screenshot ${idx + 1}`}
                className="w-full h-64 object-cover rounded-lg hover:scale-105 transition-transform duration-300"
              />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-16 px-6 md:px-20 text-center bg-blue-900 text-white">
        <h2 className="text-3xl font-bold mb-6">🧰 Tech Stack Used</h2>
        <p className="text-blue-200 mb-10">
          Built using a powerful combination of modern web technologies to
          deliver performance and scalability.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="bg-blue-800 p-6 rounded-xl shadow-md hover:bg-blue-700 transition">
            <FaLaptopCode className="text-yellow-400 text-4xl mb-4 mx-auto" />
            <h3 className="text-xl font-semibold">React.js</h3>
            <p className="text-sm text-blue-200 mt-2">Frontend UI library</p>
          </div>
          <div className="bg-blue-800 p-6 rounded-xl shadow-md hover:bg-blue-700 transition">
            <FaServer className="text-indigo-400 text-4xl mb-4 mx-auto" />
            <h3 className="text-xl font-semibold">Express.js</h3>
            <p className="text-sm text-blue-200 mt-2">Node.js web framework</p>
          </div>
          <div className="bg-blue-800 p-6 rounded-xl shadow-md hover:bg-blue-700 transition">
            <FaRocket className="text-pink-400 text-4xl mb-4 mx-auto" />
            <h3 className="text-xl font-semibold">Node.js</h3>
            <p className="text-sm text-blue-200 mt-2">JavaScript runtime</p>
          </div>
          <div className="bg-blue-800 p-6 rounded-xl shadow-md hover:bg-blue-700 transition">
            <FaDatabase className="text-green-400 text-4xl mb-4 mx-auto" />
            <h3 className="text-xl font-semibold">MongoDB</h3>
            <p className="text-sm text-blue-200 mt-2">NoSQL Database</p>
          </div>
          <div className="bg-blue-800 p-6 rounded-xl shadow-md hover:bg-blue-700 transition">
            <FaMobileAlt className="text-cyan-400 text-4xl mb-4 mx-auto" />
            <h3 className="text-xl font-semibold">Tailwind CSS</h3>
            <p className="text-sm text-blue-200 mt-2">
              Utility-first CSS framework
            </p>
          </div>
          <div className="bg-blue-800 p-6 rounded-xl shadow-md hover:bg-blue-700 transition">
            <FaKey className="text-red-400 text-4xl mb-4 mx-auto" />
            <h3 className="text-xl font-semibold">JWT Auth</h3>
            <p className="text-sm text-blue-200 mt-2">
              Secure token-based login
            </p>
          </div>
          <div className="bg-blue-800 p-6 rounded-xl shadow-md hover:bg-blue-700 transition">
            <FaEnvelope className="text-purple-400 text-4xl mb-4 mx-auto" />
            <h3 className="text-xl font-semibold">Nodemailer</h3>
            <p className="text-sm text-blue-200 mt-2">
              Email service integration
            </p>
          </div>
          <div className="bg-blue-800 p-6 rounded-xl shadow-md hover:bg-blue-700 transition">
            <FaTools className="text-orange-400 text-4xl mb-4 mx-auto" />
            <h3 className="text-xl font-semibold">Framer Motion</h3>
            <p className="text-sm text-blue-200 mt-2">
              Animations and transitions
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-6 md:px-20">
        <h2 className="text-3xl font-bold text-center mb-10">
          💬 What People Say
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              className="bg-blue-800 p-6 rounded-2xl text-white shadow-md hover:shadow-xl transition"
              whileHover={{ scale: 1.05 }}
            >
              <FaQuoteLeft className="text-yellow-300 text-xl mb-2" />
              <p className="italic text-blue-100">{t.quote}</p>
              <FaQuoteRight className="text-yellow-300 text-xl mt-2" />
              <div className="mt-4 font-bold text-yellow-400">{t.name}</div>
              <div className="text-sm text-blue-300">{t.role}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Contact Form */}
      <section className="bg-blue-950 py-16 px-6 md:px-20 text-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">
            📨 Request Dashboard Access
          </h2>
          <p className="text-blue-200 mb-8 text-lg leading-relaxed">
            Fill out the form below to request access to the{" "}
            <strong className="text-yellow-400">
              Attendance Management System
            </strong>
            <span className="inline-block mt-2">
              ✅ You'll receive{" "}
              <span className="text-yellow-400 font-semibold">
                login credentials
              </span>{" "}
              via email.
            </span>
            <br />
            🔐 First verify using the{" "}
            <strong className="text-green-400">OTP</strong> sent to your email.
            <br />
            🔓 Then login with your password to access the dashboard.
          </p>
        </div>

        <form
          className="max-w-xl mx-auto space-y-6 bg-blue-900 p-8 rounded-2xl shadow-lg border border-blue-800"
          onSubmit={handleSubmit}
        >
          <div>
            <label className="block mb-2 text-blue-200 text-sm font-medium">
              👤 Full Name
            </label>
            <input
              type="text"
              placeholder="Enter your name"
              className="w-full px-4 py-2 rounded-lg bg-blue-800 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
          <div>
            <label className="block mb-2 text-blue-200 text-sm font-medium">
              📧 Email Address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full px-4 py-2 rounded-lg bg-blue-800 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <button
            type="submit"
            className="bg-yellow-400 text-blue-900 font-semibold px-6 py-3 mt-4 rounded-full hover:bg-yellow-300 transition duration-200 w-full"
          >
            {loading ? "Requesting..." : "🚀 Request Access"}
          </button>
        </form>

        <div className="max-w-xl mx-auto mt-10 text-center text-blue-300 text-sm">
          📩 Need help? Contact support at{" "}
          <a
            href="mailto:developert961@gmail.com"
            className="underline text-yellow-400"
          >
            techdev@support.com
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900 text-center py-6 text-blue-200">
        <p>
          © {new Date().getFullYear()} <strong>TechDev Attendance</strong>.
          Built with ❤️ by Aman Sharma.
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;

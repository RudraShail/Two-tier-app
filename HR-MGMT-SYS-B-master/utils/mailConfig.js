const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail", // or "Yahoo", "Outlook", or SMTP config
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"Attendance Management System" <${process.env.MAIL_USER}>`,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error("Email sending failed:", err.message);
    throw err;
  }
};

module.exports = sendEmail;

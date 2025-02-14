const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    secure: process.env.EMAIL_SECURE === "true", // به پورت 587 معمولا false است
  });

  const mailOptions = {
    from: `Dr'ParastoFathi <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message, // ارسال ایمیل به صورت متنی
  };

  try {
    await transporter.sendMail(mailOptions);
    // console.log("Email sent successfully!");
  } catch (error) {
    console.error("Error sending email:", error.message);
    console.error("Full error details:", error);
    throw new Error("Error sending email");
  }
};

module.exports = sendEmail;

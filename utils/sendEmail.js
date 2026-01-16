const nodemailer = require("nodemailer");

module.exports = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: "CSCA Secure <no-reply@csca.com>",
    to: email,
    subject: "Your OTP Verification Code",
    html: `<h2>Your OTP is: <b>${otp}</b></h2>`
  });
};

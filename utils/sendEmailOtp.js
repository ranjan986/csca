import nodemailer from "nodemailer";

export const sendEmailOtp = async (email, otp) => {
  // configure transporter
  console.log(`Email OTP to ${email}: ${otp}`);
};

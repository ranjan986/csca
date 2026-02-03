import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { generatePassword } from "../utils/passwordGenerator.js";
import { sendEmail } from "../utils/emailService.js";
import { sendPhoneOtp } from "../utils/sendPhoneOtp.js";

const router = express.Router();

// Register Route
router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Forgot Password Route
router.post("/forgot-password", async (req, res) => {
  try {
    const { email, phone } = req.body;

    if (!email && !phone) {
      return res.status(400).json({
        message: "Provide email or phone number",
      });
    }

    const user = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Generate new password
    const newPassword = generatePassword(10);
    const hashed = await bcrypt.hash(newPassword, 10);

    user.password = hashed;
    user.forgotPasswordUsedAt = new Date();

    await user.save();

    // Send Password
    const message = `Your new password is: ${newPassword}\n\nPlease change it after logging in.`;

    if (email) {
      await sendEmail(email, "Password Reset", message);
    }

    // We treat phone similar to OTP for now as we lack an SMS gateway key
    if (phone) {
      await sendPhoneOtp(phone, newPassword);
    }

    console.log("New Password Generated:", newPassword);

    res.json({
      message: "New password generated and sent to your email/phone.",
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Reset password for Mobile (Frontend Verified)
router.post("/reset-password-mobile-verified", async (req, res) => {
  try {

    const { phone } = req.body;

    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ message: "User not found" });

    const newPassword = generatePassword(10);
    const hashed = await bcrypt.hash(newPassword, 10);

    user.password = hashed;
    user.forgotPasswordUsedAt = new Date();
    await user.save();

    // Return password to frontend so user can see it
    res.json({ message: "Password reset successful.", newPassword });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

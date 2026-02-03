import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { detectClient } from "../middleware/detectClient.js";
import { sendEmailOtp } from "../utils/sendEmailOtp.js";
import { generateOtp } from "../utils/generateOtp.js";

const router = express.Router();

router.post("/login",
  detectClient,

  async (req, res) => {

    const { identifier, password } = req.body;

    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }]
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const browser = req.clientInfo.browser;

    // Chrome → Email OTP
    if (browser && browser.includes("Chrome")) {
      const otp = generateOtp();
      user.loginOtp = otp;
      await user.save();

      await sendEmailOtp(user.email, otp);

      return res.json({ message: "OTP sent to email for verification" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        preferredLanguage: user.preferredLanguage,
        friends: user.friends,
        points: user.points,
        subscription: user.subscription
      }
    });
  }
);

router.post("/verify-login-otp", async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });

  if (!user || user.loginOtp !== otp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  user.loginOtp = null;
  await user.save();

  await LoginHistory.create({
    user: user._id,
    ip: req.ip,
    browser: "Chrome",
    os: "Recorded",
    device: "Recorded",
  });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  res.json({
    message: "Login successful after OTP",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      preferredLanguage: user.preferredLanguage,
      friends: user.friends,
      points: user.points,
      subscription: user.subscription
    }
  });
});

router.post("/google-login", async (req, res) => {
  try {
    const { email, name, avatar, uid } = req.body;

    let user = await User.findOne({ email });

    if (!user) {
      // Create new user if not exists
      user = await User.create({
        name,
        email,
        avatar,
        googleUid: uid, // Optional: add to schema if needed
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.json({
      message: "Google Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        preferredLanguage: user.preferredLanguage,
        friends: user.friends,
        points: user.points,
        subscription: user.subscription
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
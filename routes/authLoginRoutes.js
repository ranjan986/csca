import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { detectClient } from "../middleware/detectClient.js";
import { sendEmailOtp } from "../utils/sendEmailOtp.js";
import { generateOtp } from "../utils/generateOtp.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login",
  detectClient,

  async (req, res) => {

    let { identifier, password, email } = req.body;

    // Support email as alias for identifier
    identifier = identifier || email;

    if (!identifier || !password) {
      return res.status(400).json({ message: "Please provide email/phone and password" });
    }

    let query = {};
    if (identifier.includes('@')) {
      query.email = { $regex: new RegExp(`^${identifier}$`, 'i') };
    } else {
      query.phone = identifier;
    }

    const user = await User.findOne(query);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Guard: Check if user has a password (Google Login users might not)
    if (!user.password) {
      return res.status(400).json({ message: "This account uses Google Login. Please login with Google or use Forgot Password to set a password." });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });



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
    const { email, firstName, lastName, avatar, uid } = req.body;

    let user = await User.findOne({ email });

    if (!user) {
      // Create new user if not exists
      user = await User.create({
        firstName,
        lastName,
        email,
        avatar,
        googleUid: uid,
      });
    } else {
      // Update existing user with latest Google info
      user.firstName = firstName || user.firstName;
      user.lastName = lastName || user.lastName;
      user.avatar = avatar || user.avatar;
      user.googleUid = uid || user.googleUid;
      await user.save();
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.json({
      message: "Google Login successful",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        preferredLanguage: user.preferredLanguage,
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      status: "success",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
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
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;
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
        subscription: user.subscription,
        role: user.role
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
      subscription: user.subscription,
      role: user.role
    }
  });
});

router.post("/google-login", async (req, res) => {
  try {
    const { email, firstName, lastName, avatar, uid, name } = req.body;

    let finalFirstName = firstName;
    let finalLastName = lastName;

    // Logic to handle "name" being sent instead of first/last name (common on mobile/some flows)
    if (!finalFirstName && name) {
      const parts = name.trim().split(" ");
      finalFirstName = parts[0];
      finalLastName = parts.slice(1).join(" ") || "";
    }

    let user = await User.findOne({ email });

    if (!user) {
      // Create new user if not exists
      user = await User.create({
        firstName: finalFirstName,
        lastName: finalLastName,
        email,
        avatar,
        googleUid: uid,
      });
    } else {
      // Update existing user with latest Google info ONLY if fields are missing
      // This prevents overwriting manually changed names
      if (!user.firstName && finalFirstName) {
        user.firstName = finalFirstName;
      }
      if (!user.lastName && finalLastName) {
        user.lastName = finalLastName;
      }

      // Only update avatar if user doesn't have one (prevents overwriting custom uploads)
      if (!user.avatar && avatar) {
        user.avatar = avatar;
      }
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
        role: user.role
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
        subscription: user.subscription,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;
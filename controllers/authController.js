const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const generateOTP = require("../utils/generateOTP");
const sendEmail = require("../utils/sendEmail");

// REGISTER
exports.register = async (req, res) => {
  const { firstName, lastName, email, phone, password } = req.body;

  try {
    if (!firstName || !lastName || !password) {
      return res.status(400).json({
        message: "First name, last name and password are required"
      });
    }

    const cleanEmail = email?.trim();
    const cleanPhone = phone?.trim();

    if (!cleanEmail && !cleanPhone) {
      return res.status(400).json({ message: "Email or phone required" });
    }

    const existingUser = await User.findOne({
      $or: [
        cleanEmail ? { email: cleanEmail } : null,
        cleanPhone ? { phone: cleanPhone } : null,
      ].filter(Boolean),
    });

    if (existingUser && existingUser.isVerified === true) {
      return res.status(400).json({ message: "User already exists" });
    }
    else if (existingUser) {
      await User.deleteOne({ _id: existingUser._id });
    }

    const otp = generateOTP();
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName,
      lastName,
      email: cleanEmail,
      phone: cleanPhone,
      password: hashedPassword,
      otp,
      otpExpiry: Date.now() + 15 * 60 * 1000,
    });

    try {
      if (cleanEmail) await sendEmail(cleanEmail, otp);
    } catch (e) {
      console.error("EMAIL OTP FAILED:", e.message);
    }

    res.status(201).json({
      message: "OTP sent successfully",
      userId: user._id,
    });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.verifyOTP = async (req, res) => {
  const { userId, otp } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user || user.otp !== otp || user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.json({ message: "Account verified successfully" });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
 // LOGIN
 exports.login = async (req, res) => {
  const { identifier, password } = req.body;

  try {
    if (!identifier || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const cleanIdentifier = identifier.trim().toLowerCase();

    const user = await User.findOne({
      $or: [
        { email: cleanIdentifier },
        { phone: cleanIdentifier }
      ]
    });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: "Verify OTP first" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        email: user.email || null,
        phone: user.phone || null
      }
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

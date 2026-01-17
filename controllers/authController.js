const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const generateOTP = require("../utils/generateOTP");
const sendEmail = require("../utils/sendEmail");

// REGISTER
exports.register = async (req, res) => {
  const { firstName, lastName, email, phone, password } = req.body;

  try {
    // Normalize input
    const cleanEmail = email?.trim() || undefined;
    const cleanPhone = phone?.trim() || undefined;

    if (!cleanEmail && !cleanPhone) {
      return res.status(400).json({ message: "Email or phone required" });
    }

    // Build safe query
    const orQuery = [];
    if (cleanEmail) orQuery.push({ email: cleanEmail });
    if (cleanPhone) orQuery.push({ phone: cleanPhone });

    const existingUser = await User.findOne({ $or: orQuery });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const otp = generateOTP();
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user object safely
    const userData = {
      firstName,
      lastName,
      password: hashedPassword,
      otp,
      otpExpiry: Date.now() + 5 * 60 * 1000 // 5 minutes
    };

    if (cleanEmail) userData.email = cleanEmail;
    if (cleanPhone) userData.phone = cleanPhone;

    const user = await User.create(userData);

    // Send OTP
    if (cleanEmail) await sendEmail(cleanEmail, otp);

    res.status(201).json({
      message: "OTP sent successfully",
      userId: user._id
    });

  } catch (err) {
    console.error(err);
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

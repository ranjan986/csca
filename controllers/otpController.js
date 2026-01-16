const User = require("../models/User");
const generateOTP = require("../utils/generateOTP");
const sendEmail = require("../utils/sendEmail");
const sendSMS = require("../utils/sendSMS");
const jwt = require("jsonwebtoken");

exports.sendOTP = async (req, res) => {
  const { email, phone } = req.body;

  if (!email && !phone) {
    return res.status(400).json({
      message: "Email or Phone is required",
    });
  }

  try {
    let user = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (!user) {
      user = await User.create({
        email: email || null,
        phone: phone || null,
      });
    }

    const otp = generateOTP();

    user.otp = otp;
    user.otpExpire = Date.now() + 5 * 60 * 1000;
    await user.save();

    if (phone) {
      await sendSMS(phone, otp); 
    } else {
      await sendEmail(email, otp); 
    }

    res.status(200).json({
      message: `OTP sent successfully via ${phone ? "SMS" : "Email"}`,
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
};


exports.verifyOTP = async (req, res) => {
  const { email, phone, otp } = req.body;

  try {
    const user = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (!user || user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.otpExpire < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    user.otp = null;
    user.otpExpire = null;
    await user.save();

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

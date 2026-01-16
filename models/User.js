const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },

  lastName: {
    type: String,
    required: true
  },

  email: {
    type: String,
    unique: true,
    sparse: true   //IMPORTANT
  },

  phone: {
    type: String,
    unique: true,
    sparse: true   //IMPORTANT
  },

  password: {
    type: String,
    required: true
  },

  provider: {
    type: String,
    default: "local"
  },

  googleId: String,

  role: {
    type: String,
    default: "student"
  },

  profileImage: String,

  otp: String,
  otpExpiry: Date,

  isVerified: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);

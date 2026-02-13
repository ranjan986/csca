import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import validator from "validator";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    lastName: {
      type: String,
      trim: true,
      maxlength: 50,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, "Invalid email address"],
      index: true,
    },

    phone: {
      type: String,
      unique: true,
      sparse: true,
      match: [/^[6-9]\d{9}$/, "Invalid phone number"],
    },

    password: {
      type: String,
      required: function () {
        return !this.googleUid;
      },
      minlength: 8,
      select: false, // 🔥 Never return password
    },

    avatar: {
      type: String,
      default: null,
    },

    googleUid: {
      type: String,
      unique: true,
      sparse: true,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    resetPasswordToken: {
      type: String,
      select: false,
    },

    resetPasswordExpires: {
      type: Date,
    },

    isBlocked: {
      type: Boolean,
      default: false,
    },

    lastLogin: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);

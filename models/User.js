import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  password: String,
  avatar: String,
  googleUid: String,
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },

  forgotPasswordUsedAt: {
    type: Date,
    default: null,
  },
  expiresAt: Date,
},

  { timestamps: true });

export default mongoose.model("User", userSchema);

import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  password: String,
  avatar: String,
  googleUid: String,

  forgotPasswordUsedAt: {
    type: Date,
    default: null,
  },
  expiresAt: Date,
},

  { timestamps: true });

export default mongoose.model("User", userSchema);

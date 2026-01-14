const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: String,
  provider: {
    type: String,
    default: "local",
  },
  googleId: String,
  role: {
      type: String,
      default: "student",
    },
    profileImage: String,
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);

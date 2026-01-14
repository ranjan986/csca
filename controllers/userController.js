import User from "../models/User.js";
import bcrypt from "bcryptjs";

// UPDATE PROFILE
export const updateProfile = async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
    },
    { new: true }
  );
  res.json(user);
};

// CHANGE PASSWORD
export const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id);
  const match = await bcrypt.compare(oldPassword, user.password);

  if (!match)
    return res.status(400).json({ message: "Wrong old password" });

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.json({ message: "Password updated" });
};

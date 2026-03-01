import User from "../models/User.js";
import bcrypt from "bcryptjs";

// Get All Users (Admin)
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update Profile (Name, Avatar)
export const updateProfile = async (req, res) => {
    try {
        const { firstName, lastName, avatar } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ message: "User not found" });

        // Update Name
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;

        if (avatar) user.avatar = avatar;

        await user.save();

        res.json({
            message: "Profile updated successfully",
            user: {
                id: user._id,
                name: `${user.firstName} ${user.lastName}`.trim(),
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                avatar: user.avatar,
                role: user.role
            }
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete Avatar
export const deleteAvatar = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.avatar = null; // or set to a default empty string if preferred
        await user.save();

        res.json({ message: "Avatar removed successfully", user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Change Password
export const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id).select('+password');

        if (!user) return res.status(404).json({ message: "User not found" });

        // If user has no password (e.g. Google Login)
        if (!user.password) {
            return res.status(400).json({ message: "You are logged in via Google. Please use 'Forgot Password' to set a new password." });
        }

        // Verify old password
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect old password" });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        await user.save();

        res.json({ message: "Password updated successfully" });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

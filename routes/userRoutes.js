import express from "express";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";
import bcrypt from "bcryptjs";

import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

// Get All Users (Admin)
router.get("/", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update Profile (Name, Avatar)
router.put("/update", authMiddleware, async (req, res) => {
    try {
        const { firstName, lastName, avatar } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ message: "User not found" });

        // Update Name
        if (firstName || lastName) {
            // If only one is provided, use existing data for the other to reconstruct name
            // But since the frontend sends both, we can just combine them.
            // If they are undefined in body, we keep existing name.

            // To be safe, we parse the existing name first if needed, 
            // but the frontend sends the current state of both.

            const currentNameParts = (user.name || "").split(' ');
            const currentFirst = currentNameParts[0] || "";
            const currentLast = currentNameParts.slice(1).join(' ') || "";

            const newFirst = firstName !== undefined ? firstName : currentFirst;
            const newLast = lastName !== undefined ? lastName : currentLast;

            user.name = `${newFirst} ${newLast}`.trim();
        }

        if (avatar) user.avatar = avatar;

        await user.save();

        res.json({
            message: "Profile updated successfully",
            user: {
                id: user._id,
                name: user.name,
                firstName: user.name.split(' ')[0], // Derived for frontend convenience
                lastName: user.name.split(' ').slice(1).join(' '), // Derived
                email: user.email,
                phone: user.phone,
                avatar: user.avatar,
                role: user.role
            }
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete Avatar
router.delete("/avatar", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.avatar = null; // or set to a default empty string if preferred
        await user.save();

        res.json({ message: "Avatar removed successfully", user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Change Password
router.put("/change-password", authMiddleware, async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id);

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
});

export default router;

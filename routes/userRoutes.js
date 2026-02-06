import express from "express";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";

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

        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (avatar) user.avatar = avatar;

        await user.save();

        res.json({
            message: "Profile updated successfully",
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                avatar: user.avatar,
                // Add other fields as necessary to match login response
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

export default router;

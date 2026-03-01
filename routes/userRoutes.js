import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import {
    getAllUsers,
    updateProfile,
    deleteAvatar,
    changePassword
} from "../controllers/userController.js";

const router = express.Router();

// Get All Users (Admin)
router.get("/", authMiddleware, adminMiddleware, getAllUsers);

// Update Profile (Name, Avatar)
router.put("/update", authMiddleware, updateProfile);

// Delete Avatar
router.delete("/avatar", authMiddleware, deleteAvatar);

// Change Password
router.put("/change-password", authMiddleware, changePassword);

export default router;

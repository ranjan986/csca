import express from "express";
import {
  registerUser,
  forgotPassword,
  resetPasswordMobileVerified
} from "../controllers/authController.js";

const router = express.Router();

// Register Route
router.post("/register", registerUser);

// Forgot Password Route
router.post("/forgot-password", forgotPassword);

// Reset password for Mobile (Frontend Verified)
router.post("/reset-password-mobile-verified", resetPasswordMobileVerified);

export default router;

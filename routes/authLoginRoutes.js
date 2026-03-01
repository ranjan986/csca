import express from "express";
import { detectClient } from "../middleware/detectClient.js";
import protect from "../middleware/authMiddleware.js";
import {
  loginUser,
  verifyLoginOtp,
  googleLogin,
  logoutUser,
  getMe
} from "../controllers/authController.js";

const router = express.Router();

router.post("/login", detectClient, loginUser);
router.post("/verify-login-otp", verifyLoginOtp);
router.post("/google-login", googleLogin);
router.post("/logout", logoutUser);

// User Profile Route
router.get("/me", getMe);

export default router;
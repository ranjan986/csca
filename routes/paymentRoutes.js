import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
    getPublicKey,
    createOrder,
    verifyPayment
} from "../controllers/paymentController.js";

const router = express.Router();

// Get Public Key
router.get("/get-key", getPublicKey);

// Create Order Route
router.post("/order", authMiddleware, createOrder);

// Verify Payment Route
router.post("/verify", authMiddleware, verifyPayment);

export default router;

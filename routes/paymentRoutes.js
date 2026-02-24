import express from "express";
import crypto from "crypto";
import razorpay from "../config/razorpay.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Get Public Key
router.get("/get-key", (req, res) => {
    res.json({ key: process.env.RAZORPAY_KEY });
});

// Create Order Route
router.post("/order", authMiddleware, async (req, res) => {
    try {
        const { amount, currency = "INR", receipt } = req.body;

        const options = {
            amount: Math.round(amount * 100), // Razorpay expects amount in paise (even for USD, it uses the smallest unit)
            currency,
            receipt,
        };

        const order = await razorpay.orders.create(options);

        if (!order) {
            return res.status(500).send("Error creating order");
        }

        res.json(order);
    } catch (error) {
        console.error("Order creation error:", error);
        res.status(500).send("Server error");
    }
});

// Verify Payment Route
router.post("/verify", (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_SECRET)
            .update(body.toString())
            .digest("hex");

        const isSignatureValid = expectedSignature === razorpay_signature;

        if (isSignatureValid) {
            // Here you would typically update the database to mark the payment/booking as successful
            res.json({ status: "success", message: "Payment verified successfully" });
        } else {
            res.status(400).json({ status: "failure", message: "Invalid signature" });
        }
    } catch (error) {
        console.error("Verification error:", error);
        res.status(500).send("Server error");
    }
});

export default router;

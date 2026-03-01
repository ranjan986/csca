import crypto from "crypto";
import razorpay from "../config/razorpay.js";
import Enrollment from "../models/Enrollment.js";

// Get Public Key
export const getPublicKey = (req, res) => {
    res.json({ key: process.env.RAZORPAY_KEY });
};

// Create Order
export const createOrder = async (req, res) => {
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
};

// Verify Payment
export const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            items, // Array of {id, type}
            amount, // in rupees
            examId,
            appointmentId
        } = req.body;

        const userId = req.user._id;

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_SECRET)
            .update(body.toString())
            .digest("hex");

        const isSignatureValid = expectedSignature === razorpay_signature;

        if (isSignatureValid) {
            // Handle Course Items
            if (items && Array.isArray(items)) {
                for (const item of items) {
                    if (item.type === 'course') {
                        // Check if already enrolled to avoid duplicates
                        const existing = await Enrollment.findOne({ user: userId, course: item.id });
                        if (!existing) {
                            const newEnrollment = new Enrollment({
                                user: userId,
                                course: item.id,
                                paymentId: razorpay_payment_id,
                                orderId: razorpay_order_id,
                                amount: amount || 0, // Total amount paid for the transaction
                                status: 'Completed'
                            });
                            await newEnrollment.save();
                        }
                    }
                }
            }

            // Handle Exam Booking (Future-proofing or if exam booking also uses this)
            if (examId) {
                // Logic for marking exam as paid could go here
                console.log(`Exam ${examId} paid by user ${userId}`);
            }

            res.json({ status: "success", message: "Payment verified successfully" });
        } else {
            res.status(400).json({ status: "failure", message: "Invalid signature" });
        }
    } catch (error) {
        console.error("Verification error:", error);
        res.status(500).send("Server error");
    }
};

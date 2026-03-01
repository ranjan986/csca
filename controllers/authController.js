import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { generatePassword } from "../utils/passwordGenerator.js";
import { sendEmail } from "../utils/emailService.js";
import { sendPhoneOtp } from "../utils/sendPhoneOtp.js";

// Register Route Controller
export const registerUser = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',').map(e => e.trim()) : [];
        const role = adminEmails.includes(email) ? 'admin' : 'user';

        const user = await User.create({
            firstName,
            lastName,
            email,
            phone,
            password: hashedPassword,
            role
        });

        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        if (err.code === 11000) {
            return res.status(400).json({ message: 'Email or phone number already in use' });
        }
        console.error('Registration Error:', err);
        res.status(500).json({ message: 'Internal server error. Please try again later.' });
    }
};

// Forgot Password Route Controller 
export const forgotPassword = async (req, res) => {
    try {
        const { email, phone } = req.body;

        console.log("Forgot Password Request:", { email, phone });

        let query = {};
        if (email) {
            // Case-insensitive search
            query.email = { $regex: new RegExp(`^${email}$`, 'i') };
        } else if (phone) {
            query.phone = phone;
        } else {
            return res.status(400).json({ message: "Provide email or phone number" });
        }

        const user = await User.findOne(query);
        console.log("User search result:", user ? "Found" : "Not Found");

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        // Generate new password
        const newPassword = generatePassword(10);
        const hashed = await bcrypt.hash(newPassword, 10);

        user.password = hashed;
        user.forgotPasswordUsedAt = new Date();

        await user.save();

        // Send Password
        const message = `Your new password is: ${newPassword}\n\nPlease change it after logging in.`;

        if (email) {
            await sendEmail(email, "Password Reset", message);
        }

        // We treat phone similar to OTP for now as we lack an SMS gateway key
        if (phone) {
            await sendPhoneOtp(phone, newPassword);
        }

        console.log("New Password Generated:", newPassword);

        res.json({
            message: "New password generated and sent to your email/phone.",
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Reset password for Mobile (Frontend Verified) Controller
export const resetPasswordMobileVerified = async (req, res) => {
    try {

        const { phone } = req.body;

        const user = await User.findOne({ phone });
        if (!user) return res.status(404).json({ message: "User not found" });

        const newPassword = generatePassword(10);
        const hashed = await bcrypt.hash(newPassword, 10);

        user.password = hashed;
        user.forgotPasswordUsedAt = new Date();
        await user.save();

        // Return password to frontend so user can see it
        res.json({ message: "Password reset successful.", newPassword });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// Login Route Controller
export const loginUser = async (req, res) => {
    try {
        let { identifier, password, email } = req.body;

        // Support email as alias for identifier
        identifier = identifier || email;

        if (!identifier || !password) {
            return res.status(400).json({ message: "Please provide email/phone and password" });
        }

        let query = {};
        if (identifier.includes('@')) {
            query.email = { $regex: new RegExp(`^${identifier}$`, 'i') };
        } else {
            query.phone = identifier;
        }

        const user = await User.findOne(query).select('+password');
        if (!user) return res.status(404).json({ message: "User not found" });

        // Guard: Check if user has a password (Google Login users might not)
        if (!user.password) {
            return res.status(400).json({ message: "This account uses Google Login. Please login with Google or use Forgot Password to set a password." });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ message: "Invalid credentials" });

        // Auto-promote if in ADMIN_EMAILS
        const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',').map(e => e.trim()) : [];
        if (adminEmails.includes(user.email) && user.role !== 'admin') {
            user.role = 'admin';
            await user.save();
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "30d",
        });

        res.cookie('token', token, {
            httpOnly: true,
            secure: true, // Always true for cross-site cookie in modern browsers
            sameSite: 'none', // Required for cross-site cookie (Vercel -> Render)
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        res.json({
            message: "Login successful",
            user: {
                id: user._id,
                name: `${user.firstName} ${user.lastName}`.trim(),
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                avatar: user.avatar,
                preferredLanguage: user.preferredLanguage,
                friends: user.friends,
                points: user.points,
                subscription: user.subscription,
                role: user.role
            }
        });
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ message: "Internal server error. Please try again later." });
    }
};

// Verify Login OTP
export const verifyLoginOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ email });

        if (!user || user.loginOtp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        user.loginOtp = null;
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "30d",
        });

        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 30 * 24 * 60 * 60 * 1000
        });

        res.json({
            message: "Login successful after OTP",
            user: {
                id: user._id,
                name: `${user.firstName} ${user.lastName}`.trim(),
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                avatar: user.avatar,
                preferredLanguage: user.preferredLanguage,
                friends: user.friends,
                points: user.points,
                subscription: user.subscription,
                role: user.role
            }
        });
    } catch (err) {
        console.error("Verify OTP Error:", err);
        res.status(500).json({ message: "Internal server error. Please try again later." });
    }
};

// Google Login Controller
export const googleLogin = async (req, res) => {
    try {
        const { email, firstName, lastName, avatar, uid, name } = req.body;

        let userFirstName = firstName;
        let userLastName = lastName;

        if (!userFirstName && !userLastName) {
            // Fallback to name or email prefix if nothing provided
            let finalName = name || email.split('@')[0];
            const parts = finalName.split(' ');
            userFirstName = parts[0] || 'Google';
            userLastName = parts.slice(1).join(' ') || 'User';
        } else if (!userFirstName) {
            userFirstName = 'Google';
        } else if (!userLastName) {
            userLastName = 'User';
        }

        let user = await User.findOne({ email });

        if (!user) {
            // Create new user if not exists
            const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',').map(e => e.trim()) : [];
            const role = adminEmails.includes(email) ? 'admin' : 'user';

            user = await User.create({
                firstName: userFirstName,
                lastName: userLastName,
                email,
                avatar,
                googleUid: uid,
                role
            });
        } else {
            // Update existing user with latest Google info ONLY if fields are missing
            if (!user.firstName) user.firstName = userFirstName;
            if (!user.lastName) user.lastName = userLastName;

            // Only update avatar if user doesn't have one (prevents overwriting custom uploads)
            if (!user.avatar && avatar) {
                user.avatar = avatar;
            }
            user.googleUid = uid || user.googleUid;

            // Auto-promote if in ADMIN_EMAILS
            const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',').map(e => e.trim()) : [];
            if (adminEmails.includes(email) && user.role !== 'admin') {
                user.role = 'admin';
            }

            await user.save();
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "30d",
        });

        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 30 * 24 * 60 * 60 * 1000
        });

        res.json({
            message: "Google Login successful",
            user: {
                id: user._id,
                name: `${user.firstName} ${user.lastName}`.trim(),
                email: user.email,
                phone: user.phone,
                avatar: user.avatar,
                preferredLanguage: user.preferredLanguage,
                role: user.role
            }
        });
    } catch (err) {
        console.error("Google Login Error:", err);
        res.status(500).json({ message: err.message });
    }
};

// Logout Controller
export const logoutUser = (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: true,
        sameSite: 'none'
    });
    res.json({ message: "Logged out successfully" });
};

// Get Me (Current User) Controller
export const getMe = async (req, res) => {
    try {
        let token = req.cookies.token;
        if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.json({ status: "success", user: null });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.json({ status: "success", user: null });
        }

        res.json({
            status: "success",
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                name: `${user.firstName} ${user.lastName}`.trim(),
                email: user.email,
                phone: user.phone,
                avatar: user.avatar,
                preferredLanguage: user.preferredLanguage,
                friends: user.friends,
                points: user.points,
                subscription: user.subscription,
                role: user.role
            }
        });
    } catch (error) {
        // If token is invalid or expired, just return null
        res.json({ status: "success", user: null });
    }
};

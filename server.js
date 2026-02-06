import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import hpp from "hpp";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import authLoginRoutes from "./routes/authLoginRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import examRoutes from "./routes/examRoutes.js";

dotenv.config();
connectDB();

const app = express();

// Security Middleware
app.use(helmet({
    contentSecurityPolicy: {
        useDefaults: true,
        directives: {
            "img-src": ["'self'", "data:", "https://res.cloudinary.com", "https://*.googleusercontent.com"],
        }
    },
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }
})); // Set security headers with CSP

// Rate Limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use("/api", limiter);

// CORS Config
app.use(cors({
    origin: "*", // Replace with specific frontend URL in production
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true
}));

// Body Parser
app.use(express.json({ limit: '10kb' })); // Limit body size

// Data Sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data Sanitization against XSS
app.use(xss());

// Prevent Parameter Pollution
app.use(hpp());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/auth", authLoginRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/users", userRoutes);
app.use("/api/exams", examRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

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
import resultRoutes from "./routes/resultRoutes.js";

dotenv.config();
connectDB();

const app = express();

/* =========================
   SECURITY : HELMET (FIXED)
========================= */
app.use(
  helmet({
    // 🔥 Firebase / Google popup fix
    crossOriginOpenerPolicy: false,
    crossOriginEmbedderPolicy: false,

    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],

        "script-src": [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          "https://accounts.google.com",
          "https://apis.google.com",
          "https://www.gstatic.com",
        ],

        "frame-src": [
          "'self'",
          "https://accounts.google.com",
          "https://*.firebaseapp.com",
          "https://*.google.com",
        ],

        "connect-src": [
          "'self'",
          "https://accounts.google.com",
          "https://identitytoolkit.googleapis.com",
          "https://securetoken.googleapis.com",
          "https://apis.google.com",
        ],

        "img-src": [
          "'self'",
          "data:",
          "https://res.cloudinary.com",
          "https://*.googleusercontent.com",
        ],

        "style-src": [
          "'self'",
          "'unsafe-inline'",
        ],
      },
    },
  })
);

/* =========================
   RATE LIMIT
========================= */
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 200, // Render friendly
});
app.use("/api", limiter);

/* =========================
   CORS CONFIG
========================= */
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5000",
  process.env.CLIENT_URL,
  "https://csca.onrender.com",
  "https://cscas.vercel.app",
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        console.log("Blocked by CORS:", origin);
        return callback(new Error("Not allowed by CORS"), false);
      }
    },
    credentials: true,
  })
);

/* =========================
   BODY PARSER
========================= */
app.use(express.json({ limit: "10mb" }));

/* =========================
   SANITIZATION
========================= */
app.use(mongoSanitize()); // NoSQL Injection
app.use(xss());           // XSS
app.use(hpp());           // HTTP Parameter Pollution

/* =========================
   ROUTES
========================= */
app.use("/api/auth", authRoutes);
app.use("/api/auth", authLoginRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/users", userRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/results", resultRoutes);

/* =========================
   SERVER
========================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

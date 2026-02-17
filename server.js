import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";



import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import authLoginRoutes from "./routes/authLoginRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import examRoutes from "./routes/examRoutes.js";
import resultRoutes from "./routes/resultRoutes.js";
import proctorRoutes from "./routes/proctorRoutes.js";

dotenv.config();
connectDB();

const app = express();

app.use(cookieParser());

app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true
}));

// Body Parser
app.use(express.json({ limit: '50mb' })); // Limit body size



// Routes
app.use("/api/auth", authRoutes);
app.use("/api/auth", authLoginRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/users", userRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/proctor", proctorRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} (Restored Version)`));

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
import { Server } from "socket.io";
import http from "http";

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "http://localhost:3000"],
        methods: ["GET", "POST"],
        credentials: true
    }
});

app.set('io', io);

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

// Socket.io Logic
io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("join_session", ({ examId, userId }) => {
        const room = `${examId}_${userId}`;
        socket.join(room);
        console.log(`[Socket] User ${userId} joined room ${room}`);
    });

    socket.on("send_message", (data) => {
        const { room, ...messageData } = data;
        io.to(room).emit("receive_message", messageData);
        console.log(`[Socket] Message in room ${room}:`, messageData);
    });

    socket.on("send_warning", (data) => {
        const { room, message } = data;
        io.to(room).emit("proctor_warning", { message });
        console.log(`[Socket] Warning in room ${room}: ${message}`);
    });

    socket.on("disqualify_student", (data) => {
        const { room, reason } = data;
        io.to(room).emit("disqualify_student", { reason });
        console.log(`[Socket] Disqualified student in room ${room} for: ${reason}`);
    });

    // WebRTC Signaling
    socket.on("webrtc-signal", (data) => {
        const { room, signal, type } = data;
        // Broadcast to the other person in the room
        socket.to(room).emit("webrtc-signal", { signal, type, sender: socket.id });
        console.log(`[Socket] WebRTC ${type} signal in room ${room}`);
    });

    socket.on("disconnect", () => {
        console.log("[Socket] User disconnected:", socket.id);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT} with Sockets`));

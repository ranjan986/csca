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
import paymentRoutes from "./routes/paymentRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import liveClassRoutes from "./routes/liveClassRoutes.js";
import certificationRoutes from "./routes/certificationRoutes.js";
import careerRoutes from "./routes/careerRoutes.js";
import industryRoutes from "./routes/industryRoutes.js";
import resourceRoutes from "./routes/resourceRoutes.js";
import partnershipRoutes from "./routes/partnershipRoutes.js";
import { Server } from "socket.io";
import http from "http";

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "http://localhost:3000", "https://cscas.vercel.app", /\.vercel\.app$/],
        methods: ["GET", "POST"],
        credentials: true
    }
});

app.set('io', io);
app.set("trust proxy", 1); // Trust first proxy (Render) for secure cookies

app.use(cookieParser());

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://cscas.vercel.app",
    /\.vercel\.app$/
];

app.use(cors({
    origin: allowedOrigins,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true
}));

// Body Parser
app.use(express.json({ limit: '100mb' })); // Increase limit for high-res snapshots
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/auth", authLoginRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/users", userRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/proctor", proctorRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/live-class", liveClassRoutes);
app.use("/api/certifications", certificationRoutes);
app.use("/api/careers", careerRoutes);
app.use("/api/industries", industryRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/partnerships", partnershipRoutes);

// Socket.io Logic
io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("join_session", ({ examId, userId, attemptId }) => {
        const room = attemptId ? `${examId}_${userId}_${attemptId}` : `${examId}_${userId}`;
        socket.join(room);
        console.log(`[Socket] User ${userId} joined room ${room}`);
    });

    // Student joins a course room to receive live class events
    socket.on("join_course", ({ courseId }) => {
        socket.join(`course_${courseId}`);
        console.log(`[Socket] Socket ${socket.id} joined course room course_${courseId}`);
    });

    // Proctor joins an exam-specific room for real-time alerts (like new ID uploads)
    socket.on("join_proctor_exam", ({ examId }) => {
        const room = `proctor_exam_${examId}`;
        socket.join(room);
        console.log(`[Socket] Proctor joined room ${room}`);
    });

    socket.on("send_message", (data) => {
        const { room, ...messageData } = data;
        io.to(room).emit("receive_message", messageData);
        console.log(`[Socket] Message in room ${room}:`, messageData);
    });

    socket.on("send_warning", (data) => {
        const { room, message } = data;
        console.log(`[Socket] Relaying warning to room ${room}: ${message}`);
        io.to(room).emit("proctor_warning", { message });
    });

    socket.on("disqualify_student", (data) => {
        const { room, reason } = data;
        console.log(`[Socket] Relaying disqualification to room ${room}: ${reason}`);
        io.to(room).emit("disqualify_student", { reason });
    });

    // WebRTC Signaling
    socket.on("webrtc-signal", (data) => {
        const { room } = data;
        // Broadcast the entire data object to the other person in the room
        socket.to(room).emit("webrtc-signal", data);
        console.log(`[Socket] WebRTC signal in room ${room}`);
    });

    socket.on("webrtc-screen-signal", (data) => {
        const { room } = data;
        // Broadcast screen share signals
        socket.to(room).emit("webrtc-screen-signal", data);
        console.log(`[Socket] WebRTC screen signal in room ${room}`);
    });

    socket.on("noise_alert", (data) => {
        const { room, level } = data;
        // Relay noise alert to the proctor
        socket.to(room).emit("noise_alert", { level, room });
        console.log(`[Socket] Noise alert in room ${room}: ${level}`);
    });

    socket.on("tab_switch_alert", (data) => {
        const { room, userId } = data;
        // Relay tab switch alert to the proctor
        socket.to(room).emit("tab_switch_alert", { userId, room });
        console.log(`[Socket] Tab switch alert in room ${room} for user ${userId}`);
    });

    socket.on("request_live_feed", (data) => {
        const { room } = data;
        // Broadcast to student to re-initiate signaling
        socket.to(room).emit("request_live_feed", data);
        console.log(`[Socket] Live feed requested in room ${room}`);
    });

    socket.on("disconnect", () => {
        console.log("[Socket] User disconnected:", socket.id);
    });
});

const PORT = process.env.PORT || 5000;

server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
        console.error(`[Fatal] Port ${PORT} is already in use.`);
        console.log("Try running: netstat -ano | findstr :5000 followed by taskkill /PID <PID> /F");
        process.exit(1);
    }
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('[Global Error]', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method
    });
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT} with Sockets`));

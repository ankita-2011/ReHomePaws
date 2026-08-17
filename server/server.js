import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";

import connectDB from "./config/db.js";
import { setIO } from "./config/socketManager.js";
import authRoutes from "./routes/authRoutes.js";
import petRoutes from "./routes/petRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import adoptionRoutes from "./routes/adoptionRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import Adoption from "./models/Adoption.js";
import ChatMessage from "./models/ChatMessage.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

connectDB();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

const uploadPath = path.join(__dirname, process.env.UPLOADS_DIR || "uploads");
app.use("/uploads", express.static(uploadPath));

app.use("/api/auth", authRoutes);
app.use("/api/pets", petRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/adoptions", adoptionRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/", (req, res) => {
  res.send("API running");
});

// Fallback 404 handler for API routes
app.use("/api", (req, res) => {
  res.status(404).json("API endpoint not found");
});

// Global central error handler middleware
app.use((err, req, res, next) => {
  console.error("Unhandled Server Error:", err);
  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json(err.message || "Internal server error occurred");
});

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
});

// Share io instance with controllers
setIO(io);

// Authenticate socket connections via JWT passed in auth handshake or HttpOnly cookie
io.use((socket, next) => {
  let token = socket.handshake.auth?.token;

  if (!token && socket.handshake.headers?.cookie) {
    const rawCookie = socket.handshake.headers.cookie;
    const match = rawCookie.match(/(?:^|;\s*)(?:token|adminToken)=([^;]+)/);
    if (match) token = decodeURIComponent(match[1]);
  }

  if (!token) return next(new Error("Unauthorized"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch {
    next(new Error("Invalid token"));
  }
});

io.on("connection", (socket) => {
  // Join user's personal notification room
  socket.join(`user:${socket.user.id}`);

  // Join a chat room scoped to an adoptionId
  socket.on("join_room", async ({ adoptionId }) => {
    try {
      const adoption = await Adoption.findById(adoptionId);
      if (!adoption) return;

      const userId = socket.user.id;
      const isParty =
        adoption.adopterId.toString() === userId ||
        adoption.ownerId.toString() === userId;

      if (!isParty) return;

      socket.join(adoptionId);
    } catch (err) {
      console.error("join_room error:", err);
    }
  });

  // Receive a message, persist it, broadcast to the room
  socket.on("send_message", async ({ adoptionId, message }) => {
    try {
      if (!message?.trim()) return;

      const adoption = await Adoption.findById(adoptionId);
      if (!adoption) return;

      const userId = socket.user.id;
      const isParty =
        adoption.adopterId.toString() === userId ||
        adoption.ownerId.toString() === userId;

      if (!isParty) return;

      const saved = await ChatMessage.create({
        adoptionId,
        senderId: userId,
        senderName: socket.user.name || "User",
        message: message.trim()
      });

      io.to(adoptionId).emit("receive_message", {
        _id: saved._id,
        adoptionId,
        senderId: saved.senderId,
        senderName: saved.senderName,
        message: saved.message,
        createdAt: saved.createdAt
      });
    } catch (err) {
      console.error("send_message error:", err);
    }
  });

  // Broadcast typing indicator to the room (excluding sender)
  socket.on("typing", ({ adoptionId }) => {
    socket.to(adoptionId).emit("typing", { senderId: socket.user.id });
  });

  socket.on("leave_room", ({ adoptionId }) => {
    socket.leave(adoptionId);
  });
});

const PORT = process.env.PORT || 8080;

httpServer.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
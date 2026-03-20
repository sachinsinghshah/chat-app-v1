import "dotenv/config";
import express from "express";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth.routes.js";
import messageRoutes from "./routes/message.routes.js";
import userRoutes from "./routes/user.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import groupRoutes from "./routes/group.routes.js";
import { connectToMongoDb } from "./db/connectToMongoDB.js";
import cookieParser from "cookie-parser";
import { app, server } from "../socket/socket.js";
import path from "path";

const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

// ── Rate limiters ──────────────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 60 * 1000,       // 1 minute
  max: 10,
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const messageLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { error: "Slow down! Too many messages." },
  standardHeaders: true,
  legacyHeaders: false,
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  message: { error: "AI rate limit reached. Please wait." },
  standardHeaders: true,
  legacyHeaders: false,
});
// ──────────────────────────────────────────────────────────────────────────

app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/messages", messageLimiter, messageRoutes);
app.use("/api/users", userRoutes);
app.use("/api/ai", aiLimiter, aiRoutes);
app.use("/api/groups", groupRoutes);

app.use(express.static(path.join(__dirname, "/frontend/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
});

server.listen(PORT, () => {
  connectToMongoDb();
  console.log(`Server Running on : http://localhost:${PORT}/`);
});

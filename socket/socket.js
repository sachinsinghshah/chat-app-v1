import { Server } from "socket.io";
import http from "http";
import express from "express";
import Group from "../backend/models/group.model.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
  },
});

export const getReceiverSocketId = (receiverId) => userSocketMap[receiverId];

const userSocketMap = {};

io.on("connection", async (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId && userId !== "undefined") {
    userSocketMap[userId] = socket.id;

    // Join all group rooms this user belongs to
    try {
      const groups = await Group.find({ members: userId }).select("_id");
      groups.forEach((g) => socket.join(`group_${g._id}`));
    } catch (_) {}
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // ── Group management ────────────────────────────────────────────────────
  socket.on("joinGroup", ({ groupId }) => {
    socket.join(`group_${groupId}`);
  });

  socket.on("leaveGroup", ({ groupId }) => {
    socket.leave(`group_${groupId}`);
  });

  // ── Typing indicators ────────────────────────────────────────────────────
  socket.on("typing", ({ receiverId, groupId }) => {
    if (groupId) {
      socket.to(`group_${groupId}`).emit("typing", { senderId: userId, groupId });
    } else {
      const sid = userSocketMap[receiverId];
      if (sid) io.to(sid).emit("typing", { senderId: userId });
    }
  });

  socket.on("stopTyping", ({ receiverId, groupId }) => {
    if (groupId) {
      socket.to(`group_${groupId}`).emit("stopTyping", { senderId: userId, groupId });
    } else {
      const sid = userSocketMap[receiverId];
      if (sid) io.to(sid).emit("stopTyping", { senderId: userId });
    }
  });

  // ── Reactions ────────────────────────────────────────────────────────────
  socket.on("messageReaction", ({ receiverId, groupId, messageId, reactions }) => {
    if (groupId) {
      socket.to(`group_${groupId}`).emit("messageReaction", { messageId, reactions });
    } else {
      const sid = userSocketMap[receiverId];
      if (sid) io.to(sid).emit("messageReaction", { messageId, reactions });
    }
  });

  // ── Delete ───────────────────────────────────────────────────────────────
  socket.on("messageDeleted", ({ receiverId, groupId, messageId }) => {
    if (groupId) {
      socket.to(`group_${groupId}`).emit("messageDeleted", { messageId });
    } else {
      const sid = userSocketMap[receiverId];
      if (sid) io.to(sid).emit("messageDeleted", { messageId });
    }
  });

  // ── Edit ─────────────────────────────────────────────────────────────────
  socket.on("messageEdited", ({ receiverId, groupId, messageId, message, editedAt }) => {
    if (groupId) {
      socket.to(`group_${groupId}`).emit("messageEdited", { messageId, message, editedAt });
    } else {
      const sid = userSocketMap[receiverId];
      if (sid) io.to(sid).emit("messageEdited", { messageId, message, editedAt });
    }
  });

  // ── Read receipts ────────────────────────────────────────────────────────
  socket.on("messagesRead", ({ senderId }) => {
    const sid = userSocketMap[senderId];
    if (sid) io.to(sid).emit("messagesRead", { readBy: userId });
  });

  socket.on("disconnect", () => {
    if (userId && userId !== "undefined") {
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }
  });
});

export { app, io, server };

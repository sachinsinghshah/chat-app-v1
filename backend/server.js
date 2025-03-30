import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import messageRoutes from "./routes/message.routes.js";
import userRoutes from "./routes/user.routes.js";
import { connectToMongoDb } from "./db/connectToMongoDB.js";
import cookieParser from "cookie-parser";
import { app, server } from "../socket/socket.js";
const PORT = process.env.PORT || 5000;
dotenv.config();
app.use(cookieParser());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);
// app.get("/", (req, res) => {
//   res.send("Hello bro");
// });

server.listen(PORT, () => {
  connectToMongoDb();
  console.log(`Server Running on : http://localhost:${PORT}/`);
});

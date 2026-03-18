import express from "express";
import {
  getMessages,
  sendMessage,
  deleteMessage,
  reactToMessage,
  markMessagesAsRead,
} from "../controllers/message.controller.js";
import protectRoute from "../middleware/protectRoute.js";
const router = express.Router();

router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, sendMessage);
router.delete("/:id", protectRoute, deleteMessage);
router.post("/react/:id", protectRoute, reactToMessage);
router.patch("/read/:id", protectRoute, markMessagesAsRead);

export default router;

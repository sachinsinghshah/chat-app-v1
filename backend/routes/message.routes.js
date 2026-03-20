import express from "express";
import {
  getMessages,
  sendMessage,
  deleteMessage,
  reactToMessage,
  markMessagesAsRead,
  editMessage,
  searchMessages,
} from "../controllers/message.controller.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

// search must come before /:id to avoid being matched as an id
router.get("/search", protectRoute, searchMessages);
router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, sendMessage);
router.delete("/:id", protectRoute, deleteMessage);
router.patch("/:id/edit", protectRoute, editMessage);
router.post("/react/:id", protectRoute, reactToMessage);
router.patch("/read/:id", protectRoute, markMessagesAsRead);

export default router;

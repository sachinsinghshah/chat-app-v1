import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import {
  createGroup,
  getMyGroups,
  getGroupMessages,
  sendGroupMessage,
  addMember,
  leaveGroup,
} from "../controllers/group.controller.js";

const router = express.Router();

router.get("/", protectRoute, getMyGroups);
router.post("/", protectRoute, createGroup);
router.get("/:id/messages", protectRoute, getGroupMessages);
router.post("/:id/messages", protectRoute, sendGroupMessage);
router.post("/:id/members", protectRoute, addMember);
router.delete("/:id/leave", protectRoute, leaveGroup);

export default router;

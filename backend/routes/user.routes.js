import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import {
  getUserForSidebar,
  updateProfile,
  blockUser,
  unblockUser,
  getBlockedUsers,
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/", protectRoute, getUserForSidebar);
router.put("/update-profile", protectRoute, updateProfile);
router.get("/blocked", protectRoute, getBlockedUsers);
router.post("/block/:id", protectRoute, blockUser);
router.delete("/block/:id", protectRoute, unblockUser);

export default router;

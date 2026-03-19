import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import { getUserForSidebar, updateProfile } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/", protectRoute, getUserForSidebar);
router.put("/update-profile", protectRoute, updateProfile);

export default router;
